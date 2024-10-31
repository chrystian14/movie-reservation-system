/*
  Warnings:

  - You are about to drop the column `columns` on the `rooms` table. All the data in the column will be lost.
  - You are about to drop the column `rows` on the `rooms` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "rooms" DROP COLUMN "columns",
DROP COLUMN "rows";
