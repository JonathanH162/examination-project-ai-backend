/*
  Warnings:

  - Made the column `embedding` on table `content` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "content" ALTER COLUMN "embedding" SET NOT NULL;
