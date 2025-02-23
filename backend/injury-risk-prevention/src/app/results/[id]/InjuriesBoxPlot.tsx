'use client'

import React, { useEffect, useState } from 'react';

export default function InjuriesBoxplot() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBoxPlot() {
      try {
        // Adjust the URL and injury types as needed.
        const response = await fetch('/api/injuries-boxplot?injury_types=KNEE,ANKLE', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setImage(data.image);
      } catch (error) {
        console.error('Error fetching boxplot image:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBoxPlot();
  }, []);

  if (loading) {
    return <div>Loading box plot...</div>;
  }

  if (!image) {
    return <div>No image available.</div>;
  }

  return (
    <div>
      <h2>Injuries Box & Whisker Plot</h2>
      <img src={`data:image/png;base64,${image}`} alt="Injuries Box Plot" />
    </div>
  );
}
