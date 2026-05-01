'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const HeroSection: React.FC = () => {
  const [cityInput, setCityInput] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (cityInput.trim()) {
      const encodedCity = encodeURIComponent(cityInput.trim());
      router.push(`/fields/${encodedCity}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <section className="relative h-[80vh] w-full overflow-hidden flex flex-col items-center justify-center">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/videos/hero-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40 z-10" />

      <div className="relative z-20 text-center px-6 max-w-3xl flex-grow flex flex-col justify-center">
        <h1 className="text-white text-4xl md:text-6xl font-extrabold leading-tight mb-6 drop-shadow-lg">
          Find Your Perfect Soccer Field
        </h1>
        <p className="text-white text-lg md:text-2xl mb-6 drop-shadow-md">
          Discover available fields and book your next game today!
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <input
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your city (e.g. OKC, Tulsa)"
            className="px-4 py-2 rounded-lg text-black text-lg w-72 max-w-full"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold text-lg hover:bg-blue-700 transition"
          >
            Search
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
