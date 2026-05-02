import { createSupabasePublicClient } from '@/lib/supabaseServer';
import type { Metadata } from 'next';
import FieldDetailsClient from './FieldDetailsClient';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = createSupabasePublicClient();
  const { data: field } = await supabase
    .from('rental_fields')
    .select('facility_name, location, city, field_surface, indoor_outdoor, price_per_hour, image_urls')
    .eq('id', id)
    .single();

  if (!field) return { title: 'Field Not Found' };

  const location = [field.location, field.city].filter(Boolean).join(', ');
  const surface = [field.field_surface, field.indoor_outdoor].filter(Boolean).join(' · ');
  const price = field.price_per_hour ? ` From $${field.price_per_hour}/hr.` : '';
  const description = `Book ${field.facility_name}${location ? ` in ${location}` : ''}. ${surface}${price}`;
  const image = field.image_urls?.[0];

  return {
    title: field.facility_name,
    description,
    openGraph: {
      title: `${field.facility_name} | Soccer Discovery`,
      description,
      images: image ? [{ url: image }] : [],
    },
    twitter: {
      title: `${field.facility_name} | Soccer Discovery`,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function FieldPage({ params }: Props) {
  const { id } = await params;
  return <FieldDetailsClient id={id} />;
}
