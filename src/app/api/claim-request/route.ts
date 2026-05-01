import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  try {
    const { name, email, facilityName } = await req.json() as {
      name?: string;
      email?: string;
      facilityName?: string;
    };

    if (!name || !email || !facilityName) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.from('field_claims').insert({
      name,
      email,
      facility_name: facilityName,
      submitted_at: new Date().toISOString(),
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving claim:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
