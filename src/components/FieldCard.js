'use client';

import React from "react";
import { useRouter } from "next/navigation"; // Updated import for Next.js App Router
import { ChevronDown, Star } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const FieldCard = ({ field, onSelectPosition }) => {
  const router = useRouter();

  return (
    <div
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition cursor-pointer flex flex-col md:flex-row overflow-hidden"
      onClick={() => {
        if (field.latitude && field.longitude)
          onSelectPosition([field.latitude, field.longitude]);
      }}
    >
      {field.imageURLs?.length > 0 ? (
        <div className="w-full md:w-48 h-48">
          {field.imageURLs.length > 1 ? (
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={10}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              className="h-full"
              loop={field.imageURLs.length > 1}

            >
              {field.imageURLs.map((url, index) => (
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
              src={field.imageURLs[0]}
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
          <h2 className="text-black text-lg font-bold">{field.facilityName}</h2>
          <p className="text-gray-600 text-sm">{field.location}</p>
          <p className="text-indigo-600 font-semibold mt-1">
            {field.price_per_hour
              ? `$${field.price_per_hour}/hr`
              : "Field has not provided price."}
          </p>
          <p className="text-sm mt-1 text-gray-700">
            Field Size: {field.fieldSize || "Not provided"}
          </p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full">
              Surface: {field.fieldSurface || "N/A"}
            </span>
            <span className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full">
              {field.indoor_outdoor || "Indoor/Outdoor"}
            </span>
            {field.lights && (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                Lights Available
              </span>
            )}
          </div>
          <details className="mt-3 text-sm text-gray-700">
            <summary className="cursor-pointer flex items-center gap-1 font-medium text-gray-800">
              Open Hours <ChevronDown size={14} />
            </summary>
            <div className="ml-4 mt-2 space-y-1">
              {field.openHours &&
                Object.entries(field.openHours).map(([day, time]) => (
                  <p key={day}>
                    <span className="font-semibold capitalize">{day}:</span> {time}
                  </p>
                ))}
            </div>
          </details>
        </div>

        <div className="flex justify-between items-center mt-2">
          {field.ratings ? (
            <div className="flex items-center gap-1 text-yellow-500 text-sm">
              <Star className="fill-yellow-400" size={16} />
              {field.ratings}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <Star size={16} />
              No ratings available
            </div>
          )}
          <button
            className="text-blue-600 font-semibold"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/field/${field.id}`);
            }}
          >
            View More Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(FieldCard);
