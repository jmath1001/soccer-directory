'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

const FeaturedFields = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchFields = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, 'rentalFields'));
        const fieldData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFields(fieldData);
      } catch (err) {
        console.error('Error fetching fields:', err);
        setError('Failed to load featured fields.');
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, []);

  if (loading) {
    return <p className="text-center py-10">Loading featured fields...</p>;
  }

  if (error) {
    return <p className="text-center py-10 text-red-600">{error}</p>;
  }

  if (!fields.length) {
    return <p className="text-center py-10">No featured fields available.</p>;
  }

  return (
    <section className="py-16 px-6 bg-gray-50">
      <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-900">
        Top Fields in Dallas
      </h2>

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
                aria-label={`View details for ${field.facilityName}`}
              >
                <div className="w-full h-48 bg-gray-300">
                  {field.imageURLs?.length > 0 ? (
                    <img
                      src={field.imageURLs[0]}
                      alt={field.facilityName}
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
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {field.facilityName}
                  </h3>
                  <p className="text-md text-gray-700 truncate">{field.location}</p>
                  {field.price_per_hour && (
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

      {/* Browse Fields Button */}
      <div className="max-w-7xl mx-auto mt-12 flex justify-center">
        <button
          onClick={() => router.push('/browse')}
          className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold text-lg hover:bg-blue-700 transition"
        >
          Browse Fields
        </button>
      </div>

      <style jsx>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: #2563eb; /* Tailwind blue-600 */
          width: 2.5rem;
          height: 2.5rem;
          top: 50% !important;
          transform: translateY(-50%) !important;
          transition: color 0.3s ease;
          z-index: 10;
        }
        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          color: #1e40af; /* Tailwind blue-800 */
        }
        .swiper-button-prev {
          left: -2.5rem !important;
        }
        .swiper-button-next {
          right: -2.5rem !important;
        }
      `}</style>
    </section>
  );
};

export default FeaturedFields;
