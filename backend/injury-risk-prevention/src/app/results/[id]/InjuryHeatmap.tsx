'use client'

import { InferenceResult } from '@prisma/client';
import React from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from "apexcharts";

// Dynamically import Chart component with SSR disabled
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function InjuryHeatmap({ inferenceResult }: { inferenceResult: InferenceResult }) {
  const predictions = inferenceResult.predictions as Record<string, number>;

  const series = [{
    name: 'Injury Risk',
    data: Object.entries(predictions).map(([injury, risk]) => ({
      x: injury,
      y: risk
    }))
  }];

  const options: ApexOptions = {
    chart: {
      type: 'heatmap',
      offsetX: 20, // adds horizontal offset
      offsetY: 20  // adds vertical offset
    },
    dataLabels: {
      enabled: false // disable overlayed risk numbers
    },
    colors: ["#FF4560"],
    title: {
      text: 'Injury Risk Heatmap'
    },
    yaxis: {
      show: false
    },
    xaxis: {
      type: 'category',
      title: {
        text: 'Injury Type'
      }
    },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        colorScale: {
          ranges: [{
              from: 0,
              to: 0.2,
              name: 'Low',
              color: '#00E396'
          }, {
              from: 0.2,
              to: 0.4,
              name: 'Moderate',
              color: '#FEB019'
          }, {
              from: 0.4,
              to: 0.6,
              name: 'Elevated',
              color: '#FF4560'
          }, {
              from: 0.6,
              to: 0.8,
              name: 'High',
              color: '#775DD0'
          }, {
              from: 0.8,
              to: 1,
              name: 'Severe',
              color: '#FF0000'
          }]
        }
      }
    }
  };

  return (
    <div className="p-4 ml-4 mb-8 bg-gray-50 border rounded-md">
      <Chart options={options} series={series} type="heatmap" height="350" />
    </div>
  );
}
