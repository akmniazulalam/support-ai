-- CreateEnum
CREATE TYPE "DevelopmentCheckoutStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELED');

-- CreateTable
CREATE TABLE "DevelopmentCheckout" (
    "id" TEXT NOT NULL,
    "checkoutId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "targetPlan" "SubscriptionPlan" NOT NULL,
    "status" "DevelopmentCheckoutStatus" NOT NULL DEFAULT 'PENDING',
    "activeWorkspaceId" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DevelopmentCheckout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DevelopmentCheckout_checkoutId_key" ON "DevelopmentCheckout"("checkoutId");

-- A nullable key allows historical checkouts while ensuring each workspace has
-- at most one checkout that can still be completed.
CREATE UNIQUE INDEX "DevelopmentCheckout_activeWorkspaceId_key" ON "DevelopmentCheckout"("activeWorkspaceId");

-- CreateIndex
CREATE INDEX "DevelopmentCheckout_workspaceId_status_idx" ON "DevelopmentCheckout"("workspaceId", "status");

-- AddForeignKey
ALTER TABLE "DevelopmentCheckout" ADD CONSTRAINT "DevelopmentCheckout_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
