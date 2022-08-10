/*
  Warnings:

  - Added the required column `counter` to the `Authenticator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `credentialId` to the `Authenticator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fmt` to the `Authenticator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicKey` to the `Authenticator` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Authenticator" ADD COLUMN     "counter" INTEGER NOT NULL,
ADD COLUMN     "credentialId" TEXT NOT NULL,
ADD COLUMN     "fmt" TEXT NOT NULL,
ADD COLUMN     "publicKey" TEXT NOT NULL;
