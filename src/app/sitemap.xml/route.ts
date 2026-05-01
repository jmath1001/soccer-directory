import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://soccerfieldrental.net';

  const staticUrls = [
    { loc: `${baseUrl}/`, lastmod: '2025-06-13T01:58:04.665Z', changefreq: 'daily', priority: '0.7' },
    { loc: `${baseUrl}/browse`, lastmod: '2025-06-13T01:58:04.666Z', changefreq: 'daily', priority: '0.7' },
    { loc: `${baseUrl}/field-owners`, lastmod: '2025-06-13T01:58:04.666Z', changefreq: 'daily', priority: '0.7' },
  ].map(({ loc, lastmod, changefreq, priority }) => `
      <url>
        <loc>${loc}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>${changefreq}</changefreq>
        <priority>${priority}</priority>
      </url>`);

  let dynamicUrls: string[] = [];
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('rental_fields').select('id');
    if (error) throw error;
    dynamicUrls = (data ?? []).map(
      (row: { id: string }) => `
        <url>
          <loc>${baseUrl}/field/${row.id}</loc>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>`
    );
  } catch (error) {
    console.error('Error fetching fields for sitemap:', error);
  }

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
    headers: { 'Content-Type': 'application/xml' },
  });
}
