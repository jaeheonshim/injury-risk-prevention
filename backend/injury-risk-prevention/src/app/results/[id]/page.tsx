'use server';

import { notFound } from "next/navigation";
import { getWizardData } from "./actions";

export default async function ResultsPage({ params }: { params: any }) {
    const { id } = await params;

    const wizardData = await getWizardData(id);

    if(!wizardData) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Navigation Bar */}
            <nav className="w-full bg-orange-500 text-white py-6 px-8 flex justify-between items-center shadow-md">
                <h1 className="text-3xl font-bold">Injury Risk Prevention</h1>
            </nav>

            {/* Main Content */}
            <div className="flex-grow flex items-center justify-center">
                <div className="w-full max-w-4xl p-8 bg-white rounded-lg shadow-lg text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-6">Your Injury Risk Assessment Results</h1>

                    {/* AI-Generated Markdown Content */}
                    <div className="text-gray-700 mb-8">

                    </div>

                    {/* Summary Section */}
                    <div className="text-left">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Summary</h2>
                        <p className="text-gray-700 mb-4">Age: {wizardData.age}</p>
                        <p className="text-gray-700 mb-4">Height: {Math.floor((wizardData.height ?? 0) / 12)} ft {(wizardData.height ?? 0) % 12}</p>
                        <p className="text-gray-700 mb-4">Weight: {wizardData.weight} lbs</p>
                        <p className="text-gray-700 mb-4">Position: Wide Receiver</p>
                        <p className="text-gray-700 mb-4">40-yard dash time: 4.5 seconds</p>
                        <p className="text-gray-700 mb-4">Reps benched: 15</p>
                        <p className="text-gray-700 mb-4">Vertical Jump: 30 inches</p>
                    </div>
                </div>
            </div>
        </div>
    );
};