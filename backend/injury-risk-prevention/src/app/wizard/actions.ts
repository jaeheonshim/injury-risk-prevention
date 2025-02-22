'use server'

import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

const WIZARD_SESSION_COOKIE = 'wizard_session_id';

export async function getWizardData() {
    const cookieStore = await cookies();
    const dataId = cookieStore.get(WIZARD_SESSION_COOKIE)?.value;

    if(!dataId) {
        return null;
    }

    const wizardData = await prisma.wizardData.findUnique({
        where: {
            id: dataId,
        },
    });

    return wizardData;
}