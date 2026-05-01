'use client';

import { useState } from 'react';

export default function ClaimField() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    facilityName: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.facilityName) {
      alert('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/claim-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        alert('Submission failed. Please try again.');
      }
    } catch (err) {
      alert('Error: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto p-8 bg-white rounded-lg shadow-lg space-y-8">
      <h1 className="text-4xl font-extrabold text-center text-green-700">
        Claim Your Field Listing
      </h1>
      <p className="text-center text-gray-700 text-lg max-w-prose mx-auto">
        Are you the owner of this facility? Claim your listing to gain full control. Once claimed, you
        can update all the information on this page and add pickup games, leagues, and more to keep
        your community engaged.
      </p>
      <p className="text-center text-gray-600 text-lg">
        Submit your details below to start the process. Our team will contact you shortly to help
        verify your ownership and enable editing.
      </p>

      {submitted ? (
        <div className="text-center text-green-700 font-semibold">
          ✅ Submission received! We&apos;ll be in touch soon.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">Your Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-md"
              placeholder="Enter your full name"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-md"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Facility Name</label>
            <input
              name="facilityName"
              value={formData.facilityName}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-md"
              placeholder="Enter your facility&apos;s name"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Claim My Listing'}
          </button>
        </form>
      )}
    </main>
  );
}
