-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- Existing and future accounts default to ordinary user access. Admin status is
-- intentionally assigned only through trusted server-side/database operations.
ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';
