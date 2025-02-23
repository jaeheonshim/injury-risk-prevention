'use client'

import { useEffect, useState } from "react";
import { getWizardData, resetWizard, saveInjury, deleteInjury, saveWizardData } from "./actions";
import { Injury, InjuryType, Position, WizardData } from "@prisma/client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { positionMap } from "@/util/helpers";

enum WizardStage {
    WELCOME = 0,
    AGE = 1,
    HEIGHT_WEIGHT = 2,
    POSITION = 3,
    COMBINE = 4,
    PAST_INJURIES = 5,
    REVIEW = 6,
    COMPLETED = 7,
}

const inputClass = "w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400";

const initialWizardState = {
    id: crypto.randomUUID(),
    age: null,
    height: null,
    weight: null,
    pos: null,
    forty: null,
    bench: null,
    vertical: null
};

export default function Wizard() {
    const router = useRouter();

    const [wizardState, setWizardState] = useState<WizardData>(initialWizardState);
    const [wizardStage, setWizardStage] = useState<WizardStage>();
    const [direction, setDirection] = useState(1);
    const [loading, setLoading] = useState<boolean>(true);

    const [injuries, setInjuries] = useState<Injury[]>([]);
    const [currentInjurySeason, setCurrentInjurySeason] = useState<number | null>();
    const [currentInjuryType, setCurrentInjuryType] = useState<InjuryType | null>();

    async function loadWizardData() {
        const wizardData: any = await getWizardData();
        
        if (wizardData) {
            const { injuries, ...wizardDataWithoutInjuries } = wizardData;
            setWizardState(wizardDataWithoutInjuries);
            setInjuries(wizardData.injuries)
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
        if (!wizardData.age) {
            return WizardStage.AGE;
        }

        if (!wizardData.height || !wizardData.weight) {
            return WizardStage.HEIGHT_WEIGHT;
        }

        if (!wizardData.pos) {
            return WizardStage.POSITION;
        }

        if (!wizardData.forty || !wizardData.bench || !wizardData.vertical) {
            return WizardStage.COMBINE;
        }

        return WizardStage.REVIEW;
    }

    function startOver() {
        resetWizard().then(router.refresh);
        setWizardState(initialWizardState);
        setWizardStage(WizardStage.WELCOME);
    }

    function nextStage() {
        setLoading(true);

        saveWizardData(wizardState).then(() => {
            if (wizardStage) {
                if (wizardStage + 1 >= WizardStage.COMPLETED) {
                    router.push(`/results/${wizardState.id}`); // Navigate to the results page
                } else {
                    setWizardStage(wizardStage + 1);
                    setDirection(1);
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
        if (wizardStage) {
            if (wizardStage - 1 > WizardStage.WELCOME) {
                setWizardStage(wizardStage - 1);
                setDirection(-1);
            }
        }
    }

    function saveCurrentInjury() {
        if(!currentInjurySeason) {
            alert("Please enter the injury season!");
            return;
        }

        if(!currentInjuryType) {
            alert("Please select the injury type!");
            return;
        }

        const injury = {
            id: crypto.randomUUID(),
            season: currentInjurySeason!,
            type: currentInjuryType!,
            playerId: wizardState.id
        };
        
        saveInjury(injury)
        setInjuries(prev => (
            [...prev, injury]
        ));

        setCurrentInjurySeason(null);
        setCurrentInjuryType(null);
    }

    function deleteSelectedInjury(id: string) {
        setInjuries((prevInjuries) => prevInjuries.filter(injury => injury.id !== id));
        deleteInjury(id)
        
    }

    useEffect(() => {
        loadWizardData();
    }, []);

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction > 0 ? -300 : 300,
            opacity: 0,
        }),
    };

    const progressBarWidth = ((wizardStage ?? 0) / (WizardStage.REVIEW)) * 100;
    const progressPercentage = Math.round(progressBarWidth);

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-3xl">
                <div className="relative w-full h-2 bg-gray-200 rounded-full mb-4">
                    <div
                        className="absolute top-0 left-0 h-full bg-orange-500 rounded-full"
                        style={{ width: `${progressBarWidth}%` }}
                    ></div>
                </div>
                <div className="text-right mb-4 text-gray-600">
                    {progressPercentage}% Complete
                </div>
                <motion.div
                    key={wizardStage}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="w-full bg-white rounded-lg shadow p-8 flex flex-col"
                >
                    <form action={nextStage} className="flex flex-col h-full">
                        <div className="flex-grow">
                            {loading && (
                                <div className="flex justify-center items-center h-full">
                                    <div className="spinner"></div>
                                </div>
                            )}

                            {!loading && wizardStage === WizardStage.WELCOME && (
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold mb-4">Welcome to your very own personal assistant!</h2>
                                    <p className="mb-4">We are here to help you prevent injuries!</p>
                                </div>
                            )}

                            {!loading && wizardStage === WizardStage.AGE && (
                                <div className="mb-4">
                                    <h3 className="text-xl font-semibold mb-2">Personal Information</h3>
                                    <label htmlFor="age" className="block mb-2">What is your age?</label>
                                    <input
                                        type="number"
                                        name="age"
                                        min="0"
                                        value={wizardState.age ?? ""}
                                        onChange={(e) => setWizardStateProperty("age", Number(e.target.value))}
                                        required
                                        className={inputClass}
                                    />
                                </div>
                            )}

                            {!loading && wizardStage === WizardStage.HEIGHT_WEIGHT && (
                                <div className="mb-4">
                                    <h3 className="text-xl font-semibold mb-2">Physical Attributes</h3>
                                    <label htmlFor="height" className="block mb-2">Height:</label>
                                    <div className="flex gap-2 mb-2">
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
                                            className={inputClass + " w-full"}
                                            required
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
                                            className={inputClass + " w-full"}
                                            required
                                        />
                                    </div>
                                    <label htmlFor="weight" className="block mb-2">Weight (lbs):</label>
                                    <input
                                        name="weight"
                                        type="number"
                                        min="0"
                                        value={wizardState.weight ?? ""}
                                        onChange={(e) => setWizardStateProperty("weight", Number(e.target.value))}
                                        className={inputClass}
                                        required
                                    />
                                </div>
                            )}

                            {!loading && wizardStage === WizardStage.POSITION && (
                                <div className="mb-4">
                                    <h3 className="text-xl font-semibold mb-2">Position</h3>
                                    <label htmlFor="position" className="block mb-2">What is your position?</label>
                                    <select
                                        name="position"
                                        defaultValue={wizardState.pos ?? ""}
                                        onChange={(e) => setWizardStateProperty("pos", e.target.value as keyof typeof Position)}
                                        className={inputClass + " w-full"}
                                        required
                                    >
                                        <option value="">Select your position</option>
                                        {Object.keys(Position).map((key) => (
                                            <option key={key} value={key}>
                                                {positionMap[key]} ({key})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {!loading && wizardStage === WizardStage.COMBINE && (
                                <div className="mb-4">
                                    <h3 className="text-xl font-semibold mb-2">Player Physical Profile</h3>
                                    <p className="mb-4">
                                        Your physical profile, including attributes like speed, strength, and agility, can be a strong predictor of injury risk. By analyzing these factors, we can identify potential vulnerabilities and help you stay healthier on the field.
                                    </p>

                                    <label htmlFor="forty" className="block mb-2">40-yard dash time:</label>
                                    <input
                                        name="forty"
                                        type="number"
                                        placeholder="seconds"
                                        min="0"
                                        step="0.01"
                                        value={wizardState.forty ?? ""}
                                        onChange={(e) => setWizardStateProperty("forty", Number(e.target.value))}
                                        className={inputClass}
                                        required
                                    />

                                    <label htmlFor="bench" className="block mb-2">Reps benched:</label>
                                    <input
                                        name="bench"
                                        type="number"
                                        placeholder="reps"
                                        min="0"
                                        value={wizardState.bench ?? ""}
                                        onChange={(e) => setWizardStateProperty("bench", Number(e.target.value))}
                                        className={inputClass}
                                        required
                                    />

                                    <label htmlFor="vertical" className="block mb-2">Vertical Jump:</label>
                                    <input
                                        name="vertical"
                                        type="number"
                                        placeholder="inches"
                                        min="0"
                                        value={wizardState.vertical ?? ""}
                                        onChange={(e) => setWizardStateProperty("vertical", Number(e.target.value))}
                                        className={inputClass}
                                        required
                                    />
                                </div>
                            )}

                            {!loading && wizardStage === WizardStage.PAST_INJURIES && (
                                <div className="mb-4">
                                    <h3 className="text-2xl font-semibold mb-3">Past Injuries</h3>
                                    <p className="mb-4 text-gray-700">
                                        Your history of past injuries provides crucial insights into your overall durability and risk of future injuries. By analyzing patterns in previous injuries, we can identify potential weak points, track recovery trends, and develop strategies to minimize re-injury. Understanding your injury history helps us make smarter decisions to keep you performing at your best.
                                    </p>
                                    <p className="mb-4 text-gray-700">
                                        Please record all past sports-related injuries below, to the best of your ability.
                                    </p>

                                    {/* Past Injuries List */}
                                    <div className="mb-6">
                                        <h4 className="text-lg font-medium mb-2">Recorded Injuries</h4>
                                        <div className="border rounded-md p-4 bg-gray-50">
                                            {injuries.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {injuries.map((pastInjury, index) => (
                                                        <li 
                                                            key={pastInjury.id} 
                                                            className="flex items-center justify-between py-2 border-b last:border-b-0"
                                                        >
                                                            <span className="text-gray-800">
                                                                {pastInjury.season} - {pastInjury.type} Injury
                                                            </span>

                                                            <button
                                                                    type="button"
                                                                    className="cursor-pointer bg-orange-500 hover:bg-orange-400 text-white py-2 px-4 rounded"
                                                                    onClick={()=>deleteSelectedInjury(pastInjury.id)}
                                                            >-</button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-gray-500 italic">No past injuries recorded.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Injury Form */}
                                    <div className="border-t pt-4">
                                        <h4 className="text-lg font-medium mb-3">Add a New Injury</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {/* Season Input */}
                                            <div>
                                                <label htmlFor="season" className="block font-medium text-gray-700 mb-1">
                                                    Season
                                                </label>
                                                <input
                                                    name="season"
                                                    type="number"
                                                    placeholder="Year"
                                                    value={currentInjurySeason ?? ""}
                                                    onChange={(e) => setCurrentInjurySeason(parseInt(e.target.value))}
                                                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                                                />
                                            </div>

                                            {/* Injury Type Select */}
                                            <div>
                                                <label htmlFor="injury-type" className="block font-medium text-gray-700 mb-1">
                                                    Injury Type
                                                </label>
                                                <select
                                                    name="injury-type"
                                                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                                                    defaultValue={currentInjuryType as InjuryType}
                                                    onChange={(e) => setCurrentInjuryType(e.target.value as InjuryType)}
                                                >
                                                    <option value="">Select type</option>
                                                    {Object.keys(InjuryType).map((key) => (
                                                        <option key={key} value={key}>
                                                            {key}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Add Button */}
                                            <div className="flex items-end">
                                                <button
                                                    type="button"
                                                    className="w-full md:w-auto bg-orange-500 hover:bg-orange-400 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                                                    onClick={saveCurrentInjury}
                                                >
                                                    + Add Injury
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!loading && wizardStage === WizardStage.REVIEW && (
                                <div className="mb-4">
                                    <h3 className="text-xl font-semibold mb-2">Review Your Information</h3>
                                    <p className="mb-4">Please review your information before submitting:</p>
                                    <div className="mb-2">
                                        <strong>Age:</strong> {wizardState.age}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Height:</strong> {Math.floor((wizardState.height ?? 0) / 12)} ft {(wizardState.height ?? 0) % 12} in
                                    </div>
                                    <div className="mb-2">
                                        <strong>Weight:</strong> {wizardState.weight} lbs
                                    </div>
                                    <div className="mb-2">
                                        <strong>Position:</strong> {positionMap[wizardState.pos ?? ""]}
                                    </div>
                                    <div className="mb-2">
                                        <strong>40-yard dash time:</strong> {wizardState.forty} seconds
                                    </div>
                                    <div className="mb-2">
                                        <strong>Reps benched:</strong> {wizardState.bench} reps
                                    </div>
                                    <div className="mb-2">
                                        <strong>Vertical Jump:</strong> {wizardState.vertical} inches
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between">
                            <button
                                type="button"
                                onClick={startOver}
                                className="cursor-pointer bg-gray-500 hover:bg-gray-400 text-white py-2 px-4 rounded"
                            >
                                Start Over
                            </button>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={prevStage}
                                    disabled={(wizardStage ?? 0) <= WizardStage.AGE}
                                    className="cursor-pointer bg-gray-500 hover:bg-gray-400 text-white py-2 px-4 rounded disabled:opacity-50"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="cursor-pointer bg-orange-500 hover:bg-orange-400 text-white py-2 px-4 rounded"
                                >
                                    {wizardStage === WizardStage.REVIEW ? "Submit" : "Next"}
                                </button>
                            </div>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}