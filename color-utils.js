// color-utils.js — Color analysis utilities for the Lambda function

// Extended color expectations for better matching
export const EXTENDED_COLOR_EXPECTATIONS = {
  // Yellows
  'yellow': { hue: [45, 75], saturation: [0.6, 1.0], lightness: [0.4, 0.8] },
  'sunny yellow': { hue: [45, 75], saturation: [0.7, 1.0], lightness: [0.5, 0.8] },
  'golden yellow': { hue: [45, 65], saturation: [0.6, 0.9], lightness: [0.4, 0.7] },
  'cream': { hue: [45, 75], saturation: [0.1, 0.4], lightness: [0.7, 0.9] },
  'ivory': { hue: [45, 75], saturation: [0.05, 0.3], lightness: [0.8, 0.95] },
  'mustard': { hue: [45, 65], saturation: [0.5, 0.8], lightness: [0.3, 0.6] },
  'ochre': { hue: [35, 55], saturation: [0.4, 0.7], lightness: [0.3, 0.6] },
  
  // Reds
  'red': { hue: [0, 20], saturation: [0.7, 1.0], lightness: [0.3, 0.6] },
  'brick red': { hue: [0, 20], saturation: [0.6, 0.9], lightness: [0.3, 0.5] },
  'coral': { hue: [10, 25], saturation: [0.6, 0.9], lightness: [0.5, 0.7] },
  'pink': { hue: [330, 360], saturation: [0.4, 0.8], lightness: [0.6, 0.8] },
  'rose': { hue: [330, 360], saturation: [0.5, 0.8], lightness: [0.5, 0.7] },
  'salmon': { hue: [15, 25], saturation: [0.4, 0.7], lightness: [0.6, 0.8] },
  'burgundy': { hue: [0, 15], saturation: [0.6, 0.9], lightness: [0.2, 0.4] },
  'maroon': { hue: [0, 15], saturation: [0.5, 0.8], lightness: [0.2, 0.4] },
  
  // Blues
  'blue': { hue: [200, 240], saturation: [0.6, 1.0], lightness: [0.3, 0.6] },
  'navy': { hue: [200, 240], saturation: [0.7, 1.0], lightness: [0.2, 0.4] },
  'royal blue': { hue: [210, 230], saturation: [0.8, 1.0], lightness: [0.4, 0.6] },
  'sky blue': { hue: [200, 220], saturation: [0.4, 0.7], lightness: [0.6, 0.8] },
  'teal': { hue: [170, 190], saturation: [0.5, 0.8], lightness: [0.3, 0.6] },
  'turquoise': { hue: [170, 190], saturation: [0.6, 0.9], lightness: [0.5, 0.7] },
  'periwinkle': { hue: [220, 240], saturation: [0.3, 0.6], lightness: [0.6, 0.8] },
  
  // Greens
  'green': { hue: [100, 140], saturation: [0.6, 1.0], lightness: [0.3, 0.6] },
  'emerald': { hue: [120, 140], saturation: [0.7, 1.0], lightness: [0.3, 0.5] },
  'olive': { hue: [60, 80], saturation: [0.4, 0.7], lightness: [0.4, 0.6] },
  'sage': { hue: [80, 100], saturation: [0.2, 0.5], lightness: [0.5, 0.7] },
  'forest green': { hue: [100, 120], saturation: [0.6, 0.9], lightness: [0.2, 0.4] },
  'mint': { hue: [140, 160], saturation: [0.3, 0.6], lightness: [0.6, 0.8] },
  'lime': { hue: [80, 100], saturation: [0.6, 0.9], lightness: [0.5, 0.7] },
  
  // Purples
  'purple': { hue: [260, 300], saturation: [0.6, 1.0], lightness: [0.3, 0.6] },
  'lavender': { hue: [260, 300], saturation: [0.3, 0.6], lightness: [0.6, 0.8] },
  'plum': { hue: [280, 320], saturation: [0.4, 0.7], lightness: [0.3, 0.5] },
  'violet': { hue: [270, 290], saturation: [0.5, 0.8], lightness: [0.4, 0.6] },
  'amethyst': { hue: [270, 290], saturation: [0.4, 0.7], lightness: [0.5, 0.7] },
  
  // Oranges
  'orange': { hue: [20, 40], saturation: [0.7, 1.0], lightness: [0.4, 0.7] },
  'peach': { hue: [20, 35], saturation: [0.4, 0.7], lightness: [0.6, 0.8] },
  'apricot': { hue: [25, 40], saturation: [0.5, 0.8], lightness: [0.5, 0.7] },
  'terracotta': { hue: [15, 30], saturation: [0.5, 0.8], lightness: [0.3, 0.5] },
  
  // Neutrals
  'black': { hue: [0, 360], saturation: [0, 0.1], lightness: [0, 0.2] },
  'white': { hue: [0, 360], saturation: [0, 0.1], lightness: [0.8, 1.0] },
  'gray': { hue: [0, 360], saturation: [0, 0.2], lightness: [0.4, 0.6] },
  'charcoal': { hue: [0, 360], saturation: [0, 0.2], lightness: [0.2, 0.4] },
  'brown': { hue: [20, 40], saturation: [0.3, 0.7], lightness: [0.2, 0.5] },
  'beige': { hue: [45, 65], saturation: [0.1, 0.3], lightness: [0.7, 0.9] },
  'tan': { hue: [30, 50], saturation: [0.2, 0.5], lightness: [0.6, 0.8] },
  'taupe': { hue: [30, 50], saturation: [0.1, 0.4], lightness: [0.4, 0.6] },
  'khaki': { hue: [60, 80], saturation: [0.1, 0.4], lightness: [0.5, 0.7] },
  
  // Metallics
  'gold': { hue: [45, 65], saturation: [0.4, 0.8], lightness: [0.5, 0.7] },
  'silver': { hue: [0, 360], saturation: [0, 0.2], lightness: [0.6, 0.8] },
  'bronze': { hue: [30, 50], saturation: [0.3, 0.6], lightness: [0.3, 0.5] },
  'copper': { hue: [20, 40], saturation: [0.4, 0.7], lightness: [0.4, 0.6] },
  
  // Pastels
  'pastel blue': { hue: [200, 220], saturation: [0.2, 0.5], lightness: [0.7, 0.9] },
  'pastel pink': { hue: [330, 360], saturation: [0.2, 0.5], lightness: [0.7, 0.9] },
  'pastel green': { hue: [100, 120], saturation: [0.2, 0.5], lightness: [0.7, 0.9] },
  'pastel yellow': { hue: [45, 75], saturation: [0.2, 0.5], lightness: [0.7, 0.9] },
  'pastel purple': { hue: [260, 300], saturation: [0.2, 0.5], lightness: [0.7, 0.9] },
};

// Color name normalization
export function normalizeColorName(colorName) {
  return colorName.toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s-]/g, '');
}

// Fuzzy color matching for similar names
export function findSimilarColor(colorName, expectations) {
  const normalized = normalizeColorName(colorName);
  
  // Direct match
  if (expectations[normalized]) {
    return normalized;
  }
  
  // Fuzzy matching
  const words = normalized.split(' ');
  for (const [expectedColor, config] of Object.entries(expectations)) {
    const expectedWords = expectedColor.split(' ');
    
    // Check if all words in the input color are present in expected color
    const matches = words.every(word => 
      expectedWords.some(expectedWord => 
        expectedWord.includes(word) || word.includes(expectedWord)
      )
    );
    
    if (matches) {
      return expectedColor;
    }
  }
  
  return null;
}

// Enhanced color scoring
export function calculateColorScore(hex, expectedColor, expectations) {
  const hsl = hexToHsl(hex);
  const expectation = expectations[expectedColor];
  
  if (!expectation) {
    return 0.5; // Neutral score for unknown colors
  }
  
  // Calculate hue distance (handle wraparound)
  let hueDistance = Math.abs(hsl.h - expectation.hue[0]);
  if (hueDistance > 180) {
    hueDistance = 360 - hueDistance;
  }
  
  // Normalize distances
  const hueScore = Math.max(0, 1 - (hueDistance / 90)); // 90° tolerance
  const saturationScore = hsl.s >= expectation.saturation[0] && hsl.s <= expectation.saturation[1] ? 1 : 0.3;
  const lightnessScore = hsl.l >= expectation.lightness[0] && hsl.l <= expectation.lightness[1] ? 1 : 0.3;
  
  // Weighted score
  return (hueScore * 0.6) + (saturationScore * 0.2) + (lightnessScore * 0.2);
}

// Convert hex to HSL (same as in main file)
export function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return {
    h: h * 360,
    s: s,
    l: l
  };
} 