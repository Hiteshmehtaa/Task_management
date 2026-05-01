/*
  Warnings:

  - A unique constraint covering the columns `[projectKey]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `projectKey` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secretKey` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JoinRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('JOIN_REQUEST_RECEIVED', 'JOIN_REQUEST_APPROVED', 'JOIN_REQUEST_REJECTED', 'TASK_ASSIGNED');

-- Backfill support for existing data
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "projectKey" TEXT,
ADD COLUMN     "secretKey" TEXT;

WITH numbered_projects AS (
  SELECT
    id,
    row_number() OVER (ORDER BY "createdAt", id) AS rn
  FROM "Project"
)
UPDATE "Project" AS project
SET
  "projectKey" = concat(
    COALESCE(NULLIF(left(regexp_replace(upper(project.name), '[^A-Z0-9]', '', 'g'), 3), ''), 'PRJ'),
    '-',
    lpad(to_hex(numbered_projects.rn), 4, '0')
  ),
  "secretKey" = crypt(substr(md5(random()::text || project.id), 1, 12), gen_salt('bf', 10))
FROM numbered_projects
WHERE project.id = numbered_projects.id;

ALTER TABLE "Project"
ALTER COLUMN "projectKey" SET NOT NULL,
ALTER COLUMN "secretKey" SET NOT NULL;

-- CreateTable
CREATE TABLE "JoinRequest" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "JoinRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JoinRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JoinRequest_projectId_userId_key" ON "JoinRequest"("projectId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_projectId_userId_key" ON "ProjectMember"("projectId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_projectKey_key" ON "Project"("projectKey");

-- AddForeignKey
ALTER TABLE "JoinRequest" ADD CONSTRAINT "JoinRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JoinRequest" ADD CONSTRAINT "JoinRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
