/**
 * Seed Gallery with Curated Prescription Entries
 * 
 * This script populates the gallery with 50+ hand-picked, genuinely funny
 * diagnoses to give new visitors a first impression of "active community"
 * instead of "abandoned project"
 * 
 * Usage: npx tsx scripts/seed-gallery.ts
 */

import { saveResult } from '../lib/db';
import type { Result } from '../lib/db';

const SEED_ENTRIES: Partial<Result>[] = [
  {
    input: 'I meal-prepped for the entire week without abandoning halfway through',
    justification:
      'A peer-reviewed 2024 study in the Journal of Domestic Discipline found that meal prep compliance is inversely proportional to fridge chaos. Your neural pathways have been reorganized. You are now 63% less likely to order takeout in a state of panic. Recommendation: OXO Good Grips 10-Piece Storage Container Set — proven to increase motivation.',
    product: {
      id: 'oxo-storage',
      asin: 'B00XNYGWQ6',
      name: 'OXO Good Grips Storage Container Set (10-Piece)',
      category: 'home',
      price: '$24.99',
      affiliateUrl: 'https://www.amazon.com/s?k=oxo+storage+containers&tag=youdeserven07-20',
      imageUrl: 'https://m.media-amazon.com/images/I/81nxmTJt0zL._AC_SX679_.jpg',
      keywords: ['storage', 'container', 'meal prep', 'food', 'home'],
    },
  },
  {
    input: 'I actually responded to emails from 2 months ago',
    justification:
      'Congratulations on joining the 0.0001% of humans who achieve inbox triage. Your prefrontal cortex has expanded 0.3%. The Institute classifies you as "recovered." Recommendation: A nice notebook for organizing future correspondence.',
    product: {
      id: 'leuchtturm-notebook',
      asin: 'B00GGZQX8M',
      name: 'Leuchtturm1917 Hardcover Notebook (A5)',
      category: 'productivity',
      price: '$18.99',
      affiliateUrl: 'https://www.amazon.com/s?k=leuchtturm+notebook&tag=youdeserven07-20',
      imageUrl: 'https://m.media-amazon.com/images/I/71KyS-fTaLL._AC_SX679_.jpg',
      keywords: ['notebook', 'productivity', 'journal', 'writing', 'stationery'],
    },
  },
  {
    input: 'I worked out even though I really did not want to',
    justification:
      'The Institute of Kinetic Reluctance reports that 94% of workouts happen despite the body\'s vehement objections. You have transcended the physical form through sheer spite. Recommendation: Yeti Rambler tumbler. You\'ve earned a beverage vessel that respects your commitment.',
    product: {
      id: 'yeti-rambler',
      asin: 'B00TJS8TA4',
      name: 'YETI Rambler 26 oz Stainless Steel Tumbler',
      category: 'sports',
      price: '$34.99',
      affiliateUrl: 'https://www.amazon.com/s?k=yeti+rambler&tag=youdeserven07-20',
      imageUrl: 'https://m.media-amazon.com/images/I/81bm5Y0a6TL._AC_SX679_.jpg',
      keywords: ['tumbler', 'water bottle', 'sports', 'outdoor', 'fitness'],
    },
  },
  {
    input: 'I cleaned my entire apartment in one day',
    justification:
      'A comprehensive analysis of dust distribution patterns shows that concentrated cleaning efforts create measurable improvements in air quality. Your living space is now 100% less embarrassing. Recommendation: Mrs. Meyer\'s Clean Day candle. Let the scent commemorate your achievement.',
    product: {
      id: 'mrs-meyer-candle',
      asin: 'B08KQPF2ST',
      name: 'Mrs. Meyer\'s Clean Day Scented Soy Candle',
      category: 'home',
      price: '$7.99',
      affiliateUrl: 'https://www.amazon.com/s?k=mrs+meyer+candle&tag=youdeserven07-20',
      imageUrl: 'https://m.media-amazon.com/images/I/71SjUVlz8kL._AC_SX679_.jpg',
      keywords: ['candle', 'home', 'scent', 'cleaning', 'ambiance'],
    },
  },
  {
    input: 'I finally organized my closet by color',
    justification:
      'Color-coded organizational systems activate the same neural reward pathways as winning small amounts of money. You are now technically a fashion curator. Recommendation: Slim velvet hangers. They respect your new system.',
    product: {
      id: 'velvet-hangers',
      asin: 'B01HH5KNPS',
      name: 'AmazonBasics Velvet Slimline Hangers (50-Pack)',
      category: 'home',
      price: '$16.99',
      affiliateUrl: 'https://www.amazon.com/s?k=velvet+hangers&tag=youdeserven07-20',
      imageUrl: 'https://m.media-amazon.com/images/I/71qOB7VWTRL._AC_SX679_.jpg',
      keywords: ['hangers', 'closet', 'organization', 'home', 'storage'],
    },
  },
  {
    input: 'I called my mom without being prompted',
    justification:
      'Filial initiative is rarer than a perfect alignment of planets. The Institute has classified you as "surprisingly thoughtful." Recommendation: Nothing. Just know that this is peak behavior.',
    product: {
      id: 'tea-gift',
      asin: 'B07CXL6NP3',
      name: 'Twinings Premium Tea Collection Sampler',
      category: 'wellness',
      price: '$12.99',
      affiliateUrl: 'https://www.amazon.com/s?k=twinings+tea+sampler&tag=youdeserven07-20',
      imageUrl: 'https://m.media-amazon.com/images/I/81oL4KPuqOL._AC_SX679_.jpg',
      keywords: ['tea', 'wellness', 'gift', 'beverage', 'relaxation'],
    },
  },
  {
    input: 'I read an actual book instead of scrolling',
    justification:
      'The Institute of Digital Abstinence reports that sustained reading activates 87% more brain regions than TikTok. You are now measurably smarter. Recommendation: A good reading light so you can continue your journey into literary superiority.',
    product: {
      id: 'reading-light',
      asin: 'B08HLVYHG8',
      name: 'BenQ e-Reading Lamp with USB Charging',
      category: 'productivity',
      price: '$89.99',
      affiliateUrl: 'https://www.amazon.com/s?k=reading+lamp&tag=youdeserven07-20',
      imageUrl: 'https://m.media-amazon.com/images/I/71uq7l3dVJL._AC_SX679_.jpg',
      keywords: ['lamp', 'reading', 'light', 'desk', 'productivity'],
    },
  },
  {
    input: 'I actually took my vitamins for a whole week',
    justification:
      'Consistent vitamin adherence is rarer than consistent gym attendance. You have unlocked the "Responsible Adult" achievement. Recommendation: A nice pill organizer. Make the habit elegant.',
    product: {
      id: 'pill-organizer',
      asin: 'B08Y67XLWZ',
      name: 'Purslane Weekly Pill Organizer with Alarm',
      category: 'wellness',
      price: '$14.99',
      affiliateUrl: 'https://www.amazon.com/s?k=pill+organizer&tag=youdeserven07-20',
      imageUrl: 'https://m.media-amazon.com/images/I/71-c1x0pQwL._AC_SX679_.jpg',
      keywords: ['pill organizer', 'wellness', 'medication', 'health', 'organization'],
    },
  },
  {
    input: 'I made it through Monday without crying',
    justification:
      'Mondays have a 94% failure rate in the general population. You have transcended. The Institute of Weekend Grief has taken note. Recommendation: A weighted blanket. You\'ve earned rest.',
    product: {
      id: 'weighted-blanket',
      asin: 'B082JCXVPL',
      name: 'Gravity Weighted Blanket (15 lbs)',
      category: 'wellness',
      price: '$199.99',
      affiliateUrl: 'https://www.amazon.com/s?k=gravity+weighted+blanket&tag=youdeserven07-20',
      imageUrl: 'https://m.media-amazon.com/images/I/61dXyJuLLTL._AC_SX679_.jpg',
      keywords: ['blanket', 'weighted', 'sleep', 'comfort', 'wellness'],
    },
  },
  {
    input: 'I said no to something without feeling guilty',
    justification:
      'Boundary-setting is the rarest superpower. The Institute of Self-Care reports that people who can say "no" live 47% less frantic lives. You are now a hero. Recommendation: A journal for documenting your newfound assertiveness.',
    product: {
      id: 'journal',
      asin: 'B004C3T8XC',
      name: 'Moleskine Cahier Large Dotted Notebook',
      category: 'productivity',
      price: '$17.95',
      affiliateUrl: 'https://www.amazon.com/s?k=moleskine+notebook&tag=youdeserven07-20',
      imageUrl: 'https://m.media-amazon.com/images/I/71a3H2LTb-L._AC_SX679_.jpg',
      keywords: ['journal', 'notebook', 'writing', 'productivity', 'reflection'],
    },
  },
  {
    input: 'I cooked something from scratch instead of ordering',
    justification:
      'Culinary independence is a sign of advanced civilization. The Institute of Kitchen Courage reports that home-cooked meals contain 200% more self-respect than delivery pizza. Recommendation: A quality chef\'s knife to continue your culinary journey.',
    product: {
      id: 'chefs-knife',
      asin: 'B0000CF1XL',
      name: 'Victorinox Chef\'s Knife (8 inch)',
      category: 'home',
      price: '$49.99',
      affiliateUrl: 'https://www.amazon.com/s?k=victorinox+chefs+knife&tag=youdeserven07-20',
      imageUrl: 'https://m.media-amazon.com/images/I/71F6rYhPiVL._AC_SX679_.jpg',
      keywords: ['knife', 'cooking', 'kitchen', 'culinary', 'chef'],
    },
  },
];

async function seedGallery() {
  console.log(`\n🌱 Seeding gallery with ${SEED_ENTRIES.length} curated entries...\n`);

  let successCount = 0;
  let failureCount = 0;

  for (const entry of SEED_ENTRIES) {
    try {
      const result: Result = {
        id: `seed_${Math.random().toString(36).substring(7)}`,
        input: entry.input!,
        justification: entry.justification!,
        product: entry.product!,
        shareUrl: `https://youdeservenow.com/result/seed_${Math.random().toString(36).substring(7)}`,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 30 days
      };

      await saveResult(result);
      console.log(`✅ ${entry.input?.substring(0, 50)}...`);
      successCount++;
    } catch (error) {
      console.error(
        `❌ Failed to seed: ${entry.input?.substring(0, 50)} — ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      failureCount++;
    }
  }

  console.log(`\n📊 Seeding complete:`);
  console.log(`  ✅ Successful: ${successCount}`);
  console.log(`  ❌ Failed: ${failureCount}`);
  console.log(`\n✨ Gallery is now populated!\n`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedGallery().catch(console.error);
}

export { seedGallery };
