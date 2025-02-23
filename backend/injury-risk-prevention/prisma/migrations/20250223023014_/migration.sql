-- CreateTable
CREATE TABLE "InferenceResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "predictedInjury" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "playerId" TEXT NOT NULL,
    CONSTRAINT "InferenceResult_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "WizardData" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "InferenceResult_playerId_key" ON "InferenceResult"("playerId");
