import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://soccerfieldrental.net'),
  title: {
    default: 'Soccer Discovery — Find & Book Soccer Fields Near You',
    template: '%s | Soccer Discovery',
  },
  description:
    'Discover and book soccer fields near you. Indoor, outdoor, futsal, grass and turf fields available across the US.',
  openGraph: {
    type: 'website',
    siteName: 'Soccer Discovery',
    images: [{ url: '/images/hero-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white text-gray-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
