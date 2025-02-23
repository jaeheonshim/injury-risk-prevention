'use server';

import { notFound } from "next/navigation";
import { getInferenceResult, getInjuryStatistics, getWizardData, runInference } from "./actions";
import ChatbotWidget from "./ChatbotWidget";
import { positionMap } from "@/util/helpers";
import InferenceWidget from "./InferenceWidget";
import InjuryBarChart from "./InjuryBarChart";
import { capitalizeString } from "@/util/util";
import { GoogleGenerativeAI } from "@google/generative-ai";
import InjuryHeatmap from "./InjuryHeatmap";
import InjuryScatterPlot from "./InjuryScatterPlot";
import InjuriesBoxplot from "./InjuriesBoxPlot";

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

    if (!wizardData) {
        notFound();
    }

    if (!inferenceResult) {
        return <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Navigation Bar */}
            <nav className="w-full bg-orange-500 text-white py-6 px-8 flex justify-between items-center shadow-md">
                <h1 className="text-3xl font-bold">Injury Risk Prevention</h1>
            </nav>

            <div className="flex-grow flex flex-col items-center justify-center p-8">
                <InferenceWidget wizardData={wizardData} />
            </div>
        </div>
    }

    const predictions = inferenceResult.predictions as Object;
    const sortedEntries = Object.entries(predictions).sort(([, a], [, b]) => b - a);
    const mostLikelyInjury = sortedEntries[0][0];

    const genAI = new GoogleGenerativeAI("REDACTED");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const reason = await model.generateContent(
        `You are a sports injury predictor. Here are the stats of the player you are analyzing

        - Age: ${wizardData.age}
        - Height: ${wizardData.height} inches
        - Weight: ${wizardData.weight} pounds
        - 40-yard dash time: ${wizardData.forty} seconds
        - Bench press reps (upper body strength): ${wizardData.bench} reps
        - Vertical jump (lower body strength): ${wizardData.vertical} inches
        - Past injuries: ${JSON.stringify((wizardData as any).injuries)}

        The predicted most likely injury is ${mostLikelyInjury}. Please generate a short reason for analysis.`)

    const preventative = await model.generateContent(
        `You are a sports injury predictor. Here are the stats of the player you are analyzing

        - Age: ${wizardData.age}
        - Height: ${wizardData.height} inches
        - Weight: ${wizardData.weight} pounds
        - 40-yard dash time: ${wizardData.forty} seconds
        - Bench press reps (upper body strength): ${wizardData.bench} reps
        - Vertical jump (lower body strength): ${wizardData.vertical} inches
        - Past injuries: ${JSON.stringify((wizardData as any).injuries)}

        The predicted most likely injury is ${mostLikelyInjury}. Please generate a short description of preventative measures. Do not list, just a short paragraph.`)

    const injuryStatistics = await getInjuryStatistics(wizardData.injuries.map(injury => injury.type));

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Navigation Bar */}
            <nav className="w-full bg-orange-500 text-white py-6 px-8 flex justify-between items-center shadow-md">
                <h1 className="text-3xl font-bold">InjuryShield</h1>
            </nav>

            {/* Main Content */}
            <div className="flex-grow flex flex-col items-center justify-center p-8">
                <div className="w-full max-w-8xl bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-6">Your Injury Prediction Assessment</h1>

                    {/* Most Likely Injury Box */}
                    <div className="mb-8 p-4 bg-gray-50 border rounded-md">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Most Likely Body Part to Get Injured</h2>
                        <p className="text-gray-700 text-4xl">{capitalizeString(mostLikelyInjury)}</p>
                    </div>

                    <div className="flex">
                        {/* Left Column */}
                        <div className="w-300 pr-4">
                            <div className="mb-8 p-4 bg-gray-50 border rounded-md">
                                <h3 className="text-xl font-semibold mb-2">Most Likely Injuries</h3>
                                <InjuryBarChart inferenceResult={inferenceResult} />
                            </div>

                            <div className="mb-8 p-6 bg-gray-50 border rounded-md shadow-sm">
                                <h3 className="text-2xl font-semibold mb-4 text-gray-800">Your Stats</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                                        <p className="text-gray-700"><span className="font-bold">Age:</span> {wizardData.age}</p>
                                    </div>
                                    <div className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                                        <p className="text-gray-700">
                                            <span className="font-bold">Height:</span> {Math.floor((wizardData.height ?? 0) / 12)} ft {(wizardData.height ?? 0) % 12} in
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                                        <p className="text-gray-700"><span className="font-bold">Weight:</span> {wizardData.weight} lbs</p>
                                    </div>
                                    <div className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                                        <p className="text-gray-700">
                                            <span className="font-bold">Position:</span> {positionMap[wizardData.pos ?? ""]} ({wizardData.pos})
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                                        <p className="text-gray-700">
                                            <span className="font-bold">40-yard Dash:</span> {wizardData.forty} s
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                                        <p className="text-gray-700">
                                            <span className="font-bold">Bench Press:</span> {wizardData.bench} rep(s)
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                                        <p className="text-gray-700">
                                            <span className="font-bold">Vertical Jump:</span> {wizardData.vertical} in
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <p className="text-gray-700 font-bold mb-2">Past Injuries:</p>
                                    <ul className="space-y-2">
                                        {wizardData.injuries.map((pastInjury) => (
                                            <li
                                                key={pastInjury.id}
                                                className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
                                            >
                                                <span className="text-gray-800">
                                                    {pastInjury.season} - {pastInjury.type} Injury
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="mb-8 p-4 bg-gray-50 border rounded-md">
                                <h3 className="text-xl font-semibold mb-2">Reason for Analysis</h3>
                                <p className="text-gray-700">{reason.response.text()}</p>
                            </div>

                            {/* Preventable Measures Box */}
                            <div className="mb-8 p-4 bg-gray-50 border rounded-md">
                                <h3 className="text-xl font-semibold mb-2">Preventable Measures</h3>
                                <p className="text-gray-700">{preventative.response.text()}</p>
                            </div>
                        </div>

                        {/* Right Column - Chatbot */}
                        <div>
                            <InjuryHeatmap inferenceResult={inferenceResult} />
                            <ChatbotWidget wizardData={wizardData} inferenceResult={inferenceResult} />
                            <InjuryScatterPlot data={injuryStatistics} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};