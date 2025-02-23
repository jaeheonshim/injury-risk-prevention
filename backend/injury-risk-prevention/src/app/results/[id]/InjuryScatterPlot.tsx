'use client'

import React from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

// Dynamically import Chart component with SSR disabled
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type DataPoint = {
  injury: string;
  height: number;
  weight: number;
};

type ScatterPlotProps = {
  data: DataPoint[];
};

// Mapping for injury types (using uppercase keys) to colors
const injuryColors: Record<string, string> = {
  'KNEE': '#FF4560',
  'ANKLE': '#00E396',
  'HAMSTRING': '#775DD0',
  'SHOULDER': '#FEB019',
  'FOOT': '#FF0000',
  'CONCUSSION': '#008FFB',
  'GROIN': '#FF66C3',
  'BACK': '#546E7A',
  'CALF': '#26A69A',
  'HIP': '#D4E157',
  'NECK': '#FF7043',
  'TOE': '#66BB6A',
  'QUADRICEP': '#AB47BC',
  'ELBOW': '#42A5F5',
  'HAND': '#7E57C2',
  'RIB': '#EC407A',
  'WRIST': '#9CCC65',
  'THUMB': '#FFA726',
  'ABDOMEN': '#29B6F6',
  'HEAD': '#66BB6A',
  'FINGER': '#AB47BC',
  'ACHILLES': '#EF5350',
  'SHIN': '#5C6BC0',
  'PECTORAL': '#26C6DA',
  'FOREARM': '#D4E157',
  'HEEL': '#FFCA28',
  'BICEPS': '#8D6E63',
  'FIBULA': '#BDBDBD'
};

export default function InjuryScatterPlot({ data }: ScatterPlotProps) {
  // Get unique injury types from the data, normalized to uppercase
  const injuryTypes = Array.from(new Set(data.map(point => point.injury.toUpperCase())));

  // Create a series for each injury type, using the corresponding color
  const series = injuryTypes.map((injuryType) => ({
    name: injuryType,
    data: data
      .filter(point => point.injury.toUpperCase() === injuryType)
      .map(point => ({
        x: point.height,
        y: point.weight
      })),
    // Look up the color based on the injury type, fallback to black if not defined
    color: injuryColors[injuryType] || '#000000'
  }));

  const options: ApexOptions = {
    chart: {
      type: 'scatter',
      zoom: {
        enabled: true,
        type: 'xy'
      }
    },
    xaxis: {
      title: {
        text: 'Height (inches)'
      },
      tickAmount: 10
    },
    yaxis: {
      title: {
        text: 'Weight (lbs)'
      }
    },
    tooltip: {
      shared: false,
      intersect: true,
      x: {
        show: true,
        formatter: (val) => `${val} inches`
      },
      y: {
        formatter: (val) => `${val} lbs`
      }
    },
    title: {
      text: 'Scatter Plot: Height vs. Weight by Injury Type',
      align: 'center'
    }
  };

  return (
    <div className="p-4">
      <Chart options={options} series={series} type="scatter" height="350" />
    </div>
  );
}
