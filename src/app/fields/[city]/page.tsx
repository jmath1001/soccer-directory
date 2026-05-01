import type { Metadata } from 'next';
import CityFieldsClient from './CityFieldsClient';

type Props = { params: Promise<{ city: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const decoded = decodeURIComponent(city);

  return {
    title: `Soccer Fields in ${decoded}`,
    description: `Find and rent soccer fields in ${decoded}. Browse indoor, outdoor, grass and turf options. Filter by price and surface type.`,
    openGraph: {
      title: `Soccer Fields in ${decoded} | Soccer Discovery`,
      description: `Find and rent soccer fields in ${decoded}. Browse indoor, outdoor, grass and turf options.`,
    },
  };
}

export default function CityFieldsPage() {
  return <CityFieldsClient />;
}
