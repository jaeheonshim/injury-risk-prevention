/*
  Warnings:

  - You are about to drop the column `reps` on the `WizardData` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WizardData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "age" INTEGER,
    "height" REAL,
    "weight" REAL,
    "forty" REAL,
    "bench" INTEGER,
    "vertical" REAL,
    "pos" TEXT
);
INSERT INTO "new_WizardData" ("age", "forty", "height", "id", "pos", "vertical", "weight") SELECT "age", "forty", "height", "id", "pos", "vertical", "weight" FROM "WizardData";
DROP TABLE "WizardData";
ALTER TABLE "new_WizardData" RENAME TO "WizardData";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
