import Fastify from "fastify";
import contentRoute from "./modules/content/content.routes";
import fastifyMultipart from "@fastify/multipart";
import dotenv from "dotenv";
import express from "express";
import cors from "@fastify/cors";

const app = express();

const server = Fastify({
  logger: {
    transport: {
      target: "@fastify/one-line-logger",
    },
  },
});

server.register(fastifyMultipart, { limits: { files: 10 } });

dotenv.config();

server.get("/test", () => ({ status: "OK" }));
server.register(contentRoute, { prefix: "api/content" });

server.register(cors, {
  origin: "*",
  methods: ["POST"],
});

const startServer = async () => {
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
  });
  const PORT = 8000;
  try {
    await server.listen({ port: PORT, host: "0.0.0.0" });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
startServer();
