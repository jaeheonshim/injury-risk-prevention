'use client';

import React, { useEffect, useState } from 'react';
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import { useParams } from 'next/navigation';
import { InferenceResult, WizardData } from '@prisma/client';

const genAI = new GoogleGenerativeAI("AIzaSyChlBdz4M4O3dwbRIrzg4cVg0COC9f1KpE");

function ChatbotWidget({ wizardData, inferenceResult }: { wizardData: WizardData, inferenceResult: InferenceResult }) {
    const { id } = useParams();

    const [chatHistory, setChatHistory] = useState<string[]>([]);
    const [chatInput, setChatInput] = useState<string>("");
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [model, setModel] = useState<GenerativeModel | null>();
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [suggestionsAlreadyMade, setSuggestionsAlreadyMade] = useState<string[]>([]);

    const predictions = inferenceResult.predictions as Object;
    const sortedEntries = Object.entries(predictions).sort(([, a], [, b]) => b - a);
    const mostLikelyInjury = sortedEntries[0][0];

    async function fetchSuggestions() {
        if (!model) return;
        try {
            const suggestionPrompt = `
            Please suggest two follow-up questions that the user might ask next, formatted as bullet points. These are the questions that have already been asked so far: ${suggestionsAlreadyMade.join(", ")}. Don't suggest those. If no questions have already been asked, suggest risk factors and preventative care.
            `;
            const result = await model.generateContent(suggestionPrompt);
            const suggestionText = await result.response.text();
            console.log(suggestionPrompt, suggestionText)
            const lines = suggestionText.split('\n')
                .map(line => line.trim())
                .filter(line => line !== '')
                .map(line => line.replace(/^[-*]\s*/, ''));
            setSuggestions(lines.slice(0, 2));
        } catch (error) {
            console.error("Error fetching suggestions:", error);
        }
    }

    function onAIResponse(generatedText: string) {
        setChatHistory(prev => [...prev, `**AI**: ${generatedText}`]);
    }

    useEffect(() => {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: `You are a virtual medical assistant specializing in sports injuries for the InjuryShield platform. Your goal is to help the user, ${wizardData.name}, understand the injury they are most at risk for—${mostLikelyInjury}—based on their unique athletic profile. The user's details are as follows:

            - Name: ${wizardData.name}
            - Age: ${wizardData.age}
            - Height: ${wizardData.height} inches
            - Weight: ${wizardData.weight} pounds
            - 40-yard dash time: ${wizardData.forty} seconds
            - Bench press reps: ${wizardData.bench} reps
            - Vertical jump: ${wizardData.vertical} inches
            - Past injuries: ${JSON.stringify((wizardData as any).injuries)}

            Please be ready to provide this information:
            1. Injury Overview: A clear description of ${mostLikelyInjury}, including how it commonly occurs during gameplay.
            2. Risk Factors: An analysis of how the user's specific attributes might contribute to the risk of this injury.
            3. Preventative Measures: Practical advice on training modifications, techniques, and strategies to reduce the risk of ${mostLikelyInjury}.
            4. Management and Next Steps: Guidance on early treatment options and when to seek professional medical help.

            Your responses should be easy to understand, supportive, and actionable for ${wizardData.name}. YOUR RESPONSES MUST BE SHORT, SIMPLE, AND EASY TO UNDERSTAND. PLEASE BE POSITIVE!`
        });
        setModel(model);

        async function sendInitialMessage() {
            const result = await model.generateContent("Please introduce yourself to the user in two sentences or less. Provide the user information about your capabilities in one sentence.");
            const generatedText = await result.response.text();
            setChatHistory(prev => [...prev, `**AI**: ${generatedText}`]);
        }

        sendInitialMessage();
    }, []);


    useEffect(() => {
        fetchSuggestions();
        console.log("Fetching new suggestions");
    }, [suggestionsAlreadyMade, model])

    // Helper function to send a message
    const sendMessage = async (message: string) => {
        setChatHistory(prev => [...prev, `**User**: ${message}`]);
        setIsTyping(true);
        try {
            const result = await model!.generateContent(message);
            const generatedText = await result.response.text();
            onAIResponse(generatedText);
        } catch (error) {
            console.error("Error fetching AI-generated text:", error);
            setChatHistory(prev => [...prev, "**AI**: Failed to load response."]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (chatInput.trim() === "" || !model) return;
        await sendMessage(chatInput);
        setChatInput("");
    };

    // When a suggestion is clicked, send it automatically
    const handleSuggestionClick = async (suggestion: string) => {
        setSuggestionsAlreadyMade((prev) => [...prev, suggestion]);
        await sendMessage(suggestion);
    };

    return (
        <div className="w-270 h-165 flex flex-col">
            <style jsx>{`
                .typing {
                    display: flex;
                    align-items: center;
                }
                .dot {
                    height: 8px;
                    width: 8px;
                    margin: 0 2px;
                    background-color: #333;
                    border-radius: 50%;
                    display: inline-block;
                    animation: typing 1s infinite;
                }
                .dot:nth-child(2) {
                    animation-delay: 0.2s;
                }
                .dot:nth-child(3) {
                    animation-delay: 0.4s;
                }
                @keyframes typing {
                    0% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    50% {
                        transform: scale(1.5);
                        opacity: 0.5;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                .chat-history {
                    overflow-y: auto;
                }
                .chat-history::-webkit-scrollbar {
                    width: 12px;
                }
                .chat-history::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .chat-history::-webkit-scrollbar-thumb {
                    background-color: #f97316;
                    border-radius: 10px;
                    border: 3px solid #f1f1f1;
                }
                .chat-history::-webkit-scrollbar-thumb:hover {
                    background-color: #ea580c;
                }
            `}</style>

            <div className="w-full h-full pl-4">
                <div className="mb-8 p-4 bg-gray-50 border rounded-md h-full flex flex-col">
                    <h3 className="text-xl font-semibold mb-2">Your Personal Assistant</h3>
                    <div className="chat-history flex-grow overflow-y-auto mb-4">
                        {chatHistory.map((message, index) => (
                            <div key={index} className={`mb-2 ${message.startsWith("**User**") ? "text-right" : "text-left"}`}>
                                <div className={`inline-block p-2 rounded-lg ${message.startsWith("**User**") ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}>
                                    <ReactMarkdown remarkPlugins={[remarkBreaks]}>{message}</ReactMarkdown>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="text-left mb-2">
                                <div className="inline-block p-2 rounded-lg bg-gray-200 text-gray-800">
                                    <div className="typing">
                                        <span className="dot"></span>
                                        <span className="dot"></span>
                                        <span className="dot"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Display suggestions above the input */}
                    {suggestions.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm text-gray-600">Suggestions:</p>
                            <div className="flex gap-2">
                                {suggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-2 rounded"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
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
                            disabled={!model}
                        >
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ChatbotWidget;