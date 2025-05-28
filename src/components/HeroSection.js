'use client';

import React from 'react';
import Link from 'next/link';

const HeroSection = () => {
  return (
    <section className="relative h-[80vh] w-full overflow-hidden flex flex-col items-center justify-center">
      {/* Background video */}
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

      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40 z-10" />

      {/* Text Content */}
      <div className="relative z-20 text-center px-6 max-w-3xl flex-grow flex flex-col justify-center">
        <h1 className="text-white text-4xl md:text-6xl font-extrabold leading-tight mb-6 drop-shadow-lg">
          Find Your Perfect Soccer Field
        </h1>
        <p className="text-white text-lg md:text-2xl mb-8 drop-shadow-md">
          Discover available fields and book your next game today!
        </p>
        <Link
          href="/browse"
          className="inline-block bg-blue-600 text-white py-3 px-8 rounded-lg text-lg font-semibold shadow-lg hover:bg-blue-700 transition duration-300"
        >
          Browse Fields
        </Link>
      </div>

      {/* Animated arrow + text at bottom */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-white cursor-pointer z-20">
        <span className="mb-1 font-semibold text-lg drop-shadow-md">Discover Fields</span>
        <svg
          className="w-6 h-6 animate-bounce"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
