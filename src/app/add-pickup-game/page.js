'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/firebase/firebaseConfig';
import { collection, doc, setDoc } from 'firebase/firestore';
import { uploadToCloudinary } from '@/utils/uploadToCloudinary';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { v4 as uuidv4 } from 'uuid';

const TIME_SLOTS = [
  '8:00 AM - 9:00 AM',
  '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 1:00 PM',
  '1:00 PM - 2:00 PM',
  '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM',
  '4:00 PM - 5:00 PM',
  '5:00 PM - 6:00 PM',
];

const AddPickup = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fieldName: '',
    location: '',
    pricePerPerson: '',
    playersPerSide: '',
  });

  const [dates, setDates] = useState([]); // Array of { date, timeSlot }
  const [currentDate, setCurrentDate] = useState(null);
  const [currentTimeSlot, setCurrentTimeSlot] = useState('');
  const [imageURLs, setImageURLs] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAddDateSlot = () => {
    if (!currentDate || !currentTimeSlot) return;
    const formattedDate = currentDate.toISOString().split('T')[0];
    setDates((prev) => [
      ...prev,
      { date: formattedDate, timeSlot: currentTimeSlot },
    ]);
    setCurrentDate(null);
    setCurrentTimeSlot('');
  };

  const handleRemoveDate = (index) => {
    setDates((prev) => prev.filter((_, i) => i !== index));
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
    if (dates.length === 0 || !formData.fieldName) return;
    setLoading(true);
    try {
      const batchId = uuidv4();

      for (let item of dates) {
        const id = uuidv4();
        await setDoc(doc(collection(db, 'pickup-games'), id), {
          ...formData,
          date: item.date,
          timeSlot: item.timeSlot,
          imageURLs,
          createdAt: new Date().toISOString(),
          batchId,
        });
      }

      router.push('/success');
    } catch (err) {
      console.error('Error saving pickup game:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add Pickup Game</h1>

      <input
        type="text"
        name="fieldName"
        placeholder="Field Name"
        value={formData.fieldName}
        onChange={(e) => setFormData({ ...formData, fieldName: e.target.value })}
        className="w-full p-2 border rounded mb-4"
      />

      <input
        type="text"
        name="location"
        placeholder="Location"
        value={formData.location}
        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        className="w-full p-2 border rounded mb-4"
      />

      <input
        type="number"
        name="pricePerPerson"
        placeholder="Price Per Person"
        value={formData.pricePerPerson}
        onChange={(e) => setFormData({ ...formData, pricePerPerson: e.target.value })}
        className="w-full p-2 border rounded mb-4"
      />

      <input
        type="number"
        name="playersPerSide"
        placeholder="Players Per Side"
        value={formData.playersPerSide}
        onChange={(e) => setFormData({ ...formData, playersPerSide: e.target.value })}
        className="w-full p-2 border rounded mb-4"
      />

      <div className="mb-4">
        <label className="block font-semibold mb-1">Add Game Dates & Time Slots</label>
        <div className="flex gap-2 mb-2">
          <DatePicker
            selected={currentDate}
            onChange={(date) => setCurrentDate(date)}
            placeholderText="Select a date"
            className="border p-2 rounded"
          />
          <select
            value={currentTimeSlot}
            onChange={(e) => setCurrentTimeSlot(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Select time slot</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
          <button
            onClick={handleAddDateSlot}
            className="bg-blue-500 text-white px-3 py-2 rounded"
          >
            Add
          </button>
        </div>
        {dates.length > 0 && (
          <ul className="list-disc pl-6">
            {dates.map((item, index) => (
              <li key={index} className="flex justify-between items-center">
                {item.date} — {item.timeSlot}
                <button
                  onClick={() => handleRemoveDate(index)}
                  className="text-red-600 ml-4 text-sm"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Upload Images</label>
        <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
        <div className="mt-2 flex flex-wrap gap-2">
          {imageURLs.map((url, index) => (
            <img key={index} src={url} alt="uploaded" className="w-20 h-20 object-cover rounded" />
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-green-600 text-white px-6 py-2 rounded font-bold"
      >
        {loading ? 'Saving...' : 'Submit Pickup Games'}
      </button>
    </div>
  );
};

export default AddPickup;
