'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

const Home: React.FC = () => {
    const router = useRouter();

    const navigateToWizard = () => {
        router.push('/wizard');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <nav className="w-full bg-orange-500 text-white py-6 px-8 flex justify-between items-center shadow-md">
                <h1 className="text-3xl font-bold">Injury Shield</h1>
                <div>
                    {/* Add navigation links here if needed */}
                </div>
            </nav>
            <div className="flex-grow flex items-center justify-center">
                <div className="w-full h-full flex flex-col md:flex-row items-center justify-center bg-white">
                    <div className="md:w-1/2 h-full flex items-center justify-center">
                        <div className="p-8">
                            <picture className="block mb-4 fade-in">
                                <source media="(max-width: 600px)" srcSet="https://csimg.nyc3.cdn.digitaloceanspaces.com/Images/ecommerce/models1.jpg" />
                                <source media="(min-width: 601px)" srcSet="https://csimg.nyc3.cdn.digitaloceanspaces.com/Images/ecommerce/models1.jpg" />
                                <img loading="lazy" decoding="async" src="https://csimg.nyc3.cdn.digitaloceanspaces.com/Images/ecommerce/models1.jpg" alt="model" className="w-full h-auto shadow-lg rounded-lg" />
                            </picture>
                            <picture className="block fade-in">
                                <source media="(max-width: 600px)" srcSet="https://csimg.nyc3.cdn.digitaloceanspaces.com/Images/ecommerce/shoes2.jpg" />
                                <source media="(min-width: 601px)" srcSet="https://csimg.nyc3.cdn.digitaloceanspaces.com/Images/ecommerce/shoes2.jpg" />
                                <img loading="lazy" decoding="async" src="https://csimg.nyc3.cdn.digitaloceanspaces.com/Images/ecommerce/shoes2.jpg" alt="shoes" className="w-full h-auto shadow-lg rounded-lg" />
                            </picture>
                        </div>
                    </div>
                    <div className="md:w-1/2 h-full flex items-center justify-center">
                        <div className="p-8">
                            <h1 className="text-5xl font-bold text-gray-900 mb-6">Welcome to Injury Shield.</h1>
                            <p className="text-gray-700 mb-8">
                            Dominate the Field. Predict the Risks. Stay One Step Ahead. Injury Shield is a platform that helps you assess your injury risk and provides you with personalized recommendations to prevent injuries. Take the assessment today and start your journey to a healthier you.
                            </p>
                            <button
                                onClick={navigateToWizard}
                                className="bg-orange-500 text-white font-bold py-3 px-6 rounded hover:bg-orange-400 transition duration-300"
                            >
                                Take your injury assessment today!
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;

