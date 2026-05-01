'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { uploadToCloudinary } from '@/utils/uploadToCloudinary';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';

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

interface DateSlot {
  date: string;
  timeSlot: string;
}

const AddPickup: React.FC = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    field_name: '',
    location: '',
    price_per_person: '',
    players_per_side: '',
  });

  const [dates, setDates] = useState<DateSlot[]>([]);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [currentTimeSlot, setCurrentTimeSlot] = useState('');
  const [imageURLs, setImageURLs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAddDateSlot = () => {
    if (!currentDate || !currentTimeSlot) return;
    const formattedDate = currentDate.toISOString().split('T')[0];
    setDates((prev) => [...prev, { date: formattedDate, timeSlot: currentTimeSlot }]);
    setCurrentDate(null);
    setCurrentTimeSlot('');
  };

  const handleRemoveDate = (index: number) => {
    setDates((prev) => prev.filter((_, i) => i !== index));
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
    if (dates.length === 0 || !formData.field_name) return;
    setLoading(true);
    try {
      const batchId = uuidv4();
      const inserts = dates.map((item) => ({
        id: uuidv4(),
        field_name: formData.field_name,
        location: formData.location,
        price_per_person: formData.price_per_person ? parseFloat(formData.price_per_person) : null,
        players_per_side: formData.players_per_side ? parseInt(formData.players_per_side) : null,
        date: item.date,
        time_slot: item.timeSlot,
        image_urls: imageURLs,
        created_at: new Date().toISOString(),
        batch_id: batchId,
      }));

      const { error } = await supabase.from('pickup_games').insert(inserts);
      if (error) throw error;

      router.push('/');
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
        placeholder="Field Name"
        value={formData.field_name}
        onChange={(e) => setFormData({ ...formData, field_name: e.target.value })}
        className="w-full p-2 border rounded mb-4"
      />

      <input
        type="text"
        placeholder="Location"
        value={formData.location}
        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        className="w-full p-2 border rounded mb-4"
      />

      <input
        type="number"
        placeholder="Price Per Person"
        value={formData.price_per_person}
        onChange={(e) => setFormData({ ...formData, price_per_person: e.target.value })}
        className="w-full p-2 border rounded mb-4"
      />

      <input
        type="number"
        placeholder="Players Per Side"
        value={formData.players_per_side}
        onChange={(e) => setFormData({ ...formData, players_per_side: e.target.value })}
        className="w-full p-2 border rounded mb-4"
      />

      {/* Date + Time Slot */}
      <div className="flex gap-3 mb-4">
        <DatePicker
          selected={currentDate}
          onChange={(date) => setCurrentDate(date)}
          className="p-2 border rounded"
          placeholderText="Pick a date"
          minDate={new Date()}
        />
        <select
          value={currentTimeSlot}
          onChange={(e) => setCurrentTimeSlot(e.target.value)}
          className="p-2 border rounded flex-1"
        >
          <option value="">Select time slot</option>
          {TIME_SLOTS.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
        </select>
        <button
          type="button"
          onClick={handleAddDateSlot}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      {/* Added dates list */}
      {dates.length > 0 && (
        <ul className="mb-4 space-y-1">
          {dates.map((d, i) => (
            <li key={i} className="flex justify-between items-center text-sm">
              <span>{d.date} — {d.timeSlot}</span>
              <button
                type="button"
                onClick={() => handleRemoveDate(i)}
                className="text-red-600 text-xs ml-2"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Image Upload */}
      <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="mb-4" />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Create Pickup Game'}
      </button>
    </div>
  );
};

export default AddPickup;
