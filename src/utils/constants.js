/** Pune, Maharashtra — demo coordinates for weather APIs */
export const DEMO_COORDS = { lat: 18.52, lon: 73.85 }

export const DEMO_PROFILE = {
  name: 'Ramesh Patil',
  village: 'Baramati',
  district: 'Pune',
  state: 'Maharashtra',
  phone: '+91 98765 43210',
  crop: 'Tomato',
  landAcres: 3,
  soilType: 'Black',
  irrigation: 'Drip',
  stage: 'Vegetative',
  sowDate: '2026-01-12',
  expectedHarvest: '2026-05-20',
  lat: DEMO_COORDS.lat,
  lon: DEMO_COORDS.lon,
}

export const CROPS = [
  {
    id: 'Wheat',
    emoji: '🌾',
    season: 'Rabi (Nov–Apr)',
    water: 'Medium',
  },
  {
    id: 'Rice',
    emoji: '🌾',
    season: 'Kharif (Jun–Nov)',
    water: 'High',
  },
  {
    id: 'Sugarcane',
    emoji: '🎋',
    season: '12–18 month cycle',
    water: 'Very high',
  },
  {
    id: 'Cotton',
    emoji: '🧵',
    season: 'Kharif (Apr–Oct)',
    water: 'Medium–high',
  },
  {
    id: 'Tomato',
    emoji: '🍅',
    season: 'Year-round (region dependent)',
    water: 'Medium',
  },
  {
    id: 'Onion',
    emoji: '🧅',
    season: 'Rabi / Kharif',
    water: 'Medium',
  },
  {
    id: 'Soybean',
    emoji: '🫘',
    season: 'Kharif (Jun–Oct)',
    water: 'Medium',
  },
  {
    id: 'Maize',
    emoji: '🌽',
    season: 'Kharif / Rabi',
    water: 'Medium',
  },
]

export const SOIL_TYPES = ['Black', 'Red', 'Alluvial', 'Sandy']
export const IRRIGATION_TYPES = ['Drip', 'Flood', 'Rainfed']
export const GROWTH_STAGES = ['Sowing', 'Vegetative', 'Flowering', 'Harvest']

export const MAHARASHTRA_DISTRICTS = [
  'Pune',
  'Mumbai',
  'Nagpur',
  'Nashik',
  'Kolhapur',
  'Sangli',
  'Satara',
  'Ahmednagar',
  'Jalgaon',
  'Aurangabad',
  'Latur',
  'Solapur',
  'Thane',
  'Raigad',
]

export const STATES = ['Maharashtra', 'Karnataka', 'Gujarat', 'Madhya Pradesh', 'Telangana']

export const STORAGE_KEYS = {
  consent: 'agrisense_consent_v1',
  profile: 'agrisense_farmer_profile',
  lang: 'agrisense_lang',
  theme: 'agrisense_theme',
  fontSize: 'agrisense_font_size',
  advisories: 'agrisense_advisories',
  pestHistory: 'agrisense_pest_history',
  irrigationLog: 'agrisense_irrigation_log',
  healthScores: 'agrisense_health_scores',
}
