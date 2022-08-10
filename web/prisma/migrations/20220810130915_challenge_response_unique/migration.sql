/*
  Warnings:

  - A unique constraint covering the columns `[challenge]` on the table `Challenge` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Challenge_challenge_key" ON "Challenge"("challenge");
