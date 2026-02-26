-- CreateEnum
CREATE TYPE "admin"."AdminStatus" AS ENUM ('ACTIVE', 'PENDING');

-- AlterTable
ALTER TABLE "admin"."Admin" ADD COLUMN     "status" "admin"."AdminStatus" NOT NULL DEFAULT 'PENDING';
