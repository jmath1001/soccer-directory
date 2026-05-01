'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import type { RentalField } from '@/types';

interface FieldCardProps {
  field: RentalField;
  onSelectPosition?: (pos: [number, number]) => void;
  dark?: boolean;
}

const FieldCard: React.FC<FieldCardProps> = ({ field, onSelectPosition, dark = false }) => {
  const router = useRouter();

  return (
    <div
      className={`rounded-xl shadow-md hover:shadow-lg transition cursor-pointer flex flex-col md:flex-row overflow-hidden ${
        dark ? 'bg-gray-700 text-gray-100' : 'bg-white'
      }`}
      onClick={() => {
        if (field.latitude != null && field.longitude != null) {
          onSelectPosition?.([field.latitude, field.longitude]);
        }
      }}
    >
      {field.image_urls?.length > 0 ? (
        <div className="w-full md:w-48 h-48">
          {field.image_urls.length > 1 ? (
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={10}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              className="h-full"
              loop={field.image_urls.length > 1}
            >
              {field.image_urls.map((url, index) => (
                <SwiperSlide key={index} className="h-full">
                  <img
                    src={url}
                    alt={`Field ${index + 1}`}
                    className="w-full h-full object-cover rounded-l-xl md:rounded-none"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <img
              src={field.image_urls[0]}
              alt="Field"
              className="w-full h-48 object-cover rounded-l-xl md:rounded-none"
            />
          )}
        </div>
      ) : (
        <div className="w-full md:w-48 h-48 bg-gray-100 flex items-center justify-center text-sm text-gray-500 p-2 text-center">
          Field has not provided any pictures
        </div>
      )}

      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <h2 className={`text-lg font-bold ${dark ? 'text-gray-100' : 'text-black'}`}>
            {field.facility_name}
          </h2>
          <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{field.location}</p>
          <p className="text-indigo-400 font-semibold mt-1">
            {field.price_per_hour != null ? `$${field.price_per_hour}/hr` : 'Field has not provided price.'}
          </p>
          <p className={`text-sm mt-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
            Field Size: {field.field_size || 'Not provided'}
          </p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full">
              Surface: {field.field_surface || 'N/A'}
            </span>
            <span className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full">
              {field.indoor_outdoor || 'Indoor/Outdoor'}
            </span>
            {field.lights && (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                💡 Lights
              </span>
            )}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/field/${field.id}`);
          }}
          className="mt-4 self-start bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default FieldCard;
