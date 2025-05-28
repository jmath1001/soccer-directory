'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Head from 'next/head';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
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

const EditField = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [field, setField] = useState(null);
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
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchField = async () => {
      try {
        const fieldDocRef = doc(db, 'rentalFields', id);
        const fieldDoc = await getDoc(fieldDocRef);
        if (fieldDoc.exists()) {
          const fieldData = fieldDoc.data();
          setField(fieldData);
          setFormData({
            facilityName: fieldData.facilityName || '',
            fieldSize: fieldData.fieldSize || '',
            fieldSurface: fieldData.fieldSurface || '',
            indoor_outdoor: fieldData.indoor_outdoor || '',
            location: fieldData.location || '',
            price_per_hour: fieldData.price_per_hour || '',
            openHours: fieldData.openHours || {},
            availability: fieldData.availability || {},
            phoneNumber: fieldData.phoneNumber || '',
            websiteURL: fieldData.websiteURL || '',
          });
          setImageURLs(fieldData.imageURLs || []);
        } else {
          alert('Field not found.');
          router.push('/');
        }
      } catch (error) {
        console.error('Error fetching field:', error);
        alert('Failed to load field data.');
      }
      setLoading(false);
    };

    fetchField();
  }, [id, router]);

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

    try {
      const fieldRef = doc(db, 'rentalFields', id);

      let coordinates = { latitude: field?.latitude, longitude: field?.longitude };

      if (formData.location !== field?.location) {
        const geoResult = await geocodeAddress(formData.location);
        if (!geoResult) {
          alert('Could not geocode the new location. Please enter a valid address.');
          return;
        }
        coordinates = geoResult;
      }

      await updateDoc(fieldRef, {
        ...formData,
        imageURLs,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      });

      alert('Field updated successfully!');
      router.push(`/field/${id}`);
    } catch (error) {
      console.error('Error updating field:', error);
      alert('There was a problem updating the field. Please try again.');
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <>
      <Head>
        <title>Edit Soccer Field | SoccerDiscovery</title>
        <meta name="description" content="Edit soccer field details, availability, and images." />
        <meta name="robots" content="index, follow" />
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

        <h1 className="text-4xl font-extrabold mb-8 text-gray-800 text-center">Edit Field</h1>

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

          {/* Price per hour */}
          <div>
            <label htmlFor="price_per_hour" className="block text-gray-700 font-semibold mb-2">
              Price per Hour (USD)
            </label>
            <input
              id="price_per_hour"
              name="price_per_hour"
              type="number"
              value={formData.price_per_hour}
              onChange={handleChange}
              placeholder="Enter price per hour"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
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
              placeholder="Enter phone number"
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

          {/* Open Hours */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Open Hours</h2>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
              (day) => (
                <div key={day} className="mb-2">
                  <label className="block text-gray-700 font-medium">{day}</label>
                  <input
                    type="text"
                    name={day}
                    value={formData.openHours[day] || ''}
                    onChange={(e) => handleOpenHoursChange(e, day)}
                    placeholder="e.g. 8 AM - 9 PM"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ),
            )}
          </div>

          {/* Images */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Images</h2>
            <div className="flex flex-wrap gap-4 mb-4">
              {imageURLs.map((url, idx) => (
                <div key={idx} className="relative w-32 h-24 rounded overflow-hidden border border-gray-300">
                  <img src={url} alt={`Field image ${idx + 1}`} className="object-cover w-full h-full" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                    aria-label="Remove image"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block"
              aria-label="Upload field image"
            />
          </div>

          {/* Availability */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Availability</h2>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              inline
              minDate={new Date()}
              aria-label="Select date for availability"
            />

            {selectedDate && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">
                  Select time slots for {formatDate(selectedDate)}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {TIME_SLOTS.map((slot) => {
                    const dateKey = formatDate(selectedDate);
                    const isSelected =
                      formData.availability[dateKey]?.includes(slot) ?? false;

                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => toggleTimeSlot(slot)}
                        className={`p-2 rounded border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300'
                        } hover:bg-blue-500 hover:text-white`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditField;
