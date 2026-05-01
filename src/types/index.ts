// Shared TypeScript types mirroring the Supabase database schema

export interface RentalField {
  id: string;
  facility_name: string;
  location: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  price_per_hour: number | null;
  field_surface: string | null;
  field_size: string | null;
  indoor_outdoor: string | null;
  lights: boolean;
  open_hours: string | null;
  website_url: string | null;
  phone_number: string | null;
  image_urls: string[];
  availability: Record<string, string[]> | null;
  claimed_by: string | null;
  payment_status: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  field_claimed: boolean;
  subscription_plan: string;
  subscribed_fields: string[];
  created_at: string;
}

export interface FieldSubmission {
  id: string;
  name: string;
  facility_name: string;
  email: string;
  phone: string;
  location: string;
  approved: boolean;
  created_at: string;
}

export interface FieldClaim {
  id: string;
  name: string;
  email: string;
  facility_name: string;
  submitted_at: string;
}

export interface PickupGame {
  id: string;
  field_name: string;
  location: string | null;
  price_per_person: number | null;
  players_per_side: number | null;
  date: string;
  time_slot: string;
  image_urls: string[];
  batch_id: string | null;
  created_at: string;
}

export interface League {
  id: string;
  league_name: string;
  players_per_side: number | null;
  price: number | null;
  gender: string | null;
  game_days: string[];
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  image_urls: string[];
  registration_deadline: string | null;
  season_start_date: string | null;
  created_at: string;
}
