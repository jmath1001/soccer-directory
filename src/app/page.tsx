import HeroSection from '@/components/HeroSection';
import FeaturedFields from '@/components/FeaturedFields';
import BrowseByCategory from '@/components/BrowseByCategory';
import { createSupabasePublicClient } from '@/lib/supabaseServer';
import type { RentalField } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Find Your Perfect Soccer Field',
  description:
    'Discover available soccer fields near you and book your next game easily. Indoor, outdoor, futsal & more!',
  openGraph: {
    title: 'Find Your Perfect Soccer Field | Soccer Discovery',
    description:
      'Discover available soccer fields near you and book your next game easily. Indoor, outdoor, futsal & more!',
    url: 'https://soccerfieldrental.net',
    images: [{ url: '/images/hero-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    title: 'Find Your Perfect Soccer Field | Soccer Discovery',
    description:
      'Discover available soccer fields near you and book your next game easily.',
    images: ['/images/hero-image.jpg'],
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SportsActivityLocation',
  name: 'Soccer Discovery',
  url: 'https://soccerfieldrental.net',
  description:
    'Discover available soccer fields near you and book your next game easily.',
  image: 'https://soccerfieldrental.net/images/hero-image.jpg',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'United States',
    addressCountry: 'US',
  },
};

export default async function Home() {
  let fields: RentalField[] = [];

  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase.from('rental_fields').select('*');
    if (error) throw error;
    fields = data ?? [];
  } catch (error) {
    console.error('Error fetching fields:', error);
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HeroSection />
      <BrowseByCategory />
      <section className="max-w-8xl mx-auto px-4 py-8 space-y-16">
        <FeaturedFields fields={fields} />
      </section>
    </>
  );
}
