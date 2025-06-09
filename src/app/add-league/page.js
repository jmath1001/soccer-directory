'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/firebase/firebaseConfig';
import { collection, doc, setDoc } from 'firebase/firestore';
import { uploadToCloudinary } from '@/utils/uploadToCloudinary';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { v4 as uuidv4 } from 'uuid';

const GAME_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const GENDER_OPTIONS = ['Men', 'Women', 'Co-ed'];

const AddLeague = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    leagueName: '',
    playersPerSide: '',
    price: '',
    gender: '',
    gameDays: [],
    location: '',
    latitude: '',
    longitude: '',
  });

  const [registrationDeadline, setRegistrationDeadline] = useState(null);
  const [seasonStartDate, setSeasonStartDate] = useState(null);
  const [imageURLs, setImageURLs] = useState([]);
  const [useLatLong, setUseLatLong] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleGameDay = (day) => {
    setFormData((prev) => ({
      ...prev,
      gameDays: prev.gameDays.includes(day)
        ? prev.gameDays.filter((d) => d !== day)
        : [...prev.gameDays, day],
    }));
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    const urls = [];
    for (let file of files) {
      const url = await uploadToCloudinary(file);
      if (url) urls.push(url);
    }
    setImageURLs((prev) => [...prev, ...urls]);
  };

  const handleSubmit = async () => {
    if (!formData.leagueName || !seasonStartDate || !registrationDeadline) return;

    setLoading(true);

    const leagueId = uuidv4();
    const leagueData = {
      ...formData,
      imageURLs,
      registrationDeadline: registrationDeadline.toISOString(),
      seasonStartDate: seasonStartDate.toISOString(),
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(collection(db, 'leagues'), leagueId), leagueData);
    setLoading(false);
    router.push('/leagues');
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Add New League</h1>

      <input
        type="text"
        name="leagueName"
        value={formData.leagueName}
        onChange={handleChange}
        placeholder="League or Field Name"
        className="w-full p-2 mb-4 border rounded"
      />

      <input
        type="number"
        name="playersPerSide"
        value={formData.playersPerSide}
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
              formData.gameDays.includes(day)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100'
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
        onChange={handleChange}
        placeholder="Location"
        className="w-full p-2 mb-4 border rounded"
      />

      <label className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={useLatLong}
          onChange={() => setUseLatLong(!useLatLong)}
          className="mr-2"
        />
        Add Latitude/Longitude Manually
      </label>

      {useLatLong && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            placeholder="Latitude"
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            placeholder="Longitude"
            className="p-2 border rounded"
          />
        </div>
      )}

      <label className="block mb-2">Upload Images:</label>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        className="mb-4"
      />

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Add League'}
      </button>
    </div>
  );
};

export default AddLeague;
