'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { supabase } from '@/lib/supabaseClient';
import { geocodeAddress } from '@/utils/geocode';
import { uploadToCloudinary } from '@/utils/uploadToCloudinary';

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

const indoorOutdoorOptions = ['Indoor', 'Outdoor', 'Both'];
const fieldSurfaceOptions = ['Grass', 'Artificial Turf', 'Dirt', 'Concrete', 'Other'];
const fieldSizeOptions = ['Small', 'Medium', 'Large', 'Full-size'];

const formatDate = (date: Date) => date.toISOString().split('T')[0];

interface FormData {
  facility_name: string;
  field_size: string;
  field_surface: string;
  indoor_outdoor: string;
  location: string;
  latitude: string;
  longitude: string;
  price_per_hour: string;
  open_hours: Record<string, string>;
  availability: Record<string, string[]>;
  phone_number: string;
  website_url: string;
}

const AddField: React.FC = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    facility_name: '',
    field_size: '',
    field_surface: '',
    indoor_outdoor: '',
    location: '',
    latitude: '',
    longitude: '',
    price_per_hour: '',
    open_hours: {},
    availability: {},
    phone_number: '',
    website_url: '',
  });

  const [useLatLong, setUseLatLong] = useState(false);
  const [imageURLs, setImageURLs] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenHoursChange = (e: React.ChangeEvent<HTMLInputElement>, day: string) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      open_hours: { ...prev.open_hours, [day]: value },
    }));
  };

  const toggleTimeSlot = (slot: string) => {
    if (!selectedDate) return;
    const dateKey = formatDate(selectedDate);
    const currentSlots = formData.availability[dateKey] ?? [];
    const updatedSlots = currentSlots.includes(slot)
      ? currentSlots.filter((s) => s !== slot)
      : [...currentSlots, slot];
    setFormData((prev) => ({
      ...prev,
      availability: { ...prev.availability, [dateKey]: updatedSlots },
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imageUrl = await uploadToCloudinary(file);
      if (imageUrl) setImageURLs((prev) => [...prev, imageUrl]);
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image.');
    }
  };

  const removeImage = (index: number) => {
    setImageURLs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.facility_name.trim()) {
      alert('Facility Name is required.');
      return;
    }

    if (!useLatLong && !formData.location.trim()) {
      alert('Please enter a location or switch to manual latitude/longitude input.');
      return;
    }

    if (
      useLatLong &&
      (formData.latitude.trim() === '' ||
        formData.longitude.trim() === '' ||
        isNaN(parseFloat(formData.latitude)) ||
        isNaN(parseFloat(formData.longitude)))
    ) {
      alert('Please enter valid latitude and longitude values.');
      return;
    }

    setLoading(true);

    try {
      let latitude: number | null = null;
      let longitude: number | null = null;

      if (!useLatLong) {
        const geoResult = await geocodeAddress(formData.location);
        if (!geoResult) {
          alert('Could not geocode the location. Please enter a valid address.');
          setLoading(false);
          return;
        }
        latitude = geoResult.latitude;
        longitude = geoResult.longitude;
      } else {
        latitude = parseFloat(formData.latitude);
        longitude = parseFloat(formData.longitude);
      }

      const { error } = await supabase.from('rental_fields').insert({
        facility_name: formData.facility_name,
        field_size: formData.field_size,
        field_surface: formData.field_surface,
        indoor_outdoor: formData.indoor_outdoor,
        location: formData.location,
        latitude,
        longitude,
        price_per_hour: formData.price_per_hour ? parseFloat(formData.price_per_hour) : null,
        open_hours: formData.open_hours,
        availability: formData.availability,
        phone_number: formData.phone_number,
        website_url: formData.website_url,
        image_urls: imageURLs,
      });

      if (error) throw error;

      alert('Field added successfully!');
      router.push('/browse');
    } catch (error) {
      console.error('Error adding field:', error);
      alert('There was a problem adding the field. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <>
      <Head>
        <title>Add Soccer Field | SoccerDiscovery</title>
        <meta name="description" content="Add a new soccer field with details, availability, and images." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="container mx-auto p-4 max-w-xl bg-white shadow-lg rounded-lg relative mt-16">
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 text-gray-700 hover:text-gray-900 flex items-center space-x-1"
          aria-label="Go back"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>

        <h1 className="text-4xl font-extrabold mb-8 text-gray-800 text-center">Add New Field</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="facility_name" className="block text-gray-700 font-semibold mb-2">
              Facility Name <span className="text-red-500">*</span>
            </label>
            <input
              id="facility_name"
              name="facility_name"
              type="text"
              value={formData.facility_name}
              onChange={handleChange}
              placeholder="Enter facility name"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                checked={useLatLong}
                onChange={() => setUseLatLong((prev) => !prev)}
                className="form-checkbox"
              />
              <span className="text-gray-700">Enter Latitude &amp; Longitude manually</span>
            </label>
          </div>

          {!useLatLong ? (
            <div>
              <label htmlFor="location" className="block text-gray-700 font-semibold mb-2">
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter full address"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-gray-700 font-semibold mb-2">Latitude</label>
                <input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="e.g. 34.0522"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="longitude" className="block text-gray-700 font-semibold mb-2">Longitude</label>
                <input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="e.g. -118.2437"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="field_size" className="block text-gray-700 font-semibold mb-2">Field Size</label>
            <select
              id="field_size"
              name="field_size"
              value={formData.field_size}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select size</option>
              {fieldSizeOptions.map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="field_surface" className="block text-gray-700 font-semibold mb-2">Field Surface</label>
            <select
              id="field_surface"
              name="field_surface"
              value={formData.field_surface}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select surface</option>
              {fieldSurfaceOptions.map((surface) => <option key={surface} value={surface}>{surface}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="indoor_outdoor" className="block text-gray-700 font-semibold mb-2">Indoor / Outdoor</label>
            <select
              id="indoor_outdoor"
              name="indoor_outdoor"
              value={formData.indoor_outdoor}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select</option>
              {indoorOutdoorOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="price_per_hour" className="block text-gray-700 font-semibold mb-2">Price per Hour ($)</label>
            <input
              id="price_per_hour"
              name="price_per_hour"
              type="number"
              value={formData.price_per_hour}
              onChange={handleChange}
              placeholder="e.g. 50"
              min="0"
              step="0.01"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="phone_number" className="block text-gray-700 font-semibold mb-2">Phone Number</label>
            <input
              id="phone_number"
              name="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="website_url" className="block text-gray-700 font-semibold mb-2">Website URL</label>
            <input
              id="website_url"
              name="website_url"
              type="url"
              value={formData.website_url}
              onChange={handleChange}
              placeholder="https://example.com"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Availability */}
          <div>
            <h3 className="text-gray-700 font-semibold mb-2">Availability</h3>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholderText="Select a date"
              minDate={new Date()}
            />
            {selectedDate && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const dateKey = formatDate(selectedDate);
                  const isSelected = formData.availability[dateKey]?.includes(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => toggleTimeSlot(slot)}
                      className={`text-sm px-2 py-1 rounded border ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Upload Images</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            <div className="flex flex-wrap gap-2 mt-2">
              {imageURLs.map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} alt="" className="w-20 h-20 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-1 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold"
          >
            {loading ? 'Adding...' : 'Add Field'}
          </button>
        </form>
      </div>
    </>
  );
};

export default AddField;
