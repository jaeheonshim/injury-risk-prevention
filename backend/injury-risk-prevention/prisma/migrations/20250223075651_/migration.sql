-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InferenceResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "predictions" JSONB NOT NULL,
    "wizardDataId" TEXT NOT NULL,
    CONSTRAINT "InferenceResult_wizardDataId_fkey" FOREIGN KEY ("wizardDataId") REFERENCES "WizardData" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_InferenceResult" ("id", "predictions", "wizardDataId") SELECT "id", "predictions", "wizardDataId" FROM "InferenceResult";
DROP TABLE "InferenceResult";
ALTER TABLE "new_InferenceResult" RENAME TO "InferenceResult";
CREATE UNIQUE INDEX "InferenceResult_wizardDataId_key" ON "InferenceResult"("wizardDataId");
CREATE TABLE "new_Injury" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "season" INTEGER NOT NULL,
    "playerId" TEXT NOT NULL,
    CONSTRAINT "Injury_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "WizardData" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Injury" ("id", "playerId", "season", "type") SELECT "id", "playerId", "season", "type" FROM "Injury";
DROP TABLE "Injury";
ALTER TABLE "new_Injury" RENAME TO "Injury";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
