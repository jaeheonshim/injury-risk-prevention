-- CreateTable
CREATE TABLE "InferenceResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "predictions" JSONB NOT NULL,
    "wizardDataId" TEXT NOT NULL,
    CONSTRAINT "InferenceResult_wizardDataId_fkey" FOREIGN KEY ("wizardDataId") REFERENCES "WizardData" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "InferenceResult_wizardDataId_key" ON "InferenceResult"("wizardDataId");
