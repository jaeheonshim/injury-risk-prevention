'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

const Home: React.FC = () => {
    const router = useRouter();

    const navigateToWizard = () => {
        router.push('/wizard');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <section className="w-full max-w-4xl p-8 bg-white rounded-lg shadow-lg text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-6">Welcome to Injury Risk Prevention</h1>
                <p className="text-gray-700 mb-8">
                    Dive into the exhilarating world of injury risk prevention with our dynamic and electrifying assessment tool designed exclusively for those who live for the rush of the game.
                </p>
                <button
                    onClick={navigateToWizard}
                    className="bg-orange-500 text-white font-bold py-3 px-6 rounded hover:bg-orange-400 transition duration-300"
                >
                    Take your injury assessment today!
                </button>
            </section>
        </div>
    );
};

export default Home