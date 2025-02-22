'use client'

import { useEffect, useState } from "react";
import { getWizardData, saveWizardData } from "./actions";
import { Position, WizardData } from "@prisma/client";
import { randomUUID } from "crypto";

enum WizardStage {
    WELCOME = 0,
    AGE = 1,
    HEIGHT_WEIGHT = 2,
    POSITION = 3,
    COMPLETED = 4,
}

const positionMap: Record<string, string> = {
    C: "Center",
    LS: "Long Snapper",
    LB: "Line Backer",
    RB: "Running Back",
    G: "Guard",
    WR: "Wide Receiver",
    CB: "Corner Back",
    DE: "Defensive End",
    TE: "Tight End",
    S: "Safety",
    DT: "Defensive Tackle",
    K: "Kicker",
    P: "Punter",
    QB: "Quarterback",
    T: "Offensive Tackle"
};

export default function Wizard() {
    const [wizardState, setWizardState] = useState<WizardData>({
        id: crypto.randomUUID(),
        age: null,
        height: null,
        weight: null,
        pos: null
    });
    const [wizardStage, setWizardStage] = useState<WizardStage>();
    const [loading, setLoading] = useState<boolean>(true);

    async function loadWizardData() {
        const wizardData = await getWizardData();

        if(wizardData) {
            setWizardState(wizardData);
            setWizardStage(getWizardStage(wizardData));
        } else {
            setWizardStage(WizardStage.WELCOME);
        }

        setLoading(false);
    }

    function setWizardStateProperty<T extends keyof WizardData>(property: T, value: WizardData[T]) {
        setWizardState(prevState => ({
            ...prevState,
            [property]: value
        }));
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

    function nextStage() {
        setLoading(true);

        saveWizardData(wizardState).then(() => {
            if(wizardStage) {
                if(wizardStage + 1 >= WizardStage.COMPLETED) {
                    // done with the wizard!
                } else {
                    setWizardStage(wizardStage + 1);
                }
            } else {
                setWizardStage(WizardStage.AGE);
            }
        }).catch(e => {
            alert(e);
        }).finally(() => {
            setLoading(false);
        })
    }

    function prevStage() {
        if(wizardStage) {
            if(wizardStage - 1 > WizardStage.WELCOME) setWizardStage(wizardStage - 1);
        }
    }

    useEffect(() => {
        // Check if the user was already working on filling out a wizard
        loadWizardData();
    }, []);

    return <div className="wizard-container">
        <h2>Welcome to the wizard!</h2>
        <form action={nextStage}>
            {loading &&
            <p>
                Loading... (this indicator should be replaced with an overlay)
            </p>
            }

            { wizardStage === WizardStage.WELCOME && 
                <div>

                </div>
            }

            {wizardStage === WizardStage.AGE && (
                <div>
                    <label htmlFor="age">What is your age?</label>
                    <input
                        type="number"
                        name="age"
                        min="0"
                        value={wizardState.age ?? ""}
                        onChange={(e) => setWizardStateProperty("age", Number(e.target.value))}
                        required
                    />
                </div>
            )}

            {wizardStage === WizardStage.HEIGHT_WEIGHT && (
                <div>
                    <label htmlFor="height">Height:</label>
                    <input
                        type="number"
                        name="heightFeet"
                        min="0"
                        placeholder="ft"
                        value={wizardState.height ? Math.floor(wizardState.height / 12) : ""}
                        onChange={(e) => {
                            const feet = Number(e.target.value) * 12;
                            const inches = wizardState.height ? wizardState.height % 12 : 0;
                            setWizardStateProperty("height", feet + inches);
                        }}
                    />
                    <input
                        type="number"
                        name="heightInches"
                        min="0"
                        max="11"
                        placeholder="in"
                        value={wizardState.height ? wizardState.height % 12 : ""}
                        onChange={(e) => {
                            const inches = Number(e.target.value);
                            const feet = wizardState.height ? Math.floor(wizardState.height / 12) * 12 : 0;
                            setWizardStateProperty("height", feet + inches);
                        }}
                    />
                    <label htmlFor="weight">Weight (lbs):</label>
                    <input
                        name="weight"
                        type="number"
                        min="0"
                        value={wizardState.weight ?? ""}
                        onChange={(e) => setWizardStateProperty("weight", Number(e.target.value))}
                    />
                </div>
            )}

            { wizardStage === WizardStage.POSITION && 
                <div>
                    <label htmlFor="position">What is your position?</label>
                    <select name="position"
                        defaultValue={wizardState.pos ?? ""}
                        onChange={(e) => setWizardStateProperty("pos", e.target.value as keyof typeof Position)}
                    >
                        <option value="">Select your position</option>
                        {Object.keys(Position).map((key) => (
                            <option key={key} value={key}>{positionMap[key]} ({key})</option>
                        ))}
                    </select>
                </div>
            }
            
            <button type="button">Start Over</button>
            <button type="button" onClick={prevStage} disabled={(wizardStage ?? 0) <= WizardStage.AGE}>Back</button> 
            <button type="submit">Next</button>
        </form>
    </div>
}