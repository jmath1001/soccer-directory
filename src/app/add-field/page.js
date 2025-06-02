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
    latitude: '',
    longitude: '',
    price_per_hour: '',
    openHours: {},
    availability: {},
    phoneNumber: '',
    websiteURL: '',
  });

  const [useLatLong, setUseLatLong] = useState(false); // toggle for manual lat/long input
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

    // Validate facility name
    if (!formData.facilityName.trim()) {
      alert('Facility Name is required.');
      return;
    }

    // Validate location or lat/long input
    if (!useLatLong) {
      // Location mode
      if (!formData.location.trim()) {
        alert('Please enter a location or switch to manual latitude/longitude input.');
        return;
      }
    } else {
      // Manual lat/long mode
      if (
        formData.latitude.trim() === '' ||
        formData.longitude.trim() === '' ||
        isNaN(parseFloat(formData.latitude)) ||
        isNaN(parseFloat(formData.longitude))
      ) {
        alert('Please enter valid latitude and longitude values.');
        return;
      }
    }

    setLoading(true);

    try {
      const newFieldRef = doc(collection(db, 'rentalFields'));

      let latitude, longitude;

      if (!useLatLong) {
        // Geocode location string
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

      await setDoc(newFieldRef, {
        ...formData,
        latitude,
        longitude,
        imageURLs,
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

          {/* Toggle Location / LatLong input */}
          <div className="mb-4">
            <label className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                checked={useLatLong}
                onChange={() => setUseLatLong((prev) => !prev)}
                className="form-checkbox"
              />
              <span className="text-gray-700">Enter Latitude & Longitude manually (instead of Location)</span>
            </label>
          </div>

          {!useLatLong ? (
            <div>
              <label htmlFor="location" className="block text-gray-700 font-semibold mb-2">
                Location (optional)
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
                <label htmlFor="latitude" className="block text-gray-700 font-semibold mb-2">
                  Latitude
                </label>
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
                <label htmlFor="longitude" className="block text-gray-700 font-semibold mb-2">
                  Longitude
                </label>
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

          {/* Field Size */}
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
              <option value="">Select size</option>
              {fieldSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Field Surface */}
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
              <option value="">Select surface</option>
              {fieldSurfaceOptions.map((surface) => (
                <option key={surface} value={surface}>
                  {surface}
                </option>
              ))}
            </select>
          </div>

          {/* Indoor/Outdoor */}
          <div>
            <label htmlFor="indoor_outdoor" className="block text-gray-700 font-semibold mb-2">
              Indoor / Outdoor
            </label>
            <select
              id="indoor_outdoor"
              name="indoor_outdoor"
              value={formData.indoor_outdoor}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select</option>
              {indoorOutdoorOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Price Per Hour */}
          <div>
            <label htmlFor="price_per_hour" className="block text-gray-700 font-semibold mb-2">
              Price Per Hour ($)
            </label>
            <input
              id="price_per_hour"
              name="price_per_hour"
              type="number"
              min="0"
              value={formData.price_per_hour}
              onChange={handleChange}
              placeholder="0"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              placeholder="(optional)"
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
              placeholder="(optional)"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Open Hours */}
          <div>
            <h2 className="text-xl font-bold mb-3 text-gray-800">Open Hours (optional)</h2>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <div key={day} className="mb-2">
                <label htmlFor={`openHours-${day}`} className="block text-gray-700 font-semibold mb-1">
                  {day}
                </label>
                <input
                  id={`openHours-${day}`}
                  name={`openHours-${day}`}
                  type="text"
                  placeholder="e.g. 8:00 AM - 9:00 PM"
                  value={formData.openHours[day] || ''}
                  onChange={(e) => handleOpenHoursChange(e, day)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>

          {/* Availability */}
          <div>
            <h2 className="text-xl font-bold mb-3 text-gray-800">Availability (optional)</h2>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              placeholderText="Select a date"
              className="p-3 border border-gray-300 rounded-md w-full mb-3"
              minDate={new Date()}
              dateFormat="yyyy-MM-dd"
            />
            {selectedDate && (
              <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto mb-4 border border-gray-200 rounded p-2">
                {TIME_SLOTS.map((slot) => {
                  const dateKey = formatDate(selectedDate);
                  const isSelected = formData.availability[dateKey]?.includes(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => toggleTimeSlot(slot)}
                      className={`py-2 px-3 rounded ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Images Upload */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Upload Images (optional)</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-4" />
            <div className="flex flex-wrap gap-4">
              {imageURLs.map((url, index) => (
                <div key={index} className="relative w-24 h-24 rounded overflow-hidden shadow-md">
                  <img src={url} alt={`Field image ${index + 1}`} className="object-cover w-full h-full" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-bl px-1.5 py-0.5 text-xs hover:bg-red-700"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-700 text-white font-bold rounded-md hover:bg-blue-800 transition"
          >
            Add Field
          </button>
        </form>
      </div>
    </>
  );
};

export default AddField;
