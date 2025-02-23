'use server';

import { notFound } from "next/navigation";
import { getInferenceResult, getWizardData } from "./actions";
import ChatbotWidget from "./ChatbotWidget";
import { positionMap } from "@/util/helpers";

export default async function ResultsPage({ params }: { params: any }) {
    const { id } = await params;

    const wizardData = await getWizardData(id);
    const inferenceResult = await getInferenceResult(id);

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

    if(!wizardData) {
        notFound();
    }

    if(!inferenceResult) {
        return <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Navigation Bar */}
            <nav className="w-full bg-orange-500 text-white py-6 px-8 flex justify-between items-center shadow-md">
                <h1 className="text-3xl font-bold">Injury Risk Prevention</h1>
            </nav>

            <div className="flex-grow flex flex-col items-center justify-center p-8">
                Your results aren't quite ready yet. Please check back soon!
            </div>
        </div>
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Navigation Bar */}
            <nav className="w-full bg-orange-500 text-white py-6 px-8 flex justify-between items-center shadow-md">
                <h1 className="text-3xl font-bold">Injury Risk Prevention</h1>
            </nav>

            {/* Main Content */}
            <div className="flex-grow flex flex-col items-center justify-center p-8">
                <div className="w-full max-w-6xl bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-6">Your Injury Prediction Assessment</h1>

                    {/* Most Likely Injury Box */}
                    <div className="mb-8 p-4 bg-gray-50 border rounded-md">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Most Likely Body Part to Get Injured</h2>
                        <p className="text-gray-700">Ankle</p>
                    </div>

                    <div className="flex">
                        {/* Left Column */}
                        <div className="w-1/2 pr-4">
                            {/* Analysis Reason Box */}
                            <div className="mb-8 p-4 bg-gray-50 border rounded-md">
                                <h3 className="text-xl font-semibold mb-2">Your Stats</h3>
                                <p className="text-gray-700 mb-4">Age: {wizardData.age}</p>
                                <p className="text-gray-700 mb-4">Height: {Math.floor((wizardData.height ?? 0) / 12)} ft {(wizardData.height ?? 0) % 12}</p>
                                <p className="text-gray-700 mb-4">Weight: {wizardData.weight} lbs</p>
                                <p className="text-gray-700 mb-4">Position: {positionMap[wizardData.pos ?? ""]} ({wizardData.pos}) </p>
                                <p className="text-gray-700 mb-4">40-yard dash time: {wizardData.forty} seconds</p>
                                <p className="text-gray-700 mb-4">Reps benched: {wizardData.bench} rep(s)</p>
                                <p className="text-gray-700 mb-4">Vertical Jump: {wizardData.vertical} inches</p>
                            </div>

                            <div className="mb-8 p-4 bg-gray-50 border rounded-md">
                                <h3 className="text-xl font-semibold mb-2">Reason for Analysis</h3>
                                <p className="text-gray-700">The reason for your analysis is based on your physical attributes and past injury history.</p>
                            </div>

                            {/* Preventable Measures Box */}
                            <div className="mb-8 p-4 bg-gray-50 border rounded-md">
                                <h3 className="text-xl font-semibold mb-2">Preventable Measures</h3>
                                <p className="text-gray-700">To prevent injuries, ensure proper warm-up before exercises, maintain good posture, and follow a balanced training regimen.</p>
                            </div>
                        </div>

                        {/* Right Column - Chatbot */}
                        <ChatbotWidget />
                    </div>
                </div>
            </div>
        </div>
    );
};