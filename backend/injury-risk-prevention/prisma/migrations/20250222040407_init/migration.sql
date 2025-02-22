-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WizardData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "age" INTEGER,
    "height" REAL,
    "weight" REAL,
    "pos" TEXT
);
INSERT INTO "new_WizardData" ("age", "height", "id", "pos", "weight") SELECT "age", "height", "id", "pos", "weight" FROM "WizardData";
DROP TABLE "WizardData";
ALTER TABLE "new_WizardData" RENAME TO "WizardData";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
