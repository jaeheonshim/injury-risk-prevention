'use client'

import { useEffect, useState } from "react";
import { saveInferenceResult } from "./actions";

export default function InferenceWidget({ wizardData }: { wizardData: any }) {
    const [predictions, setPredictions] = useState(null);
    const [loading, setLoading] = useState(false);

    async function runInference() {
        setLoading(true);

        try {
            const response = await fetch("/api/inference", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(wizardData),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch inference results");
            }

            const result = await response.json();
            saveInferenceResult(wizardData.id, result);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        // runInference();
    }, []);

    return (
        <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
            <div>Please wait, running inference</div>
        </div>
    );
}
