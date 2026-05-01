'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import FieldCard from '@/components/FieldCard';
import type { RentalField } from '@/types';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

export default function CityFieldsClient() {
  const params = useParams();
  const city = decodeURIComponent((params.city as string) || '');

  const [fields, setFields] = useState<RentalField[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);
  const [selectedSurface, setSelectedSurface] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('');

  useEffect(() => {
    if (!city) return;

    const fetchFields = async () => {
      const { data, error } = await supabase
        .from('rental_fields')
        .select('*')
        .eq('city', city);

      if (error) {
        console.error('Error fetching fields:', error);
        return;
      }
      setFields(data ?? []);
    };

    fetchFields();
  }, [city]);

  const filteredFields = fields.filter((field) => {
    const matchesSearch =
      !searchTerm ||
      (field.facility_name && field.facility_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (field.location && typeof field.location === 'string' && field.location.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
      matchesSearch &&
      (!selectedSurface || field.field_surface?.toLowerCase() === selectedSurface.toLowerCase()) &&
      (!selectedType || field.indoor_outdoor?.toLowerCase() === selectedType.toLowerCase()) &&
      (!maxPrice || (field.price_per_hour != null && field.price_per_hour <= Number(maxPrice)))
    );
  });

  const sortedFields = [...filteredFields].sort((a, b) => {
    if (sortOption === 'priceAsc') return (a.price_per_hour ?? 0) - (b.price_per_hour ?? 0);
    if (sortOption === 'priceDesc') return (b.price_per_hour ?? 0) - (a.price_per_hour ?? 0);
    if (sortOption === 'nameAsc') return (a.facility_name ?? '').localeCompare(b.facility_name ?? '');
    if (sortOption === 'nameDesc') return (b.facility_name ?? '').localeCompare(a.facility_name ?? '');
    return 0;
  });

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
        {/* Left: Listings and Filters */}
        <div className="w-full md:w-1/2 h-full overflow-y-auto bg-gray-50 relative">
          <div className="sticky top-0 z-10 bg-white border-b p-4">
            <h1 className="text-xl font-bold text-gray-800 mb-3">
              Soccer Fields in {city}
            </h1>
            <div className="flex flex-wrap gap-4 items-center justify-start">
              <input
                type="text"
                placeholder="Search by name or location"
                className="text-black px-3 py-2 border rounded-lg text-sm flex-grow min-w-[180px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="text-black px-3 py-2 border rounded-lg text-sm"
                onChange={(e) => setSelectedSurface(e.target.value)}
                value={selectedSurface}
              >
                <option value="">All Surfaces</option>
                <option value="grass">Grass</option>
                <option value="turf">Turf</option>
                <option value="hardcourt">Hardcourt</option>
              </select>
              <select
                className="text-black px-3 py-2 border rounded-lg text-sm"
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
                className="text-black px-3 py-2 border rounded-lg text-sm w-32"
                onChange={(e) => setMaxPrice(e.target.value)}
                value={maxPrice}
              />
              <select
                className="text-black px-3 py-2 border rounded-lg text-sm"
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

          <div className="p-4 space-y-4">
            {sortedFields.map((field) => (
              <FieldCard
                key={field.id}
                field={field}
                onSelectPosition={(pos) => setSelectedPosition(pos)}
              />
            ))}
          </div>
        </div>

        {/* Right: Map */}
        <div className="hidden md:block w-1/2 p-4" style={{ height: '100%' }}>
          <div className="h-full">
            <MapView fields={sortedFields} selectedPosition={selectedPosition} />
          </div>
        </div>
      </div>
    </div>
  );
}
