'use client';

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import FieldCard from '../../components/FieldCard';

const MapView = dynamic(() => import('../../components/MapView'), { ssr: false });

const Browse = () => {
  const [fields, setFields] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [selectedSurface, setSelectedSurface] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  

  useEffect(() => {
    const fetchFields = async () => {
      const snapshot = await getDocs(collection(db, 'rentalFields'));
      const fieldData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFields(fieldData);
    };
    fetchFields();
  }, []);

  const filteredFields = fields.filter((field) => {
    const matchesSearch =
      !searchTerm ||
      (field.facilityName && field.facilityName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (field.location && field.location.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCity =
      !citySearch || (field.city && field.city.toLowerCase().includes(citySearch.toLowerCase()));

    return (
      matchesSearch &&
      matchesCity &&
      (!selectedSurface || field.fieldSurface?.toLowerCase() === selectedSurface.toLowerCase()) &&
      (!selectedType || field.indoor_outdoor?.toLowerCase() === selectedType.toLowerCase()) &&
      (!maxPrice || (field.price_per_hour && field.price_per_hour <= Number(maxPrice)))
    );
  });

  const sortedFields = [...filteredFields].sort((a, b) => {
    if (sortOption === 'priceAsc') return a.price_per_hour - b.price_per_hour;
    if (sortOption === 'priceDesc') return b.price_per_hour - a.price_per_hour;
    if (sortOption === 'nameAsc') return a.facilityName.localeCompare(b.facilityName);
    if (sortOption === 'nameDesc') return b.facilityName.localeCompare(a.facilityName);
    return 0;
  });

  return (
    <>
      <Head>
        <title>Browse Soccer Fields - Soccer Discovery</title>
        <meta
          name="description"
          content="Browse and find soccer fields to rent. Filter by surface, price, and type to find the perfect field for your game."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="soccer field, rent soccer field, indoor soccer, outdoor soccer, futsal" />
        <meta name="author" content="Soccer Discovery Team" />
      </Head>

      <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
  <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
    {/* Left side: Listings and Filters */}
    <div className="w-full md:w-1/2 h-full overflow-y-auto bg-gray-800 border-r border-gray-700 relative">
      
      {/* Toggle button - only visible on mobile */}
      <div className="md:hidden p-4 bg-gray-900 border-b border-gray-700 flex justify-between items-center">
        <button
          className="bg-gray-700 text-gray-100 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
          onClick={() => setShowFilters(prev => !prev)}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Filters container - toggle visibility on mobile, always visible on md+ */}
      <div
        className={`sticky top-0 z-10 bg-gray-900 border-b border-gray-700 p-4
          ${showFilters ? 'block' : 'hidden'} md:block`}
      >
        <div className="flex flex-wrap gap-4 items-center justify-start">
          <input
            type="text"
            placeholder="Search by name or location"
            className="bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 rounded-lg text-sm flex-grow min-w-[180px] focus:outline-none focus:ring-2 focus:ring-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <input
            type="text"
            placeholder="Search by nearest city"
            className="bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white"
            value={citySearch}
            onChange={(e) => setCitySearch(e.target.value)}
          />
          <select
            className="bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white"
            onChange={(e) => setSelectedSurface(e.target.value)}
            value={selectedSurface}
          >
            <option value="">All Surfaces</option>
            <option value="grass">Grass</option>
            <option value="turf">Turf</option>
            <option value="hardcourt">Hardcourt</option>
          </select>
          <select
            className="bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white"
            onChange={(e) => setSelectedType(e.target.value)}
            value={selectedType}
          >
            <option value="">Indoor/Outdoor</option>
            <option value="indoor">Indoor</option>
            <option value="outdoor">Outdoor</option>
          </select>
          <input
            type="number"
            placeholder="Max price/hr"
            className="bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 rounded-lg text-sm w-32 focus:outline-none focus:ring-2 focus:ring-white"
            onChange={(e) => setMaxPrice(e.target.value)}
            value={maxPrice}
          />
          <select
            className="bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="">Sort By</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="nameAsc">Name: A to Z</option>
            <option value="nameDesc">Name: Z to A</option>
          </select>
        </div>
      </div>


            {/* Mobile-only Map Toggle */}
            <div className="md:hidden fixed bottom-4 left-4 right-4 z-20 px-4">
              <button
                onClick={() => setShowMap(!showMap)}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg shadow-lg"
              >
                {showMap ? 'Hide Map' : 'View Map'}
              </button>
            </div>

            {/* Field Listings */}
            <div className="p-4 space-y-4">
              {sortedFields.map((field) => (
                <FieldCard
                  key={field.id}
                  field={field}
                  dark={true} // pass dark mode to card
                  onSelectPosition={(pos) => {
                    setSelectedPosition(pos);
                    if (window.innerWidth >= 768) {
                      setShowMap(true);
                    }
                  }}
                />
              ))}
            </div>
          </div>

          {/* Right side: Map */}
          <div className="hidden md:block md:w-1/2 h-full">
            {showMap && (
              <MapView
                fields={sortedFields}
                selectedPosition={selectedPosition}
                onSelectPosition={setSelectedPosition}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Browse;
