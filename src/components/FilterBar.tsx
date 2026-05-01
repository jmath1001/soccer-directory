'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const FilterBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleGoClick = () => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append('search', searchTerm.trim());
    router.push(`/browse?${params.toString()}`);
  };

  return (
    <div className="sticky top-0 z-30 bg-white px-6 py-4 shadow-md">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-4 sm:items-center">
        <div className="flex items-center gap-2">
          <label htmlFor="city" className="text-gray-700 font-medium">City:</label>
          <select id="city" className="p-2 rounded border text-gray-700 bg-gray-50" disabled>
            <option value="dallas">Dallas</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="Search suburb or field name"
          className="flex-1 p-2 border rounded bg-gray-50 text-gray-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleGoClick}
        >
          Go
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
