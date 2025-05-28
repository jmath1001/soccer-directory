// app/api/claim-request/route.js
import { NextResponse } from 'next/server';
import { db } from '@/firebase'; // adjust path to your firebase config
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req) {
  try {
    const { name, email, facilityName } = await req.json();

    if (!name || !email || !facilityName) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await addDoc(collection(db, 'fieldClaims'), {
      name,
      email,
      facilityName,
      submittedAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving claim:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
