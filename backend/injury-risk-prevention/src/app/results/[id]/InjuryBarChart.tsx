'use client';

import { InferenceResult } from "@prisma/client";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";

export default function InjuryBarChart({ inferenceResult }: { inferenceResult: InferenceResult }) {
  const predictions = inferenceResult.predictions as Object;
  const sortedEntries = Object.entries(predictions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const data = sortedEntries.map((entry) => ({
    name: entry[0],
    pv: Number(entry[1]) * 100,
  }));

  // Compute maximum value from the data for dynamic scaling.
  const maxValue = data.reduce((max, d) => Math.max(max, d.pv), 0);

  return (
    <div style={{ width: "100%", height: "250px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{
            top: 30,
            right: 20,
            bottom: 10,
            left: 20, // Increased left margin for label visibility
          }}
        >
          <CartesianGrid stroke="#f5f5f5" />
          <XAxis 
            type="number" 
            domain={[0, maxValue]} 
            tickFormatter={(value) => `${value}%`} 
          />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={100} 
            tickMargin={10} 
          />
          <Tooltip formatter={(value) => `${value}%`} />
          <Legend />
          <Bar dataKey="pv" stackId="a" fill="#FFA500" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}