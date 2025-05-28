'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '@/firebase/firebaseConfig';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import Link from 'next/link';

const ADMIN_EMAIL = 'opatmath@gmail.com';

const RentalFieldsManage = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();

  // Admin Access Control
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/');
      }
    }
  }, [user, authLoading, router]);

  // Fetch rental fields
  useEffect(() => {
    const fetchFields = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'rentalFields'));
        const fieldsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFields(fieldsList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching fields:', error);
      }
    };

    fetchFields();
  }, []);

  const handleDelete = async (fieldId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this field?');
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'rentalFields', fieldId));
      setFields((prevFields) => prevFields.filter((field) => field.id !== fieldId));
    } catch (error) {
      console.error('Error deleting field:', error);
    }
  };

  if (loading || authLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Rental Fields</h1>
      <div className="grid gap-4">
        {fields.map((field) => (
          <div key={field.id} className="border p-4 rounded shadow flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{field.facilityName}</h2>
              <p className="text-gray-600">{field.location}</p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/edit-field/${field.id}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(field.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RentalFieldsManage;
