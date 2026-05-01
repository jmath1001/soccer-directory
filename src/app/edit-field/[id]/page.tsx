'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { uploadToCloudinary } from '@/utils/uploadToCloudinary';
import 'react-datepicker/dist/react-datepicker.css';
import type { RentalField } from '@/types';

type EditFormData = Omit<RentalField, 'id' | 'claimed_by' | 'payment_status' | 'created_at'>;

const EditFieldPage: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const id = pathname?.split('/').filter(Boolean).pop();

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);

  const [formData, setFormData] = useState<EditFormData>({
    facility_name: '',
    location: '',
    price_per_hour: null,
    field_surface: '',
    indoor_outdoor: '',
    lights: false,
    open_hours: '',
    website_url: '',
    image_urls: [],
    city: '',
    latitude: null,
    longitude: null,
    field_size: '',
    phone_number: '',
    availability: null,
  });

  useEffect(() => {
    if (!id) return;

    const fetchField = async () => {
      const { data, error } = await supabase
        .from('rental_fields')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        alert('Field not found');
        router.push('/');
        return;
      }

      setFormData({
        facility_name: data.facility_name ?? '',
        location: data.location ?? '',
        price_per_hour: data.price_per_hour ?? null,
        field_surface: data.field_surface ?? '',
        indoor_outdoor: data.indoor_outdoor ?? '',
        lights: data.lights ?? false,
        open_hours: data.open_hours ?? '',
        website_url: data.website_url ?? '',
        image_urls: data.image_urls ?? [],
        city: data.city ?? '',
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        field_size: data.field_size ?? '',
        phone_number: data.phone_number ?? '',
        availability: data.availability ?? null,
      });
      setLoading(false);
    };

    fetchField();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? target.checked : value,
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewImages(Array.from(e.target.files ?? []));
  };

  const handleImageUpload = async () => {
    setUploading(true);
    try {
      const uploadedURLs: string[] = [];
      for (const file of newImages) {
        const url = await uploadToCloudinary(file);
        if (url) uploadedURLs.push(url);
      }
      setFormData((prev) => ({
        ...prev,
        image_urls: [...(prev.image_urls ?? []), ...uploadedURLs],
      }));
      setNewImages([]);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      image_urls: (prev.image_urls ?? []).filter((img) => img !== url),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('rental_fields').update(formData).eq('id', id);
    if (error) {
      console.error('Update failed:', error);
      alert('Failed to update field');
    } else {
      alert('Field updated!');
      router.push(`/field/${id}`);
    }
    setLoading(false);
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
            name="facility_name"
            value={formData.facility_name}
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
            value={formData.location ?? ''}
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
            value={formData.city ?? ''}
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
            value={formData.price_per_hour ?? ''}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Field Surface</label>
          <select
            name="field_surface"
            value={formData.field_surface ?? ''}
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
            value={formData.indoor_outdoor ?? ''}
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
            name="open_hours"
            value={formData.open_hours ?? ''}
            onChange={handleChange}
            placeholder="e.g. 8AM - 10PM"
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Website URL</label>
          <input
            type="url"
            name="website_url"
            value={formData.website_url ?? ''}
            onChange={handleChange}
            placeholder="https://example.com"
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Image Upload Section */}
        <div>
          <label className="block font-semibold mb-1">Images</label>
          <div className="flex flex-wrap gap-4 mb-2">
            {(formData.image_urls ?? []).map((url) => (
              <div key={url} className="relative w-24 h-24">
                <img src={url} className="object-cover w-full h-full border rounded" alt="field" />
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
