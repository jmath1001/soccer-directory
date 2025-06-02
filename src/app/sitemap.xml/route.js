import { getDocs, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // adjust to your firebase config

export async function GET() {
  const snapshot = await getDocs(collection(db, 'rentalFields'));

  const baseUrl = 'https://yourdomain.com'; // replace with your real domain
  const urls = snapshot.docs.map((doc) => {
    return `
      <url>
        <loc>${baseUrl}/field/${doc.id}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
      </url>
    `;
  });

  const body = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${baseUrl}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
      </url>
      ${urls.join('')}
    </urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
