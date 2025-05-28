'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/firebase/firebaseConfig';
import Link from 'next/link';

const MyFieldsPage = () => {
  const [user, loadingAuth] = useAuthState(auth);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchFields = async () => {
      try {
        const q = query(
          collection(db, 'rentalFields'), // ✅ use `db` instead of `firestore`
          where('claimedBy', '==', user.uid),
          where('paymentStatus', '==', 'paid')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFields(data);
      } catch (error) {
        console.error('Error fetching claimed fields:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, [user]);

  if (loadingAuth || loading) return <p className="p-4">Loading your fields...</p>;

  if (!user) return <p className="p-4 text-red-600">You must be logged in to view this page.</p>;

  if (fields.length === 0)
    return <p className="p-4">You haven’t claimed any fields yet.</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">My Claimed Fields</h1>
      <ul className="space-y-4">
        {fields.map(field => (
          <li key={field.id} className="p-4 border rounded-md shadow-sm bg-white">
            <h2 className="text-lg font-semibold">{field.facilityName}</h2>
            <p className="text-sm text-gray-600">{field.location}</p>
            <Link
              href={`/edit-field/${field.id}`}
              className="mt-2 inline-block text-blue-600 hover:underline text-sm"
            >
              Edit Field
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyFieldsPage;
