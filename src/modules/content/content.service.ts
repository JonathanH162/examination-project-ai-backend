import { prisma } from "../../utils";
import { OpenAI } from "langchain/llms/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { InputContent } from "./content.controller";
import { loadQAStuffChain } from "langchain/chains";
import { randomUUID } from "crypto";
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

interface FileArrayItem {
  filename: string;
  pdfText: string;
}

const embedd = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAPI_KEY,
});
const llm = new OpenAI({
  openAIApiKey: process.env.OPENAPI_KEY,
});
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
});

const chain = loadQAStuffChain(llm);

export const getAnswer = async (question: string) => {
  const vectorQuery: number[] = await embedd.embedQuery(question);
  try {
    const data: any = await prisma.$queryRaw`
    SELECT
        title,
      content,
      1 - (embedding <=> ${vectorQuery}::vector) as similarity
    FROM content
    where 1 - (embedding <=> ${vectorQuery}::vector) > .8
    ORDER BY  similarity DESC
    LIMIT 1;
  `;
    const concatenatedPageContent: string = data
      .map((item: any) => item.content)
      .join("");
    if (concatenatedPageContent) {
      const docs = [
        new Document({
          pageContent: concatenatedPageContent,
        }),
      ];
      const result = await chain.call({
        input_documents: docs,
        question: question,
      });
      if (result.text === "I don't know.") {
        return {
          result: "I'm sorry, I don't have an answer for that question.",
          question: question,
        };
      }
      return { result: result.text, question: question };
    }
    return {
      result: "I'm sorry, I don't have an answer for that question.",
      question: question,
    };
  } catch (error) {
    throw 500;
  }
};
export const createContent = async (body: InputContent) => {
  const id = randomUUID();
  const date = new Date();

  try {
    const test: number[] = await embedd.embedQuery(body.content);
    await prisma.$executeRaw`
        INSERT INTO content (id, title, content, embedding, created_at, updated_at)
          VALUES (${id}, ${body.title}, ${body.content}, ${test}::vector, ${date},${date} );`;

    return `Content created`;
  } catch (error) {
    throw 500;
  }
};

export const addFileToDatabase = async (textFileArray: FileArrayItem[]) => {
  try {
    const results = await Promise.all(
      textFileArray.map(async (file) => {
        let added = false;
        let counter = 0;
        const chunks = await textSplitter.createDocuments([file.pdfText]);

        const embeddingsArray = await embedd.embedDocuments(
          chunks.map((chunk) => chunk.pageContent.replace(/\n/g, " "))
        );
        for (let i = 0; i < chunks.length; i++) {
          const randomId = randomUUID();
          const date = new Date();
          const chunk = chunks[i];
          const databaseEntry = {
            title: `${file.filename}_chunk_${i}`,
            content: chunk.pageContent,
            embedding: embeddingsArray[i],
          };
          const match =
            await prisma.$executeRaw`SELECT * FROM content WHERE title = ${databaseEntry.title}`;
          if (!match) {
            await prisma.$executeRaw`
                    INSERT INTO content (id, title, content, embedding, created_at, updated_at)
                      VALUES (${randomId}, ${databaseEntry.title}, ${databaseEntry.content}, ${databaseEntry.embedding}::vector, ${date},${date} );`;
            added = true;
          }
        }
        if (added) {
          console.log(`Successfully added ${file.filename} to the database.`);
          counter++;
          return {
            message: `Successfully added ${file.filename} to the database.`,
          };
        } else {
          console.log(
            `${file.filename} does already exist in the database, nothing was added to the database.`
          );
          counter++;
          return {
            message: `${file.filename} does already exist in the database, nothing was added to the database.`,
          };
        }
      })
    );
    console.log(results.map((result) => result["message"])[0]);

    return results.map((result) => result["message"])[0];
  } catch (error) {
    throw 500;
  }
};
