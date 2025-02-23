'use server';

import React, { useEffect, useState } from 'react';
import ReactMarkdown from "react-markdown";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useParams } from 'next/navigation';

const genAI = new GoogleGenerativeAI("REDACTED");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const Results: React.FC = () => {
    const { id } = useParams();

    const [text, setText] = useState<string>("Loading...");

    useEffect(() => {
        async function fetchData() {
            try {
                const result = await model.generateContent("give me a 2 sentence description of what a sprained ankle is");
                const generatedText = result.response.text();
                setText(generatedText);
            } catch (error) {
                console.error("Error fetching AI-generated text:", error);
                setText("Failed to load content.");
            }
        }
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Navigation Bar */}
            <nav className="w-full bg-orange-500 text-white py-6 px-8 flex justify-between items-center shadow-md">
                <h1 className="text-3xl font-bold">Injury Risk Prevention</h1>
            </nav>

            {/* Main Content */}
            <div className="flex-grow flex items-center justify-center">
                <div className="w-full max-w-4xl p-8 bg-white rounded-lg shadow-lg text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-6">Your Injury Risk Assessment Results {id}</h1>

                    {/* AI-Generated Markdown Content */}
                    <div className="text-gray-700 mb-8">
                        Based on your inputs, here are your results. Please review them carefully and take the necessary steps to prevent injuries.
                        <ReactMarkdown>{text}</ReactMarkdown>
                    </div>

                    {/* Summary Section */}
                    <div className="text-left">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Summary</h2>
                        <p className="text-gray-700 mb-4">Age: 25</p>
                        <p className="text-gray-700 mb-4">Height: 6 ft 2 in</p>
                        <p className="text-gray-700 mb-4">Weight: 180 lbs</p>
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

export default Results;
