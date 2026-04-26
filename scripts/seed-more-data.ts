/**
 * Seed More Data: Multilingual Diagnoses, Teams, and Likes
 * 
 * This script adds:
 * - 22 new curated diagnoses (2 per language × 11 languages) for global viral reach
 * - 5 new teams for the enterprise section
 * - 5 likes distributed across results
 * 
 * Languages: English, Español, Português, Français, Deutsch, हिन्दी, 日本語, العربية, 中文, 한국어, తెలుగు
 * 
 * Usage: npx tsx scripts/seed-more-data.ts
 */

import { saveResult, storeResultMetadata, createTeam } from '../lib/db';
import { getKV } from '../lib/kv';
import type { Result, Team } from '../lib/db';

// ===== MULTILINGUAL DIAGNOSES (2 per language × 11 languages = 22 total) =====
const MULTILINGUAL_DIAGNOSES: Array<{ lang: string; entries: Partial<Result>[] }> = [
  // ENGLISH
  {
    lang: 'en',
    entries: [
      {
        input: 'I actually finished reading an article instead of just the headline',
        justification:
          'The Institute of Digital Comprehension reports that headline-readers outnumber article-readers by 47:1. Your commitment to full context has reclassified you as "dangerously informed." Recommendation: A reading stand to elevate your new bibliophilia.',
        product: {
          id: 'reading-stand',
          asin: 'B08J7KQB2X',
          name: 'Bamboo Reading Rest Book Holder',
          category: 'productivity',
          price: '$24.99',
          affiliateUrl: 'https://www.amazon.com/s?k=book+reading+stand&tag=youdeserven07-20',
          imageUrl: 'https://m.media-amazon.com/images/I/71vFqVbqnEL._AC_SX679_.jpg',
          keywords: ['book holder', 'reading', 'desk', 'productivity', 'bamboo'],
        },
      },
      {
        input: 'I declined dessert because I was actually full',
        justification:
          'Listening to your body is a superpower that 94% of humans have surrendered. The Institute of Internal Signals certifies you as "surprisingly self-aware." Your stomach has filed a thank-you note. Recommendation: A beautiful plate set to make your next meal intentional.',
        product: {
          id: 'ceramic-plates',
          asin: 'B08KQPF4ZZ',
          name: 'AmazonBasics 12-Piece Ceramic Dinnerware Set',
          category: 'home',
          price: '$29.99',
          affiliateUrl: 'https://www.amazon.com/s?k=ceramic+dinnerware+set&tag=youdeserven07-20',
          imageUrl: 'https://m.media-amazon.com/images/I/71uI8VQQ8hL._AC_SX679_.jpg',
          keywords: ['plates', 'dinnerware', 'home', 'dining', 'ceramic'],
        },
      },
    ],
  },

  // SPANISH
  {
    lang: 'es',
    entries: [
      {
        input: 'Limpié mi escritorio sin que me obligara nadie',
        justification:
          'La limpieza voluntaria del escritorio es un signo de que tu vida está bajo control (ilusión óptica recomendada). El Instituto de Orden Reciente reporta que ahora puedes fingir ser productivo. Recomendación: Un organizador de escritorio para mantener la ilusión.',
        product: {
          id: 'desk-organizer',
          asin: 'B08KQPF5ZZ',
          name: 'Organizador de Escritorio Bambú (5 Compartimentos)',
          category: 'productivity',
          price: '$18.99',
          affiliateUrl: 'https://www.amazon.com/s?k=organizador+escritorio&tag=youdeserven07-20',
          imageUrl: 'https://m.media-amazon.com/images/I/71hI8VQQ8hL._AC_SX679_.jpg',
          keywords: ['organizador', 'escritorio', 'oficina', 'bambú', 'productividad'],
        },
      },
      {
        input: 'Resistí la tentación de revisar mis redes sociales en la cena',
        justification:
          'La abstinencia digital durante las comidas es el equivalente psicológico de ayunar en una montaña. El Instituto de Presencia Presente te certifica como "humanamente enfocado." Recomendación: Una caja para guardar tu teléfono lejos de tentaciones.',
        product: {
          id: 'phone-box',
          asin: 'B08KQPF6ZZ',
          name: 'Caja de Almacenamiento para Teléfono de Madera',
          category: 'home',
          price: '$22.99',
          affiliateUrl: 'https://www.amazon.com/s?k=caja+telefono+madera&tag=youdeserven07-20',
          imageUrl: 'https://m.media-amazon.com/images/I/71oI8VQQ8hL._AC_SX679_.jpg',
          keywords: ['caja', 'teléfono', 'almacenamiento', 'madera', 'minimalismo'],
        },
      },
    ],
  },

  // PORTUGUESE
  {
    lang: 'pt',
    entries: [
      {
        input: 'Bebi café sem culpa porque realmente o merecia',
        justification:
          'A indulgência consciente é um ato revolucionário. O Instituto de Auto-Compaixão declara que você agora tem permissão para existir sem justificativas. Seu café agora tem gosto melhor porque vem com absolvição. Recomendação: Uma caneca bonita para cimentar esse novo direito.',
        product: {
          id: 'premium-mug',
          asin: 'B08KQPF7ZZ',
          name: 'Caneca de Porcelana Premium com Alça',
          category: 'home',
          price: '$16.99',
          affiliateUrl: 'https://www.amazon.com/s?k=caneca+porcelana&tag=youdeserven07-20',
          imageUrl: 'https://m.media-amazon.com/images/I/71sI8VQQ8hL._AC_SX679_.jpg',
          keywords: ['caneca', 'café', 'porcelana', 'home', 'bebida'],
        },
      },
      {
        input: 'Dormi 8 horas inteiras sem despertar 47 vezes',
        justification:
          'Sono contínuo é um mito que você transformou em realidade. O Instituto de Repouso Profundo registra você como "suspeita de bruxaria." Seus olhos enviaram uma moção de gratidão. Recomendação: Um pijama de qualidade para honrar seu novo vício saudável.',
        product: {
          id: 'premium-pajamas',
          asin: 'B08KQPF8ZZ',
          name: 'Pijama de Algodão Orgânico Premium',
          category: 'wellness',
          price: '$59.99',
          affiliateUrl: 'https://www.amazon.com/s?k=pijama+algodao&tag=youdeserven07-20',
          imageUrl: 'https://m.media-amazon.com/images/I/71tI8VQQ8hL._AC_SX679_.jpg',
          keywords: ['pijama', 'sono', 'conforto', 'algodão', 'wellness'],
        },
      },
    ],
  },

  // FRENCH
  {
    lang: 'fr',
    entries: [
      {
        input: 'J\'ai rangé ma chambre et j\'y suis resté plus d\'une heure',
        justification:
          'La persistance dans une chambre rangée est un record olympique personnel. L\'Institut de Propreté Momentanée déclare que vous avez atteint l\'illumination temporaire. Recommandation: Un porte-serviettes élégant pour compléter votre nouvelle dignité.',
        product: {
          id: 'towel-rack',
          asin: 'B08KQPF9ZZ',
          name: 'Porte-Serviettes Mural Contemporain',
          category: 'home',
          price: '$32.99',
          affiliateUrl: 'https://www.amazon.com/s?k=porte+serviettes&tag=youdeserven07-20',
          imageUrl: 'https://m.media-amazon.com/images/I/71uI8VQQ8hL._AC_SX679_.jpg',
          keywords: ['porte-serviettes', 'salle de bain', 'rangement', 'décor', 'maison'],
        },
      },
      {
        input: 'J\'ai gardé une plante vivante pendant une semaine entière',
        justification:
          'La capacité de ne pas tuer une créature vivante est une compétence rarement documentée. L\'Institut de Responsabilité Botanique vous certifie comme "suffisamment responsable." Votre plante a noté votre absence complète de négligence homicide. Recommandation: Un système d\'arrosage automatique pour votre prochaine victime.',
        product: {
          id: 'plant-watering',
          asin: 'B08KQPFAZZ',
          name: 'Système d\'Arrosage Automatique Intelligent',
          category: 'home',
          price: '$28.99',
          affiliateUrl: 'https://www.amazon.com/s?k=arrosoir+automatique&tag=youdeserven07-20',
          imageUrl: 'https://m.media-amazon.com/images/I/71vI8VQQ8hL._AC_SX679_.jpg',
          keywords: ['arrosage', 'plante', 'automatique', 'jardin', 'maison'],
        },
      },
    ],
  },

  // GERMAN
  {
    lang: 'de',
    entries: [
      {
        input: 'Ich bin auf Zeit zu einem Termin gekommen',
        justification:
          'Pünktlichkeit ist eine deutsche Kunst, die Sie gerade gemeistert haben. Das Institut für Zeitmanagement bescheinigt Ihnen als "beängstigend zuverlässig." Empfehlung: Eine hochwertige Armbanduhr, um diese neue Eigenschaft zu bewahren.',
        product: {
          id: 'quality-watch',
          asin: 'B08KQPFBZZ',
          name: 'Armbanduhr aus Edelstahl mit Quarzwerk',
          category: 'lifestyle',
          price: '$79.99',
          affiliateUrl: 'https://www.amazon.com/s?k=armbanduhr&tag=youdeserven07-20',
          imageUrl: 'https://m.media-amazon.com/images/I/71wI8VQQ8hL._AC_SX679_.jpg',
          keywords: ['uhr', 'zeit', 'pünktlichkeit', 'edelstahl', 'lifestyle'],
        },
      },
      {
        input: 'Ich habe meine Wohnung gelüftet, obwohl es kalt war',
        justification:
          'Frische Luft trotz Unbehagen zeugt von deutscher Gründlichkeit. Das Institut für Wohlbefinden bescheinigt Ihnen als "ernsthaft gesundheitsbewusst." Ihre Lunge hat eine formelle Beschwerde eingereicht. Empfehlung: Ein hochwertiges Thermometer, um Ihre Opferbereitschaft zu dokumentieren.',
        product: {
          id: 'premium-thermometer',
          asin: 'B08KQPFCZZ',
          name: 'Digitales Raumthermometer mit Hygrometer',
          category: 'home',
          price: '$21.99',
          affiliateUrl: 'https://www.amazon.com/s?k=thermometer+hygrometer&tag=youdeserven07-20',
          imageUrl: 'https://m.media-amazon.com/images/I/71xI8VQQ8hL._AC_SX679_.jpg',
          keywords: ['thermometer', 'temperatur', 'luftfeuchtigkeit', 'haus', 'kontrolle'],
        },
      },
    ],
  },

  // HINDI
  {
    lang: 'hi',
    entries: [
      {
        input: 'मैंने अपनी माँ को बिना बुलाए फोन किया',
        justification:
          'असंकेतित पारिवारिक सेवा दुर्लभ है और आपने इसे प्राप्त किया है। कल्याण संस्थान आपको "आश्चर्यजनक रूप से विचारशील" के रूप में प्रमाणित करता है। आपकी माँ को गर्व महसूस हुआ। सिफारिश: एक सुंदर डायरी अपने नए परिवार-केंद्रित जीवन को रिकॉर्ड करने के लिए।',
        product: {
          id: 'family-diary',
          asin: 'B08KQPFDZZ',
          name: 'परिवार के लिए स्मृति डायरी',
          category: 'home',
          price: '$19.99',
          affiliateUrl: 'https://www.amazon.com/s?k=family+diary&tag=youdeserven07-20',
          imageUrl: 'https://m.media-amazon.com/images/I/71yI8VQQ8hL._AC_SX679_.jpg',
          keywords: ['डायरी', 'परिवार', 'स्मृति', 'लेखन', 'घर'],
        },
      },
      {
        input: 'मैंने नाश्ते में फल खाया और कोई डेसर्ट नहीं',
        justification:
          'स्वास्थ्य सचेतनता आपके जीवन में प्रवेश कर गई है। संस्थान आपको "वास्तव में जिम्मेदार" के रूप में पंजीकृत करता है। आपका पेट आपको बहुत आभारी है। सिफारिश: एक सुंदर फल के कटोरे से अपनी नई सुस्वास्थ्य को दिखाएं।',
        product: {
          id: 'fruit-bowl',
          asin: 'B08KQPFEZZ',
          name: 'सिरेमिक फल और सब्जी का कटोरा',
          category: 'home',
          price: '$24.99',
          affiliateUrl: 'https://www.amazon.com/s?k=fruit+bowl&tag=youdeserven07-20',
          imageUrl: 'https://m.media-amazon.com/images/I/71zI8VQQ8hL._AC_SX679_.jpg',
          keywords: ['कटोरा', 'फल', 'सिरेमिक', 'स्वास्थ्य', 'घर'],
        },
      },
    ],
  },

  // JAPANESE
  {
    lang: 'ja',
    entries: [
      {
        input: '瞑想を10分間続けることができた',
        justification:
          'マインドフルネスの維持は稀な才能です。瞑想研究所はあなたを「驚くほど落ち着いている」と認証します。あなたの心は感謝の念を送りました。推奨事項：瞑想クッションであなたの新しい習慣を強化してください。',
        product: {
          id: 'meditation-cushion',
          asin: 'B08KQPFFZZ',
          name: '瞑想用ザフー クッション',
          category: 'wellness',
          price: '$34.99',
          affiliateUrl: 'https://www.amazon.com/s?k=meditation+cushion&tag=youdeserven07-20',
          imageUrl: 'https://m.media-amazon.com/images/I/71AI8VQQ8hL._AC_SX679_.jpg',
          keywords: ['瞑想', 'クッション', 'ウェルネス', 'ヨガ', '健康'],
        },
      },
      {
        input: 'スマートフォンなしで2時間を過ごした',
        justification:
          'デジタル離脱は第二の覚醒です。テクノロジー断絶研究所は、あなたを「奇跡的に生存している」と記録します。あなたの心は解放感を感じています。推奨事項：デジタルデトックス中に読む本をお勧めします。',
        product: {
          id: 'japanese-novel',
          asin: 'B08KQPFGZZ',
          name: '日本文学の傑作集',
          category: 'books',
          price: '$18.99',
          affiliateUrl: 'https://www.amazon.com/s?k=japanese+literature&tag=youdeserven07-20',
          imageUrl: 'https://m.media-amazon.com/images/I/71BI8VQQ8hL._AC_SX679_.jpg',
          keywords: ['本', 'literature', '日本', '読書', '文化'],
        },
      },
    ],
  },

  // ARABIC
  {
    lang: 'ar',
    entries: [
      {
        input: 'أنهيت مشروعي قبل الموعد النهائي',
        justification:
          'الاجتهاد المبكر نادر جداً. معهد إدارة الوقت يعترف بك كـ "شخص منظم بشكل مخيف". توصية: منظم مكتب جميل يعكس طباعك الجديدة.',
        product: {
          id: 'office-organizer',
          asin: 'B08KQPFHZZ',
          name: 'منظم المكتب المعدني الحديث',
          category: 'productivity',
          price: '$27.99',
          affiliateUrl: 'https://www.amazon.com/s?k=office+organizer&tag=youdeserven07-20',
          imageUrl: 'https://m.media-amazon.com/images/I/71CI8VQQ8hL._AC_SX679_.jpg',
          keywords: ['منظم', 'مكتب', 'إنتاجية', 'تنظيم', 'عمل'],
        },
      },
      {
        input: 'قلت لا لطلب غير معقول دون الشعور بالذنب',
        justification:
          'وضع الحدود هو أكبر إنجاز. معهد احترام الذات يشهد بأنك "تحمي نفسك بشكل مناسب". توصية: دفتر يوميات لتوثيق حدودك الجديدة.',
        product: {
          id: 'leather-journal-arabic',
          asin: 'B08KQPFIZZ',
          name: 'دفتر يوميات من الجلد الفاخر',
          category: 'wellness',
          price: '$31.99',
          affiliateUrl: 'https://www.amazon.com/s?k=leather+journal&tag=youdeserven07-20',
          imageUrl: 'https://m.media-amazon.com/images/I/71DI8VQQ8hL._AC_SX679_.jpg',
          keywords: ['دفتر', 'يوميات', 'جلد', 'كتابة', 'تأمل'],
        },
      },
    ],
  },

  // CHINESE
  {
    lang: 'zh',
    entries: [
      {
        input: '我在工作中保持了专注的3个小时',
        justification:
          '连续专注是一项失传的技能。专注研究所将您认证为"令人惊讶的专心"。您的大脑发送了感谢函。建议：购买一个番茄计时器来维持您的新习惯。',
        product: {
          id: 'pomodoro-timer',
          asin: 'B08KQPFJZZ',
          name: '番茄计时器 - 专注工具',
          category: 'productivity',
          price: '$19.99',
          affiliateUrl: 'https://www.amazon.com/s?k=pomodoro+timer&tag=youdeserven07-20',
          imageUrl: 'https://m.media-amazon.com/images/I/71EI8VQQ8hL._AC_SX679_.jpg',
          keywords: ['计时器', '专注', '工作', '生产力', '番茄'],
        },
      },
      {
        input: '我做了我一直在推迟的事情',
        justification:
          '克服拖延是超级英雄的行为。拖延研究所声明您已获得"终于采取行动"的成就。建议：一本激励日记来纪念这次胜利。',
        product: {
          id: 'motivation-journal',
          asin: 'B08KQPFKZZ',
          name: '动力日记 - 目标跟踪本',
          category: 'books',
          price: '$22.99',
          affiliateUrl: 'https://www.amazon.com/s?k=motivation+journal&tag=youdeserven07-20',
          imageUrl: 'https://m.media-amazon.com/images/I/71FI8VQQ8hL._AC_SX679_.jpg',
          keywords: ['日记', '动力', '目标', '激励', '自我提升'],
        },
      },
    ],
  },

  // KOREAN
  {
    lang: 'ko',
    entries: [
      {
        input: '밤 11시 이전에 자리에 누웠다',
        justification:
          '조기 취침은 극도로 드문 업적입니다. 수면 연구소는 당신을 "기적적으로 책임감 있는" 것으로 등록합니다. 당신의 몸은 감사 편지를 보냈습니다. 추천: 쾌적한 수면을 위한 에센셜 오일 디퓨저.',
        product: {
          id: 'essential-oil-diffuser',
          asin: 'B08KQPFLZZ',
          name: '초음파 에센셜 오일 디퓨저',
          category: 'wellness',
          price: '$32.99',
          affiliateUrl: 'https://www.amazon.com/s?k=essential+oil+diffuser&tag=youdeserven07-20',
          imageUrl: 'https://m.media-amazon.com/images/I/71GI8VQQ8hL._AC_SX679_.jpg',
          keywords: ['디퓨저', '에센셜 오일', '수면', '웰니스', '향기'],
        },
      },
      {
        input: '직장 동료에게 실수를 인정했다',
        justification:
          '직업상 취약성은 리더십입니다. 성숙도 연구소는 당신을 "용감하게 솔직한" 것으로 인정합니다. 당신의 이미지는 실제로 개선되었습니다. 추천: 신뢰 구축을 상징하는 팬 편지세트.',
        product: {
          id: 'letterpress-set',
          asin: 'B08KQPFMZZ',
          name: '감사 편지 인쇄 세트',
          category: 'stationery',
          price: '$28.99',
          affiliateUrl: 'https://www.amazon.com/s?k=letterpress+set&tag=youdeserven07-20',
          imageUrl: 'https://m.media-amazon.com/images/I/71HI8VQQ8hL._AC_SX679_.jpg',
          keywords: ['편지', '감사', '문구', '통신', '우정'],
        },
      },
    ],
  },

  // TELUGU
  {
    lang: 'te',
    entries: [
      {
        input: 'నేను సరిగ్గా అర్థం చేసుకున్న సమస్య యొక్క పరిష్కారం కనుగొన్నాను',
        justification:
          'సమస్య-సమाధान ఎటువంటి ఫ్లోరిన్‌ కాదు, ఇది నిజమైన ఈ రకం. ఇన్‌స్టిట్యూట్ అర్థశక్తి నిశ్చితం చేస్తుంది మీరు ఆశ్చర్యకరంగా తెలివిగా ఉన్నారని. సిఫారిష్: ఆ విజయాన్ని నిలిపి ఉంచడానికి కామెమోరేటివ్ ట్రఫీ.',
        product: {
          id: 'success-trophy',
          asin: 'B08KQPFNZZ',
          name: 'నిజమైన కుండలీయ విజయ ట్రఫీ',
          category: 'home',
          price: '$29.99',
          affiliateUrl: 'https://www.amazon.com/s?k=success+trophy&tag=youdeserven07-20',
          imageUrl: 'https://m.media-amazon.com/images/I/71II8VQQ8hL._AC_SX679_.jpg',
          keywords: ['ట్రఫీ', 'విజయం', 'గృహ', 'గర్వం', 'పురస్కారం'],
        },
      },
      {
        input: 'నేను మరణం కోసం సిద్ధంగా ఉన్న ఎదుగుదల చర్చను నిర్వహించాను',
        justification:
          'కష్టమైన సంభాషణలను నిర్వహించడం అత్యంత ఘన ఘటన. ఇన్‌స్టిట్యూట్ పరిపక్వత విచారణ మీరు "తెలివితక్కువ-సంబంధిత" నిశ్చితం చేస్తుంది. సిఫారిష్: నీ వెన్నెముక గుర్తుచేసుకోవడానికి ప్రేరణ పుస్తకం.',
        product: {
          id: 'boundary-book',
          asin: 'B08KQPFOZZ',
          name: 'సరిహద్దులు: సంబంధం నిర్దేశం',
          category: 'books',
          price: '$18.99',
          affiliateUrl: 'https://www.amazon.com/s?k=boundaries+book&tag=youdeserven07-20',
          imageUrl: 'https://m.media-amazon.com/images/I/71JI8VQQ8hL._AC_SX679_.jpg',
          keywords: ['గ్రంథం', 'సరిహద్దులు', 'సంబంధం', 'వ్యక్తిగత', 'అభివృద్ధి'],
        },
      },
    ],
  },
];

const NEW_DIAGNOSES: Partial<Result>[] = MULTILINGUAL_DIAGNOSES.flatMap((lang) => lang.entries);

const NEW_TEAMS: Partial<Team>[] = [
  {
    name: 'Remote Work Survivors',
    industry: 'tech',
    description: 'A community for remote workers who have mastered the art of not wearing pants to Zoom calls',
    createdBy: 'seed_admin',
    tone: 'playful',
    memberCount: 0,
    isPublic: true,
  },
  {
    name: 'The Procrastination Alliance',
    industry: 'open-source',
    description: 'We accomplish nothing on schedule, but we accomplish it together',
    createdBy: 'seed_admin',
    tone: 'playful',
    memberCount: 0,
    isPublic: true,
  },
  {
    name: 'Sales Talk Recovery Network',
    industry: 'sales',
    description: 'We survived sales calls. We deserve medals.',
    createdBy: 'seed_admin',
    tone: 'warm',
    memberCount: 0,
    isPublic: true,
  },
  {
    name: 'The Midnight Coders',
    industry: 'tech',
    description: 'Shipping features at 3am because who needs sleep when you have caffeine and spite',
    createdBy: 'seed_admin',
    tone: 'playful',
    memberCount: 0,
    isPublic: true,
  },
  {
    name: 'Non-Profit Dream Weavers',
    industry: 'non-profit',
    description: 'Changing the world on a budget of $47 and overwhelming optimism',
    createdBy: 'seed_admin',
    tone: 'warm',
    memberCount: 0,
    isPublic: true,
  },
];

async function seedMoreData() {
  console.log(`\n� Seeding multilingual data for global viral reach...\n`);
  
  let successCount = 0;
  let failureCount = 0;
  const resultIds: string[] = [];

  // ===== Seed 22 multilingual diagnoses (2 per language × 11 languages) =====
  console.log('📋 Adding 22 multilingual diagnoses (2 per language)...');
  for (const langEntry of MULTILINGUAL_DIAGNOSES) {
    console.log(`\n  🌐 ${langEntry.lang.toUpperCase()}:`);
    
    for (const entry of langEntry.entries) {
      try {
        const resultId = `seed_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const result: Result = {
          id: resultId,
          input: entry.input!,
          justification: entry.justification!,
          product: entry.product!,
          shareUrl: `https://youdeservenow.com/result/${resultId}`,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 7 days
          isPublic: Math.random() > 0.3, // 70% public
          audience: ['self', 'loved_one', 'we'][Math.floor(Math.random() * 3)] as 'self' | 'loved_one' | 'we',
          voice: Math.random() > 0.5 ? 'classic' : 'warm',
        };

        await saveResult(result);
        
        // Store metadata for ranking
        await storeResultMetadata(resultId, {
          category: entry.product!.category,
          isGift: result.audience === 'loved_one',
          giftType: result.audience === 'loved_one' ? 'personal' : undefined,
          voice: result.voice,
          createdAt: result.createdAt,
        });

        resultIds.push(resultId);
        console.log(`    ✅ ${entry.input?.substring(0, 55)}...`);
        successCount++;
      } catch (error) {
        console.error(
          `    ❌ Failed: ${entry.input?.substring(0, 50)} — ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        failureCount++;
      }
    }
  }

  // ===== Seed 5 new teams =====
  console.log('\n👥 Adding 5 new teams...');
  for (const team of NEW_TEAMS) {
    try {
      const teamId = `team_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const newTeam: Team = {
        id: teamId,
        name: team.name!,
        industry: team.industry!,
        description: team.description!,
        createdBy: team.createdBy!,
        createdAt: new Date().toISOString(),
        memberCount: team.memberCount || 0,
        isPublic: team.isPublic !== undefined ? team.isPublic : true,
        tone: team.tone! as 'playful' | 'warm',
      };

      await createTeam(newTeam);
      console.log(`  ✅ ${team.name}`);
      successCount++;
    } catch (error) {
      console.error(
        `  ❌ Failed to create team: ${team.name} — ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      failureCount++;
    }
  }

  // ===== Seed 5 likes across random results =====
  console.log('\n❤️ Adding 5 likes across results...');
  const kv = await getKV();
  
  if (kv && resultIds.length > 0) {
    for (let i = 0; i < 5; i++) {
      try {
        const randomResultId = resultIds[Math.floor(Math.random() * resultIds.length)];
        
        // Increment likes using both keys for compatibility
        await kv.incr(`result:${randomResultId}:likes`);
        await kv.incr(`likes:${randomResultId}`);
        
        console.log(`  ✅ Added like to result ${randomResultId}`);
        successCount++;
      } catch (error) {
        console.error(`  ❌ Failed to add like — ${error instanceof Error ? error.message : 'Unknown error'}`);
        failureCount++;
      }
    }
  } else {
    console.log('  ⚠️  KV not available, skipping likes seeding');
  }

  console.log(`\n📊 Seeding complete:`);
  console.log(`  ✅ Successful: ${successCount}`);
  console.log(`  ❌ Failed: ${failureCount}`);
  console.log(`\n🚀 VIRAL DATA ACTIVATED! ${successCount} multilingual diagnoses + ${NEW_TEAMS.length} teams + 5 likes deployed!\n`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedMoreData().catch(console.error);
}

export { seedMoreData };
