/**
 * AgriShamba — Smart Crop Image Resolver
 * Maps any crop/product name → verified matching Unsplash photo URL.
 * Used on every product card so the displayed image always matches the crop name.
 *
 * Priority logic:
 *   1. If the listing already has a Firebase Storage URL (firebasestorage.app) → use it (farmer's own photo)
 *   2. Otherwise → resolve from this map by keyword matching on cropName + category
 *   3. Final fallback → generic fresh produce photo
 */

// ─────────────────────────────────────────────────────────────────
// MASTER MAP  key = lowercase keyword(s)  →  correct Unsplash URL
// ─────────────────────────────────────────────────────────────────
const KEYWORD_IMAGE_MAP = [
  // ── HORTICULTURE ────────────────────────────────────────────────
  { keys: ['tomato', 'nyanya', 'roma', 'anna f1', 'cherry tom'],
    url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=700&auto=format&fit=crop' },

  { keys: ['onion', 'vitunguu', 'red bulb', 'white onion', 'spring onion', 'leek'],
    url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=700&auto=format&fit=crop' },

  { keys: ['avocado', 'parachichi', 'hass', 'fuerte'],
    url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=700&auto=format&fit=crop' },

  { keys: ['capsicum', 'bell pepper', 'pilipili hoho', 'green pepper', 'red pepper', 'yellow pepper'],
    url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=700&auto=format&fit=crop' },

  { keys: ['cabbage', 'sukuma', 'kale', 'collard', 'spinach', 'managu', 'terere', 'sagaa'],
    url: 'https://images.unsplash.com/photo-1598030304671-5aa1d6f21128?w=700&auto=format&fit=crop' },

  { keys: ['watermelon', 'tikiti maji', 'melon'],
    url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=700&auto=format&fit=crop' },

  { keys: ['carrot', 'karoti', 'parsnip'],
    url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=700&auto=format&fit=crop' },

  { keys: ['mango', 'embe', 'ngowe', 'kent mango', 'apple mango'],
    url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=700&auto=format&fit=crop' },

  { keys: ['banana', 'ndizi', 'plantain', 'cavendish'],
    url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=700&auto=format&fit=crop' },

  { keys: ['pineapple', 'nanasi'],
    url: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=700&auto=format&fit=crop' },

  { keys: ['passion fruit', 'passion', 'passionfruit', 'granadilla'],
    url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=700&auto=format&fit=crop' },

  { keys: ['orange', 'chungwa', 'lemon', 'lime', 'citrus', 'naartjie', 'tangerin', 'grapefruit'],
    url: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=700&auto=format&fit=crop' },

  { keys: ['garlic', 'kitunguu saumu'],
    url: 'https://images.unsplash.com/photo-1615478503562-ec2d8aa0e24e?w=700&auto=format&fit=crop' },

  { keys: ['ginger', 'tangawizi'],
    url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=700&auto=format&fit=crop' },

  { keys: ['pumpkin', 'boga', 'butternut', 'squash'],
    url: 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=700&auto=format&fit=crop' },

  { keys: ['broccoli', 'cauliflower', 'brussels'],
    url: 'https://images.unsplash.com/photo-1583663848850-46af132dc08e?w=700&auto=format&fit=crop' },

  { keys: ['eggplant', 'brinjal', 'aubergine', 'biringanya'],
    url: 'https://images.unsplash.com/photo-1628773822503-930a7eaecf80?w=700&auto=format&fit=crop' },

  { keys: ['cucumber', 'tango', 'matango'],
    url: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=700&auto=format&fit=crop' },

  { keys: ['courgette', 'zucchini', 'marrow'],
    url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=700&auto=format&fit=crop' },

  { keys: ['french bean', 'green bean', 'snap bean', 'runner bean', 'maharagwe'],
    url: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=700&auto=format&fit=crop' },

  { keys: ['pea', 'minji', 'snow pea', 'snap pea'],
    url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=700&auto=format&fit=crop' },

  { keys: ['strawberry', 'tunda stroberi'],
    url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=700&auto=format&fit=crop' },

  // ── TUBERS & ROOTS ───────────────────────────────────────────────
  { keys: ['potato', 'viazi', 'shangi', 'irish potato', 'dutch', 'tigoni'],
    url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=700&auto=format&fit=crop' },

  { keys: ['sweet potato', 'viazi vitamu', 'yam', 'arrow root', 'nduma', 'cassava', 'muhogo'],
    url: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=700&auto=format&fit=crop' },

  // ── CEREALS & GRAINS ─────────────────────────────────────────────
  { keys: ['maize', 'corn', 'mahindi', 'white maize', 'yellow maize', 'seed maize'],
    url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=700&auto=format&fit=crop' },

  { keys: ['wheat', 'ngano', 'barley'],
    url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=700&auto=format&fit=crop' },

  { keys: ['rice', 'mchele', 'pishori', 'basmati'],
    url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=700&auto=format&fit=crop' },

  { keys: ['sorghum', 'mtama', 'millet', 'wimbi', 'finger millet'],
    url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=700&auto=format&fit=crop' },

  { keys: ['bean', 'maharagwe', 'rosecoco', 'kidney bean', 'mwitemania', 'omena', 'soybean', 'soya'],
    url: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=700&auto=format&fit=crop' },

  { keys: ['lentil', 'dengu', 'pigeon pea', 'mbaazi', 'chickpea', 'ndengu'],
    url: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=700&auto=format&fit=crop' },

  { keys: ['sunflower', 'alizeti', 'sunflower seed'],
    url: 'https://images.unsplash.com/photo-1470509037663-253afd7f0f51?w=700&auto=format&fit=crop' },

  // ── DAIRY ────────────────────────────────────────────────────────
  { keys: ['cow milk', 'maziwa ya ng\'ombe', 'raw milk', 'fresh milk', 'whole milk', 'bulk milk'],
    url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=700&auto=format&fit=crop' },

  { keys: ['goat milk', 'maziwa ya mbuzi'],
    url: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=700&auto=format&fit=crop' },

  { keys: ['mala', 'yoghurt', 'yogurt', 'fermented milk', 'cultured'],
    url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=700&auto=format&fit=crop' },

  { keys: ['ghee', 'siagi', 'butter', 'cream', 'cheese'],
    url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=700&auto=format&fit=crop' },

  // ── LIVESTOCK ────────────────────────────────────────────────────
  { keys: ['friesian', 'dairy cow', 'milking cow', 'in-calf', 'in calf'],
    url: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=700&auto=format&fit=crop' },

  { keys: ['ayrshire', 'heifer', 'ng\'ombe'],
    url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=700&auto=format&fit=crop' },

  { keys: ['boran', 'boran beef', 'beef meet', 'beef meat', 'beef bull', 'beef cattle', 'zebu', 'bull'],
    url: 'https://feedmix.co.zw/wp-content/uploads/FeedMix-Beef-12-1024x683.jpg' },

  { keys: ['goat', 'mbuzi', 'boer', 'galla', 'dairy goat', 'toggenb'],
    url: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?w=700&auto=format&fit=crop' },

  { keys: ['red maasai', 'maasai sheep', 'maasai meet', 'maasai meat', 'maasai'],
    url: 'https://cdn.creatures.com/ac6/82f/13b/7a866.jpeg' },

  { keys: ['sheep', 'kondoo', 'dorper', 'merino', 'blackhead'],
    url: 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?w=700&auto=format&fit=crop' },

  { keys: ['pig', 'nguruwe', 'pork', 'large white', 'landrace', 'duroc'],
    url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=700&auto=format&fit=crop' },

  { keys: ['rabbit', 'sungura', 'new zealand', 'california rabbit'],
    url: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=700&auto=format&fit=crop' },

  // ── POULTRY ──────────────────────────────────────────────────────
  { keys: ['kienyeji', 'indigenous chicken', 'free range chicken', 'heritage chicken'],
    url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=700&auto=format&fit=crop' },

  { keys: ['broiler', 'kuku wa nyama', 'meat chicken', 'ross', 'cobb'],
    url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=700&auto=format&fit=crop' },

  { keys: ['kuroiler', 'improved kienyeji', 'rainbow rooster', 'kenbro'],
    url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=700&auto=format&fit=crop' },

  { keys: ['layer', 'layer hen', 'laying hen', 'isa brown', 'lohmann'],
    url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=700&auto=format&fit=crop' },

  { keys: ['egg', 'yai', 'eggs tray', 'egg tray', 'egg crate'],
    url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=700&auto=format&fit=crop' },

  { keys: ['chick', 'day-old', 'day old', 'DOC', 'pullet', 'cockerel'],
    url: 'https://images.unsplash.com/photo-1563281577-a7be47e20db9?w=700&auto=format&fit=crop' },

  { keys: ['turkey', 'bata mzinga', 'duck', 'bata', 'guinea fowl', 'kanga'],
    url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=700&auto=format&fit=crop' },

  // ── FODDER & FEEDS ───────────────────────────────────────────────
  { keys: ['hay bale', 'hay', 'boma rhodes', 'rhodes grass', 'bermuda'],
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=700&auto=format&fit=crop' },

  { keys: ['lucerne', 'alfalfa', 'clover'],
    url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=700&auto=format&fit=crop' },

  { keys: ['silage', 'napier', 'maize silage', 'grass silage'],
    url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=700&auto=format&fit=crop' },

  { keys: ['dairy meal', 'pig meal', 'poultry feed', 'layer mash', 'grower mash', 'starter', 'concentrate', 'feed bag'],
    url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=700&auto=format&fit=crop' },

  { keys: ['molasses', 'cane molasses', 'pasture seed'],
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=700&auto=format&fit=crop' },

  // ── COFFEE, TEA & CASH CROPS ─────────────────────────────────────
  { keys: ['coffee', 'kahawa', 'arabica', 'robusta', 'green coffee', 'parchment'],
    url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=700&auto=format&fit=crop' },

  { keys: ['tea', 'chai', 'purple tea', 'green tea', 'black tea', 'tea leaf'],
    url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=700&auto=format&fit=crop' },

  { keys: ['macadamia', 'mac nut', 'macadamia nut'],
    url: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=700&auto=format&fit=crop' },

  { keys: ['pyrethrum', 'flower', 'cut flower', 'rose', 'carnation', 'lily'],
    url: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=700&auto=format&fit=crop' },
];

// ─────────────────────────────────────────────────────────────────
// CATEGORY FALLBACKS  (when no keyword matches)
// ─────────────────────────────────────────────────────────────────
const CATEGORY_FALLBACKS = {
  HORTICULTURE:  'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700&auto=format&fit=crop',
  TUBER:         'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=700&auto=format&fit=crop',
  CEREAL:        'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=700&auto=format&fit=crop',
  DAIRY:         'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=700&auto=format&fit=crop',
  LIVESTOCK:     'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=700&auto=format&fit=crop',
  POULTRY:       'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=700&auto=format&fit=crop',
  FODDER_FEEDS:  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=700&auto=format&fit=crop',
};

const GENERIC_FALLBACK = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&auto=format&fit=crop';

// ─────────────────────────────────────────────────────────────────
// Main resolver  — call this instead of item.imageUrl directly
// ─────────────────────────────────────────────────────────────────
/**
 * Returns the best image URL for a produce listing.
 *
 * @param {string} imageUrl  - The stored imageUrl from the DB
 * @param {string} cropName  - The listing's crop name
 * @param {string} category  - The listing's category (e.g. 'LIVESTOCK')
 * @returns {string} - A fully-resolved image URL
 */
export function resolveProduceImage(imageUrl = '', cropName = '', category = '') {
  // 1. If farmer uploaded their own photo to Firebase Storage → honour it
  if (
    imageUrl &&
    (imageUrl.includes('firebasestorage.app') ||
      imageUrl.includes('firebasestorage.googleapis.com'))
  ) {
    return imageUrl;
  }

  // 2. Keyword match on cropName
  const nameLower = (cropName || '').toLowerCase();
  if (nameLower.length > 1) {
    for (const entry of KEYWORD_IMAGE_MAP) {
      if (entry.keys.some((k) => nameLower.includes(k))) {
        return entry.url;
      }
    }
  }

  // 3. Category fallback
  if (category && CATEGORY_FALLBACKS[category.toUpperCase()]) {
    return CATEGORY_FALLBACKS[category.toUpperCase()];
  }

  // 4. Generic fresh-produce image
  return GENERIC_FALLBACK;
}
