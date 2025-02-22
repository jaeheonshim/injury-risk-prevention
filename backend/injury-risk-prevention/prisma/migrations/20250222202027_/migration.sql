-- CreateTable
CREATE TABLE "Injury" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "season" INTEGER NOT NULL,
    "playerId" TEXT NOT NULL,
    CONSTRAINT "Injury_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "WizardData" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
