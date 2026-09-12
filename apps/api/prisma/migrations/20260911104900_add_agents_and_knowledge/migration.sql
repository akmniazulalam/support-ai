-- CreateEnum
CREATE TYPE "KnowledgeSourceType" AS ENUM ('TEXT', 'FAQ', 'WEBSITE');

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "greeting" TEXT,
    "instructions" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeSource" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "type" "KnowledgeSourceType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "sourceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Agent_workspaceId_idx" ON "Agent"("workspaceId");

-- CreateIndex
CREATE INDEX "Agent_workspaceId_isActive_idx" ON "Agent"("workspaceId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_workspaceId_slug_key" ON "Agent"("workspaceId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_id_workspaceId_key" ON "Agent"("id", "workspaceId");

-- CreateIndex
CREATE INDEX "KnowledgeSource_workspaceId_idx" ON "KnowledgeSource"("workspaceId");

-- CreateIndex
CREATE INDEX "KnowledgeSource_agentId_idx" ON "KnowledgeSource"("agentId");

-- CreateIndex
CREATE INDEX "KnowledgeSource_workspaceId_agentId_idx" ON "KnowledgeSource"("workspaceId", "agentId");

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeSource" ADD CONSTRAINT "KnowledgeSource_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeSource" ADD CONSTRAINT "KnowledgeSource_agentId_workspaceId_fkey" FOREIGN KEY ("agentId", "workspaceId") REFERENCES "Agent"("id", "workspaceId") ON DELETE CASCADE ON UPDATE CASCADE;
