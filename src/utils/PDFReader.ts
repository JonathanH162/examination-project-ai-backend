import { MultipartFile } from "@fastify/multipart";
import fs from "fs/promises";
import PDFParser from "pdf-parse";

interface FileArrayItem {
  filename: string;
  pdfText: string;
}

export const PDFReader = async (
  files: AsyncIterableIterator<MultipartFile>
) => {
  try {
    const filesArray: FileArrayItem[] = [];

    for await (const file of files) {
      const tempFilePath = "temp.pdf";
      await fs.writeFile(tempFilePath, file.file);

      const pdfData = await fs.readFile(tempFilePath);
      const pdfText = await PDFParser(pdfData).then((data) => data.text);
      filesArray.push({ filename: file.filename, pdfText: pdfText });
      await fs.unlink(tempFilePath);
    }
    return filesArray;
  } catch (error) {
    console.log("Error: ", error);
  }
};
