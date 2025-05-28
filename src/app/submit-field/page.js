'use client';

import React, { useState } from 'react';
import { db } from '@/firebase/firebaseConfig';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SubmitFieldPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    facilityName: '',
    email: '',
    phone: '',
    location: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await addDoc(collection(db, 'fieldSubmissions'), {
        ...formData,
        approved: false,
        createdAt: serverTimestamp(),
      });
      alert('Thank you! Your field has been submitted for review.');
      router.push('/');
    } catch (error) {
      console.error('Error submitting field:', error);
      alert('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <Link href="/field-owners" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
        ← Back to Field Owners
      </Link>

      <h1 className="text-3xl font-bold mb-4">Submit a Field</h1>

      <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded mb-6 text-sm">
        Fill out this form to submit a new soccer field to our platform. We'll review it and list it shortly.
        Our team may contact you to verify ownership.
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          name="facilityName"
          placeholder="Facility Name"
          value={formData.facilityName}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <input
          type="tel"
          name="phone"
          placeholder="Your Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <textarea
          name="location"
          placeholder="Field Location (City, Address, or Description)"
          value={formData.location}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded h-24"
        />

        <button
          type="submit"
          disabled={submitting}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {submitting ? 'Submitting...' : 'Submit Field'}
        </button>
      </form>
    </main>
  );
}
