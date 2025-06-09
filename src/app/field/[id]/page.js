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
  const { id } = React.use(params);

  const [field, setField] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
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
        className="mb-6 block text-gray-700 hover:text-gray-900 transition"
      >
        ← Back to Listings
      </button>

      {/* Dark Card Container */}
      <div className="bg-gray-800 text-gray-100 shadow-xl rounded-2xl overflow-hidden p-6">
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
              <p className="text-gray-300">{field.location}</p>
              <div className="mt-2 text-lg text-green-400 font-semibold">
                {field.price_per_hour ? `$${field.price_per_hour}/hr` : 'Contact for pricing'}
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Field Size: {field.fieldSize || 'Not provided'}
              </p>
              <div className="flex flex-wrap gap-2 mt-3 text-xs">
                <span className="bg-gray-700 px-3 py-1 rounded-full">
                  Surface: {field.fieldSurface || 'N/A'}
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
                  className={`capitalize px-4 py-1 text-sm rounded-t-lg font-medium transition ${activeTab === tab
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
                  {/* Contact Info */}
                  <div className="bg-gray-700 border border-gray-600 rounded-xl p-4 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Contact Information</h3>

                    <div className="flex items-center space-x-3 mb-2">
                      {/* Phone Icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 5.25a2.25 2.25 0 012.25-2.25h2.25a.75.75 0 01.75.75v3a.75.75 0 01-.75.75H6a.75.75 0 01-.75-.75v-1.5a.75.75 0 00-.75-.75H3.75a.75.75 0 01-.75-.75v-.75zM8.25 7.5h7.5m-7.5 0v7.5m7.5-7.5v7.5m-4.5-4.5h4.5"
                        />
                      </svg>
                      <span className="text-gray-200">{field.contactPhone || 'No phone number provided'}</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Email Icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16 12l-4-4m0 0l-4 4m4-4v8"
                        />
                      </svg>
                      <span className="text-gray-200">{field.contactEmail || 'No email provided'}</span>
                    </div>
                  </div>
                </div>
              )}


              {activeTab === 'availability' && (
                <div>
                  {/* Availability content here */}
                  <p>Availability details coming soon.</p>
                </div>
              )}
              {activeTab === 'map' && (
                <div className="h-64 rounded-xl overflow-hidden border border-gray-600">
                  <MapContainer
                    center={[field.latitude || 0, field.longitude || 0]}
                    zoom={15}
                    scrollWheelZoom={false}
                    style={{ height: '100%', width: '100%' }}
                    attributionControl={false}
                    dragging={false}
                    doubleClickZoom={false}
                    zoomControl={false}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker
                      position={[field.latitude || 0, field.longitude || 0]}
                      icon={defaultIcon}
                    >
                      <Popup>{field.facilityName}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              )}
            </div>

            {/* Book Now Button */}
            <button
              onClick={() => router.push(`/booking/${id}`)}
              className="mt-6 w-full py-3 border border-white bg-transparent text-white font-semibold rounded-none cursor-pointer transition-colors duration-300 ease-in-out hover:bg-white hover:text-gray-900"
              style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", letterSpacing: '0.05em' }}
            >
              Book Now
            </button>



          </div>
          <div className="mb-6">
    <p className="mb-2 text-yellow-400 font-semibold">
      Are you the owner of this facility?
    </p>
    <button
      onClick={() => router.push(`/claim-field/${id}`)}
      className="px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold rounded-lg shadow-md transition"
    >
      Claim This Field
    </button>
  </div>
        </div>
      </div>
    </div>
  );
};

export default FieldDetails;
