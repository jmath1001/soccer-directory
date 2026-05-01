import type { Metadata } from 'next';
import BrowseClient from './BrowseClient';

export const metadata: Metadata = {
  title: 'Browse Soccer Fields',
  description:
    'Browse and find soccer fields to rent near you. Filter by surface type, price, and indoor/outdoor to find the perfect field.',
  openGraph: {
    title: 'Browse Soccer Fields | Soccer Discovery',
    description:
      'Browse and find soccer fields to rent near you. Filter by surface type, price, and indoor/outdoor to find the perfect field.',
  },
};

export default function BrowsePage() {
  return <BrowseClient />;
}
