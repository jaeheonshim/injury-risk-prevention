'use server'

import { prisma } from "@/lib/prisma"
import { Injury, WizardData } from "@prisma/client";
import { cookies } from "next/headers"


export async function getWizardData(id: string) {
    const wizardData = await prisma.wizardData.findUnique({
        where: {
            id: id,
        },
        include: { injuries: true },
    });

    return wizardData;
}

export async function getInferenceResult(wizardDataId: string) {
    const inferenceResult = await prisma.inferenceResult.findUnique({
        where: {
            wizardDataId: wizardDataId
        }
    });

    return inferenceResult;
}

export async function saveInferenceResult(wizardDataId: string, inferenceResult: any) {
    await prisma.inferenceResult.upsert({
        where: { wizardDataId: wizardDataId },
        update: {
            id: crypto.randomUUID(),
            predictions: inferenceResult,
            wizardDataId: wizardDataId
        },
        create: {
            id: crypto.randomUUID(),
            predictions: inferenceResult,
            wizardDataId: wizardDataId
        }
    });

    return inferenceResult;
}

export async function runInference(wizardData: any) {
    const response = await fetch("/api/inference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(wizardData),
    });

    return response.json();
}