'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { SwiperRef } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import type { RentalField } from '@/types';

const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function FieldDetailsClient({ id }: { id: string }) {
  const [field, setField] = useState<RentalField | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const swiperRef = useRef<SwiperRef>(null);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    const fetchField = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('rental_fields')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching field:', error);
        setField(null);
      } else {
        setField(data);
      }
      setLoading(false);
    };

    fetchField();
  }, [id]);

  useEffect(() => {
    if (swiperRef.current?.swiper) {
      swiperRef.current.swiper.update();
    }
  }, [field?.image_urls]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!field) return <div className="text-center py-10">Field not found</div>;

  const tabs = ['overview', 'availability', 'map'];

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.push('/browse')}
        className="mb-6 block text-gray-700 hover:text-gray-900 transition"
      >
        ← Back to Listings
      </button>

      <div className="bg-gray-800 text-gray-100 shadow-xl rounded-2xl overflow-hidden p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Image Carousel */}
          <div className="w-full aspect-square">
            {field.image_urls?.length ? (
              <Swiper
                ref={swiperRef}
                modules={[Navigation]}
                navigation
                loop
                spaceBetween={10}
                slidesPerView={1}
                className="w-full h-full"
              >
                {field.image_urls.map((url, index) => (
                  <SwiperSlide key={index}>
                    <img
                      src={url}
                      alt={`${field.facility_name} — photo ${index + 1}`}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 border rounded-xl">
                No images available
              </div>
            )}
          </div>

          {/* Right: Tabs + Info */}
          <div className="flex flex-col">
            <div>
              <h1 className="text-2xl font-bold">{field.facility_name}</h1>
              <p className="text-gray-300">{field.location}</p>
              <div className="mt-2 text-lg text-green-400 font-semibold">
                {field.price_per_hour ? `$${field.price_per_hour}/hr` : 'Contact for pricing'}
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Field Size: {field.field_size || 'Not provided'}
              </p>
              <div className="flex flex-wrap gap-2 mt-3 text-xs">
                <span className="bg-gray-700 px-3 py-1 rounded-full">
                  Surface: {field.field_surface || 'N/A'}
                </span>
                <span className="bg-gray-700 px-3 py-1 rounded-full">
                  {field.indoor_outdoor || 'Indoor/Outdoor'}
                </span>
                {field.lights && (
                  <span className="bg-yellow-600 text-yellow-100 px-3 py-1 rounded-full">
                    Lights Available
                  </span>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-4 border-b border-gray-700 pb-2 flex space-x-4 mt-4">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`capitalize px-4 py-1 text-sm rounded-t-lg font-medium transition ${
                    activeTab === tab
                      ? 'bg-green-700 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="tab-content overflow-y-auto text-gray-300">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="bg-gray-700 border border-gray-600 rounded-xl p-4 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                    {field.phone_number && (
                      <p className="text-sm">📞 {field.phone_number}</p>
                    )}
                    {field.website_url && (
                      <p className="text-sm mt-1">
                        🌐{' '}
                        <a
                          href={field.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          {field.website_url}
                        </a>
                      </p>
                    )}
                    {field.open_hours && (
                      <p className="text-sm mt-1">🕐 {field.open_hours}</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'availability' && (
                <div className="bg-gray-700 border border-gray-600 rounded-xl p-4">
                  <h2 className="text-lg font-semibold mb-2">Availability</h2>
                  {field.availability && Object.keys(field.availability).length > 0 ? (
                    <ul className="text-sm space-y-1">
                      {Object.entries(field.availability).map(([date, slots]) => (
                        <li key={date}>
                          <span className="font-medium">{date}:</span>{' '}
                          {(slots as string[]).join(', ')}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 text-sm">No availability info provided.</p>
                  )}
                </div>
              )}

              {activeTab === 'map' && field.latitude && field.longitude && (
                <div className="h-64 rounded-xl overflow-hidden">
                  <MapContainer
                    center={[field.latitude, field.longitude]}
                    zoom={14}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[field.latitude, field.longitude]} icon={defaultIcon}>
                      <Popup>{field.facility_name}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
