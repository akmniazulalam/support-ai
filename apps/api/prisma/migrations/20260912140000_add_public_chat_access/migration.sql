-- Add a safe public identifier to existing agents before enforcing the constraint.
ALTER TABLE "Agent" ADD COLUMN "publicId" TEXT;
UPDATE "Agent"
SET "publicId" = gen_random_uuid()::text
WHERE "publicId" IS NULL;
ALTER TABLE "Agent" ALTER COLUMN "publicId" SET NOT NULL;

-- Public conversations store only a one-way hash of their customer session token.
ALTER TABLE "Conversation" ADD COLUMN "customerSessionTokenHash" TEXT;

CREATE UNIQUE INDEX "Agent_publicId_key" ON "Agent"("publicId");
CREATE UNIQUE INDEX "Conversation_customerSessionTokenHash_key"
ON "Conversation"("customerSessionTokenHash");
