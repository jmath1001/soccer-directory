import { db } from '@/firebase/firebaseConfig'; // adjust path if needed
import { collection, getDocs } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://soccerfieldrental.net'; // <-- your domain

  // Static pages
  const staticUrls = [
    {
      loc: `${baseUrl}/`,
      lastmod: '2025-06-13T01:58:04.665Z',
      changefreq: 'daily',
      priority: '0.7',
    },
    {
      loc: `${baseUrl}/browse`,
      lastmod: '2025-06-13T01:58:04.666Z',
      changefreq: 'daily',
      priority: '0.7',
    },
    {
      loc: `${baseUrl}/field-owners`,
      lastmod: '2025-06-13T01:58:04.666Z',
      changefreq: 'daily',
      priority: '0.7',
    },
  ].map(({ loc, lastmod, changefreq, priority }) => {
    return `
      <url>
        <loc>${loc}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>${changefreq}</changefreq>
        <priority>${priority}</priority>
      </url>`;
  });

  // Dynamic field listings from Firestore
  let dynamicUrls = [];
  try {
    const snapshot = await getDocs(collection(db, 'rentalFields'));
    dynamicUrls = snapshot.docs.map((doc) => {
      return `
        <url>
          <loc>${baseUrl}/field/${doc.id}</loc>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>`;
    });
  } catch (error) {
    console.error('Error fetching Firestore documents for sitemap:', error);
  }

  // Final XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset 
    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
    xmlns:xhtml="http://www.w3.org/1999/xhtml"
    xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
    xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
    xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
  >
    ${[...staticUrls, ...dynamicUrls].join('')}
  </urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
