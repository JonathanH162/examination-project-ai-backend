import { FastifyRequest } from "fastify";
import { addFileToDatabase, createContent, getAnswer } from "./content.service";
import { PDFReader } from "../../utils/PDFReader";

export interface InputContent {
  title: string;
  content: string;
}
export interface InputPromt {
  question: string;
}
interface FileArrayItem {
  filename: string;
  pdfText: string;
}
export const postQuestionHandler = async (
  req: FastifyRequest<{ Body: InputPromt }>
) => {
  const answer = await getAnswer(req.body.question);
  return answer;
};

export const postFileHandler = async (req: FastifyRequest) => {
  const files = req.files();
  const textFileArray: FileArrayItem[] | undefined = await PDFReader(files);
  const response = await addFileToDatabase(textFileArray!);
  return response;
};
