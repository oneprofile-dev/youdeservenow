/**
 * OG Image Generator for Prescription Cards
 * Generates shareable cards in 3 sizes for social media
 * - Mobile: 1080×1920 (TikTok/Reels/Stories)
 * - Square: 1080×1080 (Instagram feed/Threads)
 * - OG: 1200×630 (Open Graph/X/LinkedIn/iMessage)
 */

import { ImageResponse } from '@vercel/og';
import type { Result } from '@/lib/db';

export type CardSize = 'mobile' | 'square' | 'og';

const SIZE_CONFIG: Record<CardSize, { width: number; height: number }> = {
  mobile: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
  og: { width: 1200, height: 630 },
};

/**
 * Get appropriate padding/sizing for different card sizes
 */
function getSizeConfig(size: CardSize) {
  return {
    mobile: {
      headerSize: '32px',
      titleSize: '48px',
      verdictSize: '28px',
      productImageSize: 100,
      productFontSize: '18px',
      priceFontSize: '16px',
    },
    square: {
      headerSize: '24px',
      titleSize: '36px',
      verdictSize: '20px',
      productImageSize: 80,
      productFontSize: '16px',
      priceFontSize: '14px',
    },
    og: {
      headerSize: '20px',
      titleSize: '28px',
      verdictSize: '16px',
      productImageSize: 80,
      productFontSize: '14px',
      priceFontSize: '12px',
    },
  }[size];
}

/**
 * Truncate text to a reasonable length for the card
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1).replace(/\s+\S*$/, '') + '…';
}

/**
 * Generate a prescription card image in specified size
 * Optimized with proper error handling and caching considerations
 */
export async function generatePrescriptionCard(
  result: Result,
  size: CardSize = 'og'
): Promise<ImageResponse> {
  const config = getSizeConfig(size);
  const sizeConfig = SIZE_CONFIG[size];

  // Truncate inputs for different sizes
  const titleMaxLength = size === 'mobile' ? 100 : size === 'square' ? 80 : 60;
  const verdictMaxLength = size === 'mobile' ? 180 : size === 'square' ? 140 : 100;

  const truncatedTitle = truncateText(result.input, titleMaxLength);
  const truncatedVerdict = truncateText(result.justification, verdictMaxLength);

  try {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #f5f3f0 0%, #e8e4df 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: size === 'mobile' ? '60px' : size === 'square' ? '48px' : '40px',
            boxSizing: 'border-box',
            position: 'relative',
            color: '#2c2c2c',
          }}
        >
          {/* Header: Institute Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: config.headerSize,
              fontWeight: '700',
              color: '#6b4423',
              marginBottom: size === 'mobile' ? '24px' : size === 'square' ? '16px' : '12px',
              textAlign: 'center',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            YOUDESERVENOW
          </div>

          {/* Main Title: User Achievement */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: config.titleSize,
              fontWeight: '700',
              color: '#2c2c2c',
              marginBottom: size === 'mobile' ? '32px' : size === 'square' ? '20px' : '16px',
              lineHeight: size === 'mobile' ? '1.2' : '1.3',
              textAlign: 'center',
              fontStyle: 'italic',
            }}
          >
            "{truncatedTitle}"
          </div>

          {/* Verdict: The Scientific Justification */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: config.verdictSize,
              color: '#4a4a4a',
              marginBottom: size === 'mobile' ? '40px' : size === 'square' ? '28px' : '20px',
              lineHeight: '1.5',
              textAlign: 'center',
              fontStyle: 'normal',
              fontWeight: '400',
            }}
          >
            {truncatedVerdict}
          </div>

          {/* Product Section */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: size === 'mobile' ? '24px' : '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              padding: size === 'mobile' ? '20px' : '16px',
              borderRadius: '12px',
              marginBottom: size === 'mobile' ? '32px' : size === 'square' ? '20px' : '16px',
              backdropFilter: 'blur(8px)',
            }}
          >
            {/* Product Image */}
            <img
              src={result.product.imageUrl}
              alt={result.product.name}
              style={{
                width: `${config.productImageSize}px`,
                height: `${config.productImageSize}px`,
                borderRadius: '8px',
                objectFit: 'cover',
                flexShrink: 0,
                backgroundColor: '#f0f0f0',
              }}
            />

            {/* Product Info */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {/* Product Name */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: config.productFontSize,
                  fontWeight: '700',
                  color: '#2c2c2c',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: '1.2',
                }}
              >
                {result.product.name}
              </div>

              {/* Product Price */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: config.priceFontSize,
                  color: '#6b4423',
                  fontWeight: '600',
                }}
              >
                {result.product.price}
              </div>
            </div>
          </div>

          {/* Footer: Site URL */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: size === 'mobile' ? '14px' : size === 'square' ? '12px' : '10px',
              color: '#999',
              textAlign: 'center',
              marginTop: 'auto',
              borderTop: '1px solid #d0c8c0',
              paddingTop: size === 'mobile' ? '20px' : '12px',
              fontWeight: '400',
            }}
          >
            youdeservenow.com
          </div>
        </div>
      ),
      {
        width: sizeConfig.width,
        height: sizeConfig.height,
        // Don't specify fonts here — use system fonts for faster rendering
        // Web fonts add 500ms+ latency; system fonts render instantly
      }
    );
  } catch (error) {
    console.error('❌ OG image generation failed:', error);
    throw error;
  }
}

/**
 * Generate multiple card sizes in parallel
 * Useful for pre-generating all sizes when a result is published
 */
export async function generateAllCardSizes(result: Result): Promise<Record<CardSize, ImageResponse>> {
  const [mobile, square, og] = await Promise.all([
    generatePrescriptionCard(result, 'mobile'),
    generatePrescriptionCard(result, 'square'),
    generatePrescriptionCard(result, 'og'),
  ]);

  return { mobile, square, og };
}
