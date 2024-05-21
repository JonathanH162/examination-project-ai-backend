import { FastifyInstance } from "fastify";
import { postQuestionHandler, postFileHandler } from "./content.controller";

async function contentRoute(server: FastifyInstance) {
  server.post("/question", postQuestionHandler);
  server.post("/add-files", postFileHandler);
}

export default contentRoute;
