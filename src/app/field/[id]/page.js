'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig'; // Adjust path if needed
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

// Fix for default Leaflet icon path (important for Next.js)
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const FieldDetails = ({ params }) => {
  // Unwrap the params promise using React.use()
  const { id } = React.use(params);

  const [field, setField] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showOpenHours, setShowOpenHours] = useState(false);
  const swiperRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    const fetchField = async () => {
      setLoading(true);
      try {
        const fieldDocRef = doc(db, 'rentalFields', id);
        const fieldDoc = await getDoc(fieldDocRef);
        if (fieldDoc.exists()) {
          setField(fieldDoc.data());
        } else {
          setField(null);
        }
      } catch (error) {
        console.error('Error fetching field:', error);
        setField(null);
      }
      setLoading(false);
    };

    fetchField();
  }, [id]);

  // Update Swiper when images change
  useEffect(() => {
    if (swiperRef.current?.swiper) {
      swiperRef.current.swiper.update();
    }
  }, [field?.imageURLs]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!field) return <div className="text-center py-10">Field not found</div>;

  const tabs = ['overview', 'availability', 'map'];

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.push('/browse')}
        className="text-blue-600 hover:underline mb-6 block"
      >
        ← Back to Listings
      </button>

      <div className="bg-white shadow-xl rounded-2xl overflow-hidden p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Image Carousel */}
          <div className="w-full aspect-square">
            {field.imageURLs?.length ? (
              <Swiper
                ref={swiperRef}
                modules={[Navigation]}
                navigation
                loop
                spaceBetween={10}
                slidesPerView={1}
                className="w-full h-full"
              >
                {field.imageURLs.map((url, index) => (
                  <SwiperSlide key={index}>
                    <img
                      src={url}
                      alt={`Field image ${index + 1}`}
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
            {/* Facility Details */}
            <div>
              <h2 className="text-2xl font-bold">{field.facilityName}</h2>
              <p className="text-gray-600">{field.location}</p>
              <div className="mt-2 text-lg text-indigo-600 font-semibold">
                {field.price_per_hour ? `$${field.price_per_hour}/hr` : 'Contact for pricing'}
              </div>
              <p className="text-sm text-gray-700 mt-1">
                Field Size: {field.fieldSize || 'Not provided'}
              </p>
              <div className="flex flex-wrap gap-2 mt-3 text-xs">
                <span className="bg-gray-200 px-3 py-1 rounded-full">
                  Surface: {field.fieldSurface || 'N/A'}
                </span>
                <span className="bg-gray-200 px-3 py-1 rounded-full">
                  {field.indoor_outdoor || 'Indoor/Outdoor'}
                </span>
                {field.lights && (
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                    Lights Available
                  </span>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-4 border-b pb-2 flex space-x-4 mt-4">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`capitalize px-4 py-1 text-sm rounded-t-lg font-medium ${
                    activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="tab-content overflow-y-auto">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Contact Info */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Contact Information</h3>
                    <div className="space-y-2 text-base text-gray-700">
                      <p>
                        <span className="font-medium">Phone:</span>{' '}
                        {field.phoneNumber || (
                          <span className="text-gray-500">No phone number provided</span>
                        )}
                      </p>
                      <p>
                        <span className="font-medium">Website:</span>{' '}
                        {field.websiteURL ? (
                          <a
                            href={field.websiteURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline hover:text-blue-800"
                          >
                            {field.websiteURL}
                          </a>
                        ) : (
                          <span className="text-gray-500">No website provided</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Open Hours */}
                  <div>
                    <button
                      onClick={() => setShowOpenHours((prev) => !prev)}
                      className="text-blue-600 underline mb-2 focus:outline-none"
                    >
                      {showOpenHours ? 'Hide Open Hours' : 'Show Open Hours'}
                    </button>
                    {showOpenHours && field.openHours && (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm max-h-40 overflow-auto">
                        <h3 className="text-lg font-semibold mb-2 text-gray-800">Open Hours</h3>
                        {Object.entries(field.openHours).map(([day, hours]) => (
                          <div
                            key={day}
                            className="flex justify-between py-1 border-b border-gray-200 last:border-0"
                          >
                            <span className="capitalize font-medium">{day}</span>
                            <span className="text-gray-600">{hours}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'availability' && (
                <div>
                  <h3 className="text-xl font-bold mb-2">Availability</h3>
                  {field.availability ? (
                    <div className="bg-gray-100 p-4 rounded max-h-60 overflow-auto">
                      {Object.entries(field.availability).map(([date, slots]) => (
                        <div key={date} className="mb-3">
                          <div className="font-semibold">{date}</div>
                          {Array.isArray(slots) && slots.length > 0 ? (
                            <ul className="list-disc list-inside">
                              {slots.map((slot, i) => (
                                <li key={i}>{slot}</li>
                              ))}
                            </ul>
                          ) : (
                            <div>No available time slots</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No availability data provided.</p>
                  )}
                </div>
              )}

              {activeTab === 'map' && field.latitude && field.longitude && (
                <div className="h-60 rounded overflow-hidden">
                  <MapContainer
                    center={[field.latitude, field.longitude]}
                    zoom={13}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[field.latitude, field.longitude]} icon={defaultIcon}>
                      <Popup>{field.facilityName}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => router.push(`/claim-field/${id}`)}
        className="fixed bottom-6 right-6 z-50 bg-yellow-500 text-white px-5 py-3 rounded-full shadow-lg hover:bg-yellow-600 transition-all"
      >
        Claim this field
      </button>
    </div>
  );
};

export default FieldDetails;
