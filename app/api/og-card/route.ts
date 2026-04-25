/**
 * API Route: Generate OG Card Images
 * GET /api/og-card?id=abc123&size=og
 * 
 * Features:
 * - Generate prescription cards in 3 sizes
 * - Cache aggressively (1 hour max-age, 24 hour stale-while-revalidate)
 * - Graceful error handling with fallback
 */

import { NextRequest, NextResponse } from 'next/server';
import { getResult } from '@/lib/db';
import { generatePrescriptionCard, type CardSize } from '@/lib/og-image-generator';

// Cache config for CDN and browser
const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400', // 1h cache, 24h stale
  'Content-Type': 'image/png',
  'Content-Security-Policy': "default-src 'none'",
};

/**
 * Validate and parse query parameters
 */
function parseParams(searchParams: URLSearchParams): { id: string; size: CardSize } | null {
  const id = searchParams.get('id');
  const sizeRaw = searchParams.get('size');

  if (!id || id.length > 20) {
    return null; // Invalid ID
  }

  const size: CardSize = ['mobile', 'square', 'og'].includes(sizeRaw || '') 
    ? (sizeRaw as CardSize)
    : 'og';

  return { id, size };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params = parseParams(searchParams);

    if (!params) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { 
          status: 400,
          headers: { 'Cache-Control': 'public, max-age=60' } // Cache errors briefly
        }
      );
    }

    const { id, size } = params;

    // Fetch result from database
    const result = await getResult(id);
    if (!result) {
      return NextResponse.json(
        { error: 'Result not found' },
        { 
          status: 404,
          headers: { 'Cache-Control': 'public, max-age=3600' } // Cache 404s for 1h
        }
      );
    }

    // Generate OG image (returns ImageResponse)
    const imageResponse = await generatePrescriptionCard(result, size);
    
    // Return ImageResponse directly (Vercel handles response conversion)
    return imageResponse;
  } catch (error) {
    console.error('🔴 OG card generation error:', {
      error: error instanceof Error ? error.message : String(error),
      url: req.url,
    });

    // Return error placeholder (cached briefly)
    return NextResponse.json(
      { error: 'Image generation failed' },
      { 
        status: 500,
        headers: { 'Cache-Control': 'public, max-age=60' }
      }
    );
  }
}
