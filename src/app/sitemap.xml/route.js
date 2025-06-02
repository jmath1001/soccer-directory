import { getDocs, collection } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig'; // adjust path as needed

export async function GET() {
  const snapshot = await getDocs(collection(db, 'rentalFields'));
  const baseUrl = 'https://soccer-directory.vercel.app';

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const urls = snapshot.docs.map((doc) => `
    <url>
      <loc>${baseUrl}/field/${doc.id}</loc>
      <lastmod>${today}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>
  `);

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${urls.join('')}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
