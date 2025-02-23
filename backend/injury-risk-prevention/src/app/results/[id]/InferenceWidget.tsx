'use client'

import { useEffect, useState } from "react"
import { saveInferenceResult } from "./actions"

export default function InferenceWidget({ wizardData }: { wizardData: any }) {
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function runInference() {
            try {
                const response = await fetch("/api/inference", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(wizardData),
                })

                if (!response.ok) {
                    throw new Error("Failed to fetch inference results")
                }

                const result = await response.json()
                saveInferenceResult(wizardData.id, result);
            } finally {
                setTimeout(() => {
                    setLoading(false);
                    window.location.reload();
                }, 4500);
            }
        }
        runInference()
    }, [wizardData])

    return (
        <div className="max-w-xl mx-auto p-6 border border-gray-300 rounded-lg shadow-md bg-white">
            <h2 className="text-3xl font-bold mb-4 text-center">Injury Prediction In Progress</h2>

            <div className="flex flex-col items-center justify-center">
                <svg
                    className="animate-spin h-20 w-20 text-blue-500 mb-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                </svg>
                <p className="text-gray-700 text-md text-center">Please wait, we're currently hard at work processing your data through our custom machine learning model!</p>
            </div>
        </div>
    )
}
