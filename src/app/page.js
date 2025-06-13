import Head from 'next/head';
import HeroSection from '@/components/HeroSection';
import FeaturedFields from '@/components/FeaturedFields';
import BrowseByCategory from '@/components/BrowseByCategory';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

export default async function Home() {
  let fields = [];

  try {
    const snapshot = await getDocs(collection(db, 'rentalFields'));
    fields = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching fields:', error);
  }

  return (
    <>
      <Head>
        <title>Find Your Perfect Soccer Field | Soccer Discovery</title>
        <meta name="description" content="Discover available soccer fields near you and book your next game easily. Indoor, outdoor, futsal & more!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
        <meta name="keywords" content="soccer field, book soccer field, indoor soccer, futsal, outdoor soccer" />
        <meta name="author" content="Soccer Discovery Team" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content="Find Your Perfect Soccer Field | Soccer Discovery" />
        <meta property="og:description" content="Discover available soccer fields near you and book your next game easily. Indoor, outdoor, futsal & more!" />
        <meta property="og:url" content="https://soccerfieldrental.net" />
        <meta property="og:image" content="https://soccerfieldrental.net/public/images/hero-image.jpg" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Find Your Perfect Soccer Field | Soccer Discovery" />
        <meta name="twitter:description" content="Discover available soccer fields near you and book your next game easily." />
        <meta name="twitter:image" content="https://soccer-directory.vercel.app/public/images/hero-image.jpg" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SportsActivityLocation",
              name: "Soccer Discovery",
              url: "https://soccerfieldrental.net",
              description: "Discover available soccer fields near you and book your next game easily.",
              image: "https://soccerfieldrental.net/public/images/hero-image.jpg",
              address: {
                "@type": "PostalAddress",
                addressLocality: "United States",
                addressCountry: "US",
              },
            }),
          }}
        />
      </Head>

      <HeroSection />
      <BrowseByCategory />

      <main className="max-w-8xl mx-auto px-4 py-8 space-y-16">
        <FeaturedFields fields={fields} />
      </main>
    </>
  );
}
