-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('CANVAS', 'STUDIO');

-- AlterTable
ALTER TABLE "project" ADD COLUMN     "type" "ProjectType" NOT NULL DEFAULT 'CANVAS',
ADD COLUMN     "workspaceId" TEXT;

-- AlterTable
ALTER TABLE "workflow_run" ADD COLUMN     "workflowDefinitionId" TEXT;

-- CreateTable
CREATE TABLE "workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_definition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "nodes" JSON NOT NULL,
    "edges" JSON NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_definition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workspace_userId_idx" ON "workspace"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_userId_slug_key" ON "workspace"("userId", "slug");

-- CreateIndex
CREATE INDEX "workflow_definition_userId_projectId_idx" ON "workflow_definition"("userId", "projectId");

-- CreateIndex
CREATE INDEX "workflow_definition_projectId_idx" ON "workflow_definition"("projectId");

-- CreateIndex
CREATE INDEX "project_workspaceId_type_idx" ON "project"("workspaceId", "type");

-- CreateIndex
CREATE INDEX "workflow_run_workflowDefinitionId_idx" ON "workflow_run"("workflowDefinitionId");

-- AddForeignKey
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_definition" ADD CONSTRAINT "workflow_definition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_definition" ADD CONSTRAINT "workflow_definition_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_run" ADD CONSTRAINT "workflow_run_workflowDefinitionId_fkey" FOREIGN KEY ("workflowDefinitionId") REFERENCES "workflow_definition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
