-- CreateTable

CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE "content" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "embedding" vector,

    CONSTRAINT "content_pkey" PRIMARY KEY ("id")
);
