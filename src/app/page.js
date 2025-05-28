// app/page.js (or pages/index.js in older Next.js versions)
'use client';

import Head from 'next/head';
import HeroSection from '@/components/HeroSection';
import FeaturedFields from '@/components/FeaturedFields';
import BrowseByCategory from '@/components/BrowseByCategory';

export default function Home() {
  return (
    <>
      <Head>
        <title>Find Your Perfect Soccer Field | Soccer Discovery</title>
        <meta name="description" content="Discover available soccer fields near you and book your next game easily. Indoor, outdoor, futsal & more!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
        <meta name="keywords" content="soccer field, book soccer field, indoor soccer, futsal, outdoor soccer" />
        <meta name="author" content="Soccer Discovery Team" />
        {/* You can add Open Graph tags here for social sharing */}
      </Head>

      {/* Full width Hero outside container for edge-to-edge look */}
      <HeroSection />
      <BrowseByCategory />
      {/* Main container for rest of content */}
      <main className="max-w-8xl mx-auto px-4 py-8 space-y-16">
        <FeaturedFields />
      </main>
    </>
  );
}
