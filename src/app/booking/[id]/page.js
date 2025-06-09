'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const mockAvailability = {
  '2025-06-10': ['10:00 AM', '11:00 AM', '3:00 PM'],
  '2025-06-11': ['9:00 AM', '1:00 PM', '4:00 PM'],
  '2025-06-12': [],
  '2025-06-13': ['12:00 PM', '2:00 PM'],
};

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

export default function BookingPage() {
  const router = useRouter();
  const { id } = useParams();

  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);

  function onDateChange(date) {
    setSelectedDate(date);
    const dateKey = formatDate(date);
    setAvailableSlots(mockAvailability[dateKey] || []);
  }

  function tileClassName({ date, view }) {
    if (view === 'month') {
      const dateKey = formatDate(date);
      if (mockAvailability.hasOwnProperty(dateKey)) {
        return mockAvailability[dateKey].length > 0
          ? 'bg-green-200 text-green-800 rounded'
          : 'bg-red-200 text-red-800 rounded';
      }
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 p-4">
      <button
        onClick={() => router.back()}
        className="mb-4 px-3 py-1 rounded border border-gray-400 hover:bg-gray-100 transition"
      >
        ← Back
      </button>

      <div className="mb-6 p-4 bg-gray-50 rounded shadow-sm max-w-md mx-auto">
        <h1 className="text-2xl font-semibold mb-2">Booking Policy</h1>
        <p className="text-gray-700 text-sm">
          Please review our booking policies carefully before selecting a date.
          Cancellations must be made 24 hours in advance. Payment is required to confirm your booking.
        </p>
      </div>

      <div className="max-w-md mx-auto p-4 border rounded shadow-sm">
        <Calendar
          onChange={onDateChange}
          value={selectedDate}
          tileClassName={tileClassName}
          minDate={new Date()}
        />
      </div>

      {selectedDate && (
        <div className="max-w-md mx-auto mt-6 px-4">
          <h2 className="text-xl font-semibold mb-3">
            Available time slots for {selectedDate.toDateString()}
          </h2>

          {availableSlots.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  className="px-3 py-2 border border-green-500 text-green-700 rounded hover:bg-green-100 transition"
                  onClick={() => alert(`You selected ${slot}`)}
                >
                  {slot}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-red-600 font-medium">No available slots for this day.</p>
          )}

          <button
            disabled={availableSlots.length === 0}
            onClick={() =>
              router.push(`/payment/${id}?date=${formatDate(selectedDate)}`)
            }
            className={`mt-6 w-full py-3 rounded text-white ${
              availableSlots.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            } transition`}
          >
            Continue to Payment
          </button>
        </div>
      )}
    </div>
  );
}
