'use client'

import { useEffect, useState } from "react";
import { getWizardData } from "./actions";
import { WizardData } from "@prisma/client";
import { randomUUID } from "crypto";

enum WizardStage {
    WELCOME = 0,
    AGE = 1,
    HEIGHT_WEIGHT = 2,
    COMPLETED = 3,
    LENGTH = 4
}

function WelcomeStage({ nextStage }: { nextStage: () => void }) {
    return (
        <div>
            <h2>Welcome to the wizard!</h2>
            <button onClick={() => nextStage()}>Next</button>
        </div>
    );
}

export default function Wizard() {
    const [wizardState, setWizardState] = useState<WizardData>();
    const [wizardStage, setWizardStage] = useState<WizardStage>(WizardStage.WELCOME);

    async function loadWizardData() {
        const wizardData = await getWizardData();
        if(wizardData) {
            setWizardState(wizardData);
            setWizardStage(getWizardStage(wizardData));
        } else {
            setWizardState({
                id: crypto.randomUUID(),
                age: null,
                height: null,
                weight: null,
                pos: null
            });
            setWizardStage(WizardStage.WELCOME);
        }
    }

    function getWizardStage(wizardData: WizardData) {
        // return the appropriate wizard stage depending on which fields are null

        if(!wizardData.age) {
            return WizardStage.AGE;
        }

        if(!wizardData.height || !wizardData.weight) {
            return WizardStage.HEIGHT_WEIGHT;
        }

        return WizardStage.COMPLETED;
    }

    function nextStage(formData: FormData) {
        if(wizardStage) {
            if(wizardStage + 1 >= WizardStage.COMPLETED) {
                // done with the wizard!
            } else {
                setWizardStage(wizardStage + 1);
            }
        } else {
            setWizardStage(WizardStage.AGE);
        }
    }

    useEffect(() => {
        // Check if the user was already working on filling out a wizard
        loadWizardData();
    }, []);

    return <div>
        <h2>Welcome to the wizard!</h2>
        <form action={nextStage}>
            { wizardStage === WizardStage.WELCOME && 
                <div>
                    <button type="submit">Let's get started!</button>
                </div>
            }
            { wizardStage === WizardStage.AGE && 
                <div>
                    First, what is your age?
                    <input type="number" />
                    <button type="submit">Next</button>
                </div>
            }
        </form>
    </div>
}