'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { collection, doc, setDoc } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { db } from '@/firebase/firebaseConfig';
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

const formatDate = (date) => date.toISOString().split('T')[0];

const AddField = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    facilityName: '',
    fieldSize: '',
    fieldSurface: '',
    indoor_outdoor: '',
    location: '',
    price_per_hour: '',
    openHours: {},
    availability: {},
    phoneNumber: '',
    websiteURL: '',
  });
  const [imageURLs, setImageURLs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenHoursChange = (e, day) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      openHours: {
        ...prev.openHours,
        [day]: value,
      },
    }));
  };

  const toggleTimeSlot = (slot) => {
    if (!selectedDate) return;
    const dateKey = formatDate(selectedDate);
    const currentSlots = formData.availability[dateKey] || [];

    const updatedSlots = currentSlots.includes(slot)
      ? currentSlots.filter((s) => s !== slot)
      : [...currentSlots, slot];

    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [dateKey]: updatedSlots,
      },
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const imageUrl = await uploadToCloudinary(file);
      if (imageUrl) {
        setImageURLs((prev) => [...prev, imageUrl]);
      }
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image.');
    }
  };

  const removeImage = (index) => {
    setImageURLs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.facilityName.trim() || !formData.location.trim()) {
      alert('Facility Name and Location are required.');
      return;
    }

    setLoading(true);

    try {
      // Generate a new doc ref with random ID
      const newFieldRef = doc(collection(db, 'rentalFields'));

      // Geocode location
      const geoResult = await geocodeAddress(formData.location);
      if (!geoResult) {
        alert('Could not geocode the location. Please enter a valid address.');
        setLoading(false);
        return;
      }

      // Save new field data
      await setDoc(newFieldRef, {
        ...formData,
        imageURLs,
        latitude: geoResult.latitude,
        longitude: geoResult.longitude,
      });

      alert('Field added successfully!');
      router.push(`/field/${newFieldRef.id}`);
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
        {/* Back Arrow */}
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 text-gray-700 hover:text-gray-900 flex items-center space-x-1"
          aria-label="Go back"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>

        <h1 className="text-4xl font-extrabold mb-8 text-gray-800 text-center">Add New Field</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Facility Name */}
          <div>
            <label htmlFor="facilityName" className="block text-gray-700 font-semibold mb-2">
              Facility Name <span className="text-red-500">*</span>
            </label>
            <input
              id="facilityName"
              name="facilityName"
              type="text"
              value={formData.facilityName}
              onChange={handleChange}
              placeholder="Enter facility name"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-gray-700 font-semibold mb-2">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter full address"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Dropdown selects */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label htmlFor="indoor_outdoor" className="block text-gray-700 font-semibold mb-2">
                Indoor or Outdoor
              </label>
              <select
                id="indoor_outdoor"
                name="indoor_outdoor"
                value={formData.indoor_outdoor}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select one</option>
                {indoorOutdoorOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="fieldSurface" className="block text-gray-700 font-semibold mb-2">
                Field Surface
              </label>
              <select
                id="fieldSurface"
                name="fieldSurface"
                value={formData.fieldSurface}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select one</option>
                                {fieldSurfaceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="fieldSize" className="block text-gray-700 font-semibold mb-2">
                Field Size
              </label>
              <select
                id="fieldSize"
                name="fieldSize"
                value={formData.fieldSize}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select one</option>
                {fieldSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price Per Hour */}
          <div>
            <label htmlFor="price_per_hour" className="block text-gray-700 font-semibold mb-2">
              Price per Hour (USD)
            </label>
            <input
              id="price_per_hour"
              name="price_per_hour"
              type="number"
              min="0"
              step="0.01"
              value={formData.price_per_hour}
              onChange={handleChange}
              placeholder="e.g. 25.00"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Open Hours (simple inputs for each day) */}
          <div>
            <h2 className="font-semibold mb-2 text-gray-700">Open Hours</h2>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <div key={day} className="mb-2">
                <label htmlFor={`openHours-${day}`} className="block text-gray-600">
                  {day} (e.g., 8:00 AM - 9:00 PM)
                </label>
                <input
                  id={`openHours-${day}`}
                  name={day}
                  type="text"
                  value={formData.openHours[day] || ''}
                  onChange={(e) => handleOpenHoursChange(e, day)}
                  placeholder="Closed if empty"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>

          {/* Availability Date Picker and Time Slots */}
          <div>
            <h2 className="font-semibold mb-2 text-gray-700">Availability</h2>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              placeholderText="Select a date to add time slots"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              minDate={new Date()}
              dateFormat="yyyy-MM-dd"
            />
            {selectedDate && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const dateKey = formatDate(selectedDate);
                  const isSelected = formData.availability[dateKey]?.includes(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => toggleTimeSlot(slot)}
                      className={`p-2 rounded-md border ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className="block text-gray-700 font-semibold mb-2">
              Phone Number
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="e.g. (123) 456-7890"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Website URL */}
          <div>
            <label htmlFor="websiteURL" className="block text-gray-700 font-semibold mb-2">
              Website URL
            </label>
            <input
              id="websiteURL"
              name="websiteURL"
              type="url"
              value={formData.websiteURL}
              onChange={handleChange}
              placeholder="https://example.com"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="imageUpload" className="block text-gray-700 font-semibold mb-2">
              Upload Images
            </label>
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="mb-3"
            />
            <div className="flex flex-wrap gap-3">
              {imageURLs.map((url, idx) => (
                <div key={idx} className="relative w-24 h-24 border rounded-md overflow-hidden">
                  <img src={url} alt={`Field image ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-800"
                    aria-label="Remove image"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Field
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddField;
