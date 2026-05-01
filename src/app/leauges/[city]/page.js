import { redirect } from 'next/navigation';

export default async function LeaguesLegacyRedirect({ params }) {
  const { city } = await params;
  redirect(`/leagues/${city}`);
}
