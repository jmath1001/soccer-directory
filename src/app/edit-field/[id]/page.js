'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import { uploadToCloudinary } from '@/utils/uploadToCloudinary';
import 'react-datepicker/dist/react-datepicker.css';

const EditFieldPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const id = pathname?.split('/').filter(Boolean).pop();

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newImages, setNewImages] = useState([]);

  const [formData, setFormData] = useState({
    facilityName: '',
    location: '',
    price_per_hour: '',
    fieldSurface: '',
    indoor_outdoor: '',
    lights: false,
    openHours: '',
    websiteURL: '',
    imageURLs: [],
    city: '',
  });

  useEffect(() => {
    if (!id) return;

    const fetchField = async () => {
      try {
        const docRef = doc(db, 'rentalFields', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData((prev) => ({
            ...prev,
            ...docSnap.data(),
            city: docSnap.data().city || '',
          }));
        } else {
          alert('Field not found');
          router.push('/');
        }
      } catch (error) {
        console.error('Error fetching field:', error);
        alert('Failed to load field');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchField();
  }, [id, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageSelect = (e) => {
    setNewImages(Array.from(e.target.files));
  };

  const handleImageUpload = async () => {
    setUploading(true);
    try {
      const uploadedURLs = [];
      for (const file of newImages) {
        const url = await uploadToCloudinary(file);
        uploadedURLs.push(url);
      }
      setFormData((prev) => ({
        ...prev,
        imageURLs: [...prev.imageURLs, ...uploadedURLs],
      }));
      setNewImages([]);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (url) => {
    setFormData((prev) => ({
      ...prev,
      imageURLs: prev.imageURLs.filter((img) => img !== url),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const docRef = doc(db, 'rentalFields', id);
      await updateDoc(docRef, formData);
      alert('Field updated!');
      router.push(`/field/${id}`);
    } catch (error) {
      console.error('Update failed:', error);
      alert('Failed to update field');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Field</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-1 font-semibold">Facility Name</label>
          <input
            type="text"
            name="facilityName"
            value={formData.facilityName}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Nearest Metro City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="e.g. Atlanta"
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Price per Hour</label>
          <input
            type="number"
            name="price_per_hour"
            value={formData.price_per_hour}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Field Surface</label>
          <select
            name="fieldSurface"
            value={formData.fieldSurface}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">Select surface</option>
            <option value="Grass">Grass</option>
            <option value="Turf">Turf</option>
            <option value="Hardcourt">Hardcourt</option>
            <option value="Futsal">Futsal</option>
          </select>
        </div>

        <div>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="lights"
              checked={formData.lights}
              onChange={handleChange}
            />
            Has Lights
          </label>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Indoor/Outdoor</label>
          <select
            name="indoor_outdoor"
            value={formData.indoor_outdoor}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">Select</option>
            <option value="Indoor">Indoor</option>
            <option value="Outdoor">Outdoor</option>
            <option value="Open Play">Open Play</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Open Hours</label>
          <input
            type="text"
            name="openHours"
            value={formData.openHours}
            onChange={handleChange}
            placeholder="e.g. 8AM - 10PM"
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Website URL</label>
          <input
            type="url"
            name="websiteURL"
            value={formData.websiteURL}
            onChange={handleChange}
            placeholder="https://example.com"
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Image Upload Section */}
        <div>
          <label className="block font-semibold mb-1">Images</label>
          <div className="flex flex-wrap gap-4 mb-2">
            {formData.imageURLs.map((url) => (
              <div key={url} className="relative w-24 h-24">
                <img
                  src={url}
                  className="object-cover w-full h-full border rounded"
                  alt="field"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(url)}
                  className="absolute top-0 right-0 bg-red-600 text-white px-1 rounded-full"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageSelect}
            disabled={uploading}
          />
          <button
            type="button"
            onClick={handleImageUpload}
            disabled={uploading || newImages.length === 0}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Images'}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-semibold"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default EditFieldPage;
