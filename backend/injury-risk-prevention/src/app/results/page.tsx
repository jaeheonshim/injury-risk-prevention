'use client';

import React, { useEffect, useState } from 'react';
import ReactMarkdown from "react-markdown";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("REDACTED");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const Results: React.FC = () => {
    const [text, setText] = useState<string>("Loading...");
    const [chatHistory, setChatHistory] = useState<string[]>([]);
    const [chatInput, setChatInput] = useState<string>("");

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

    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (chatInput.trim() === "") return;

        setChatHistory([...chatHistory, `User: ${chatInput}`]);
        setChatInput("");

        try {
            const result = await model.generateContent(chatInput);
            const generatedText = result.response.text();
            setChatHistory([...chatHistory, `User: ${chatInput}`, `AI: ${generatedText}`]);
        } catch (error) {
            console.error("Error fetching AI-generated text:", error);
            setChatHistory([...chatHistory, `User: ${chatInput}`, "AI: Failed to load response."]);
        }
    };

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
                            {/* Description Box */}
                            <div className="mb-8 p-4 bg-gray-50 border rounded-md">
                                <h3 className="text-xl font-semibold mb-2">Description</h3>
                                <ReactMarkdown>{text}</ReactMarkdown>
                            </div>

                            {/* Analysis Reason Box */}
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
                        <div className="w-1/2 pl-4">
                            <div className="mb-8 p-4 bg-gray-50 border rounded-md h-full flex flex-col">
                                <h3 className="text-xl font-semibold mb-2">Chatbot</h3>
                                <div className="flex-grow overflow-y-auto mb-4">
                                    {chatHistory.map((message, index) => (
                                        <p key={index} className="text-gray-700 mb-2">{message}</p>
                                    ))}
                                </div>
                                <form onSubmit={handleChatSubmit} className="flex">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        className="flex-grow p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                                        placeholder="Ask a question..."
                                    />
                                    <button
                                        type="submit"
                                        className="bg-orange-500 hover:bg-orange-400 text-white font-semibold py-2 px-4 rounded-r-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                                    >
                                        Send
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Results;
