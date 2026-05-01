'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { supabase } from '@/lib/supabaseClient';
import type { RentalField } from '@/types';

interface FeaturedFieldsProps {
  /** Optionally pass pre-fetched fields (e.g. from a Server Component). */
  fields?: RentalField[];
}

const FeaturedFields: React.FC<FeaturedFieldsProps> = ({ fields: initialFields }) => {
  const [fields, setFields] = useState<RentalField[]>(initialFields ?? []);
  const [loading, setLoading] = useState(!initialFields);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (initialFields) return; // already have data

    const fetchFields = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase.from('rental_fields').select('*');
        if (fetchError) throw fetchError;
        setFields(data ?? []);
      } catch (err) {
        console.error('Error fetching fields:', err);
        setError('Failed to load featured fields.');
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, [initialFields]);

  if (loading) return <p className="text-center py-10">Loading featured fields...</p>;
  if (error) return <p className="text-center py-10 text-red-600">{error}</p>;
  if (!fields.length) return <p className="text-center py-10">No featured fields available.</p>;

  return (
    <section className="py-16 px-6 bg-gray-50">
      <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-900">Featured Fields</h2>

      <div className="max-w-7xl mx-auto relative">
        <Swiper
          slidesPerView={1}
          spaceBetween={20}
          loop
          navigation
          modules={[Navigation]}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 20 },
            768: { slidesPerView: 3, spaceBetween: 25 },
            1024: { slidesPerView: 4, spaceBetween: 30 },
          }}
          className="group"
        >
          {fields.map((field) => (
            <SwiperSlide key={field.id}>
              <div
                onClick={() => router.push(`/field/${field.id}`)}
                className="cursor-pointer bg-white rounded-2xl shadow-lg overflow-hidden w-72 mx-auto transition-transform duration-300 ease-in-out hover:scale-105"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && router.push(`/field/${field.id}`)}
                role="button"
                aria-label={`View details for ${field.facility_name}`}
              >
                <div className="w-full h-48 bg-gray-300">
                  {field.image_urls?.length > 0 ? (
                    <img
                      src={field.image_urls[0]}
                      alt={field.facility_name}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center text-gray-400 text-lg">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{field.facility_name}</h3>
                  <p className="text-md text-gray-700 truncate">{field.location}</p>
                  {field.price_per_hour != null && (
                    <p className="text-md text-green-700 mt-2 font-semibold">
                      ${field.price_per_hour}/hr
                    </p>
                  )}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="max-w-7xl mx-auto mt-12 flex justify-center">
        <button
          onClick={() => router.push('/browse')}
          className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold text-lg hover:bg-blue-700 transition"
        >
          Browse Fields
        </button>
      </div>
    </section>
  );
};

export default FeaturedFields;
