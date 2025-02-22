'use server'

import { prisma } from "@/lib/prisma"
import { Injury, WizardData } from "@prisma/client";
import { cookies } from "next/headers"
import Wizard from "./page";

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
        include: { injuries: true },
    });

    return wizardData;
}

export async function saveWizardData(data: WizardData) {
    const cookieStore = await cookies();
    cookieStore.set(WIZARD_SESSION_COOKIE, data.id);

    await prisma.wizardData.upsert({
        where: { id: data.id },
        update: data,
        create: data
    });
}

export async function saveInjury(data: Injury) {
    await prisma.injury.create({
        data: data
    });
}

export async function deleteInjury(id: string) {
    await prisma.injury.delete({
        where: {id: id}
    });
}

export async function resetWizard() {
    const cookieStore = await cookies();
    const dataId = cookieStore.get(WIZARD_SESSION_COOKIE)?.value;

    if(dataId) {
        await prisma.wizardData.delete({
            where: { id: dataId }
        })
    }

    await cookieStore.delete(WIZARD_SESSION_COOKIE);
}