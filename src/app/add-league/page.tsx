'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { uploadToCloudinary } from '@/utils/uploadToCloudinary';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { v4 as uuidv4 } from 'uuid';

const GAME_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const GENDER_OPTIONS = ['Men', 'Women', 'Co-ed'];

const AddLeague: React.FC = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    league_name: '',
    players_per_side: '',
    price: '',
    gender: '',
    game_days: [] as string[],
    location: '',
    latitude: '',
    longitude: '',
  });

  const [registrationDeadline, setRegistrationDeadline] = useState<Date | null>(null);
  const [seasonStartDate, setSeasonStartDate] = useState<Date | null>(null);
  const [imageURLs, setImageURLs] = useState<string[]>([]);
  const [useLatLong, setUseLatLong] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleGameDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      game_days: prev.game_days.includes(day)
        ? prev.game_days.filter((d) => d !== day)
        : [...prev.game_days, day],
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadToCloudinary(file);
      if (url) urls.push(url);
    }
    setImageURLs((prev) => [...prev, ...urls]);
  };

  const handleSubmit = async () => {
    if (!formData.league_name || !seasonStartDate || !registrationDeadline) return;

    setLoading(true);

    const leagueData = {
      id: uuidv4(),
      league_name: formData.league_name,
      players_per_side: formData.players_per_side ? parseInt(formData.players_per_side) : null,
      price: formData.price ? parseFloat(formData.price) : null,
      gender: formData.gender || null,
      game_days: formData.game_days,
      location: formData.location || null,
      latitude: useLatLong && formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: useLatLong && formData.longitude ? parseFloat(formData.longitude) : null,
      image_urls: imageURLs,
      registration_deadline: registrationDeadline.toISOString(),
      season_start_date: seasonStartDate.toISOString(),
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('leagues').insert(leagueData);
    if (error) {
      console.error('Error creating league:', error);
    } else {
      router.push('/');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Add New League</h1>

      <input
        type="text"
        name="league_name"
        value={formData.league_name}
        onChange={handleChange}
        placeholder="League or Field Name"
        className="w-full p-2 mb-4 border rounded"
      />

      <input
        type="number"
        name="players_per_side"
        value={formData.players_per_side}
        onChange={handleChange}
        placeholder="Players Per Side (e.g., 5)"
        className="w-full p-2 mb-4 border rounded"
      />

      <input
        type="number"
        name="price"
        value={formData.price}
        onChange={handleChange}
        placeholder="Price for Registration"
        className="w-full p-2 mb-4 border rounded"
      />

      <label className="block mb-2">Registration Deadline:</label>
      <DatePicker
        selected={registrationDeadline}
        onChange={(date) => setRegistrationDeadline(date)}
        className="w-full p-2 mb-4 border rounded"
        placeholderText="Select Deadline"
      />

      <label className="block mb-2">Season Start Date:</label>
      <DatePicker
        selected={seasonStartDate}
        onChange={(date) => setSeasonStartDate(date)}
        className="w-full p-2 mb-4 border rounded"
        placeholderText="Select Start Date"
      />

      <label className="block mb-2">Gender Category:</label>
      <select
        name="gender"
        value={formData.gender}
        onChange={handleChange}
        className="w-full p-2 mb-4 border rounded"
      >
        <option value="">Select Gender</option>
        {GENDER_OPTIONS.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>

      <label className="block mb-2">Game Days:</label>
      <div className="flex flex-wrap gap-2 mb-4">
        {GAME_DAYS.map((day) => (
          <button
            key={day}
            onClick={() => toggleGameDay(day)}
            className={`px-3 py-1 rounded border ${
              formData.game_days.includes(day) ? 'bg-blue-600 text-white' : 'bg-gray-100'
            }`}
            type="button"
          >
            {day}
          </button>
        ))}
      </div>

      <textarea
        name="location"
        value={formData.location}
        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        placeholder="Location"
        className="w-full p-2 mb-4 border rounded"
      />

      <label className="inline-flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={useLatLong}
          onChange={() => setUseLatLong((prev) => !prev)}
        />
        Enter Latitude &amp; Longitude manually
      </label>

      {useLatLong && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="number"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            placeholder="Latitude"
            step="any"
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            placeholder="Longitude"
            step="any"
            className="p-2 border rounded"
          />
        </div>
      )}

      <label className="block mb-2">Upload Images:</label>
      <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="mb-4" />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Create League'}
      </button>
    </div>
  );
};

export default AddLeague;
