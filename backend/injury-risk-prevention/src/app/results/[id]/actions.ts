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