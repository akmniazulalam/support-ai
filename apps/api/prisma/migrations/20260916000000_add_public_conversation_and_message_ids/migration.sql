-- Public chat must never expose database CUIDs. Add externally safe UUIDs and
-- backfill existing records before enforcing non-null, unique identifiers.
ALTER TABLE "Conversation" ADD COLUMN "publicId" TEXT;
UPDATE "Conversation"
SET "publicId" = gen_random_uuid()::text
WHERE "publicId" IS NULL;
ALTER TABLE "Conversation" ALTER COLUMN "publicId" SET NOT NULL;

ALTER TABLE "Message" ADD COLUMN "publicId" TEXT;
UPDATE "Message"
SET "publicId" = gen_random_uuid()::text
WHERE "publicId" IS NULL;
ALTER TABLE "Message" ALTER COLUMN "publicId" SET NOT NULL;

CREATE UNIQUE INDEX "Conversation_publicId_key" ON "Conversation"("publicId");
CREATE UNIQUE INDEX "Message_publicId_key" ON "Message"("publicId");
