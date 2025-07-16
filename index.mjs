// Enhanced Color Report Lambda - Copy this entire file into your Lambda function
// This solves the "sunny yellow" problem by extracting proper yellow frames instead of peach

import {
  writeFileSync,
  unlinkSync,
  readFileSync,
  createWriteStream,
} from "node:fs";
import { execSync } from "node:child_process";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { pipeline } from "node:stream/promises";
import sharp from 'sharp';

const s3 = new S3Client({ region: "us-east-2" });
const BUCKET = process.env.BUCKET || "color-reports-assets";
const REGION = "us-east-2";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Universal color mapping system - works for any color name
const COLOR_FAMILIES = {
  // Yellows & Golds
  'yellow': { hue: [45, 75], saturation: [0.6, 1.0], lightness: [0.4, 0.8] },
  'gold': { hue: [45, 65], saturation: [0.4, 0.8], lightness: [0.5, 0.7] },
  'cream': { hue: [45, 75], saturation: [0.1, 0.4], lightness: [0.7, 0.9] },
  'ivory': { hue: [45, 75], saturation: [0.05, 0.3], lightness: [0.8, 0.95] },
  'mustard': { hue: [45, 65], saturation: [0.5, 0.8], lightness: [0.3, 0.6] },
  
  // Reds & Pinks
  'red': { hue: [0, 20], saturation: [0.7, 1.0], lightness: [0.3, 0.6] },
  'pink': { hue: [330, 360], saturation: [0.4, 0.8], lightness: [0.6, 0.8] },
  'coral': { hue: [10, 25], saturation: [0.6, 0.9], lightness: [0.5, 0.7] },
  'rose': { hue: [330, 360], saturation: [0.5, 0.8], lightness: [0.5, 0.7] },
  'salmon': { hue: [15, 25], saturation: [0.4, 0.7], lightness: [0.6, 0.8] },
  'burgundy': { hue: [0, 15], saturation: [0.6, 0.9], lightness: [0.2, 0.4] },
  'maroon': { hue: [0, 15], saturation: [0.5, 0.8], lightness: [0.2, 0.4] },
  
  // Blues
  'blue': { hue: [200, 240], saturation: [0.6, 1.0], lightness: [0.3, 0.6] },
  'navy': { hue: [200, 240], saturation: [0.7, 1.0], lightness: [0.2, 0.4] },
  'royal': { hue: [210, 230], saturation: [0.8, 1.0], lightness: [0.4, 0.6] },
  'sky': { hue: [200, 220], saturation: [0.4, 0.7], lightness: [0.6, 0.8] },
  'teal': { hue: [170, 190], saturation: [0.5, 0.8], lightness: [0.3, 0.6] },
  'turquoise': { hue: [170, 190], saturation: [0.6, 0.9], lightness: [0.5, 0.7] },
  'periwinkle': { hue: [220, 240], saturation: [0.3, 0.6], lightness: [0.6, 0.8] },
  'indigo': { hue: [220, 260], saturation: [0.4, 0.8], lightness: [0.3, 0.6] },
  
  // Greens
  'green': { hue: [100, 140], saturation: [0.6, 1.0], lightness: [0.3, 0.6] },
  'emerald': { hue: [120, 140], saturation: [0.7, 1.0], lightness: [0.3, 0.5] },
  'olive': { hue: [60, 80], saturation: [0.4, 0.7], lightness: [0.4, 0.6] },
  'sage': { hue: [80, 100], saturation: [0.2, 0.5], lightness: [0.5, 0.7] },
  'forest': { hue: [100, 120], saturation: [0.6, 0.9], lightness: [0.2, 0.4] },
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
  'silver': { hue: [0, 360], saturation: [0, 0.2], lightness: [0.6, 0.8] },
  'bronze': { hue: [30, 50], saturation: [0.3, 0.6], lightness: [0.3, 0.5] },
  'copper': { hue: [20, 40], saturation: [0.4, 0.7], lightness: [0.4, 0.6] },
  
  // Pastels
  'pastel': { saturation: [0.2, 0.5], lightness: [0.7, 0.9] },
  'light': { lightness: [0.7, 0.9] },
  'dark': { lightness: [0.2, 0.4] },
  'bright': { saturation: [0.8, 1.0] },
  'muted': { saturation: [0.2, 0.5] },
};

// Convert hex to HSL for color analysis
function hexToHsl(hex) {
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
  
  return { h: h * 360, s: s, l: l };
}

// Universal color matching - works for any color name
function colorMatches(colorName, hexColor) {
  const hsl = hexToHsl(hexColor);
  const colorWords = colorName.toLowerCase().split(/\s+/);
  
  // Find matching color families
  const matchingFamilies = [];
  
  for (const word of colorWords) {
    if (COLOR_FAMILIES[word]) {
      matchingFamilies.push(COLOR_FAMILIES[word]);
    }
  }
  
  // If no specific matches, try fuzzy matching
  if (matchingFamilies.length === 0) {
    for (const [familyName, family] of Object.entries(COLOR_FAMILIES)) {
      if (colorWords.some(word => word.includes(familyName) || familyName.includes(word))) {
        matchingFamilies.push(family);
      }
    }
  }
  
  // If still no matches, accept any color (fallback)
  if (matchingFamilies.length === 0) {
    return true;
  }
  
  // Check if color matches any of the identified families
  for (const family of matchingFamilies) {
    let matches = true;
    
    // Check hue if specified
    if (family.hue) {
      let hueMatch = false;
      if (family.hue[0] <= family.hue[1]) {
        hueMatch = hsl.h >= family.hue[0] && hsl.h <= family.hue[1];
      } else {
        hueMatch = hsl.h >= family.hue[0] || hsl.h <= family.hue[1];
      }
      matches = matches && hueMatch;
    }
    
    // Check saturation if specified
    if (family.saturation) {
      matches = matches && (hsl.s >= family.saturation[0] && hsl.s <= family.saturation[1]);
    }
    
    // Check lightness if specified
    if (family.lightness) {
      matches = matches && (hsl.l >= family.lightness[0] && hsl.l <= family.lightness[1]);
    }
    
    if (matches) {
      return true;
    }
  }
  
  return false;
}

// Extract dominant colors from image using Sharp
async function extractDominantColors(imagePath) {
  try {
    const image = sharp(imagePath);
    const { data, info } = await image
      .resize(100, 100) // Resize for faster processing
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    // Sample pixels and find dominant colors
    const colors = new Map();
    const sampleSize = 1000;
    
    for (let i = 0; i < sampleSize; i++) {
      const pixelIndex = Math.floor(Math.random() * (data.length / 3)) * 3;
      const r = data[pixelIndex];
      const g = data[pixelIndex + 1];
      const b = data[pixelIndex + 2];
      
      // Skip very dark or very light pixels (likely background)
      const brightness = (r + g + b) / 3;
      if (brightness < 30 || brightness > 225) continue;
      
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      colors.set(hex, (colors.get(hex) || 0) + 1);
    }
    
    // Return top 3 dominant colors
    return Array.from(colors.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hex]) => hex);
  } catch (error) {
    console.error('Color extraction error:', error);
    return ['#CCCCCC']; // Fallback
  }
}

// Use OpenAI Vision to select best frame (optional backup)
async function selectBestFrameWithVision(colorName, candidateUrls) {
  if (!OPENAI_API_KEY || candidateUrls.length === 0) {
    return { url: candidateUrls[0], hex: '#CCCCCC' };
  }
  
  try {
    const prompt = `You are a professional color analyst. Look at these frames and select the one that best represents "${colorName}". 
    
    Consider:
    1. The drape should be clearly visible and well-lit
    2. The color should match the expected hue for "${colorName}"
    3. The frame should show the client's face clearly
    4. Avoid frames with shadows, poor lighting, or unclear colors
    
    Respond with ONLY the index number (0-${candidateUrls.length - 1}) of the best frame.`;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              ...candidateUrls.map((url, index) => ({
                type: 'image_url',
                image_url: { url }
              }))
            ]
          }
        ],
        max_tokens: 10
      })
    });
    
    const result = await response.json();
    const selectedIndex = parseInt(result.choices[0].message.content.trim());
    
    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= candidateUrls.length) {
      return { url: candidateUrls[0], hex: '#CCCCCC' };
    }
    
    return { url: candidateUrls[selectedIndex], hex: '#CCCCCC' };
  } catch (error) {
    console.error('Vision API error:', error);
    return { url: candidateUrls[0], hex: '#CCCCCC' };
  }
}

// Enhanced color analysis for a single frame
async function analyzeFrameColor(imagePath, expectedColor) {
  const dominantColors = await extractDominantColors(imagePath);
  
  // Find the best matching color
  let bestColor = dominantColors[0];
  let bestScore = 0;
  let hasMatchingColor = false;
  
  for (const hex of dominantColors) {
    const matches = colorMatches(expectedColor, hex);
    const hsl = hexToHsl(hex);
    
    if (matches) {
      hasMatchingColor = true;
      // Score based on saturation and lightness (prefer vibrant colors)
      const score = hsl.s * hsl.l;
      if (score > bestScore) {
        bestScore = score;
        bestColor = hex;
      }
    }
  }
  
  // If no matching colors found, still pick the most vibrant one
  if (!hasMatchingColor) {
    for (const hex of dominantColors) {
      const hsl = hexToHsl(hex);
      const score = hsl.s * hsl.l;
      if (score > bestScore) {
        bestScore = score;
        bestColor = hex;
      }
    }
  }
  
  return {
    hex: bestColor,
    candidates: dominantColors,
    matches: hasMatchingColor,
    score: bestScore
  };
}

export const handler = async (event = {}) => {
  console.log('Enhanced function started with auto-deployment. Event received:', JSON.stringify(event));

  let payload;
  try {
    payload = typeof event.body === "string" ? JSON.parse(event.body) : event;
  } catch (err) {
    console.error('Payload parse error:', err);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON payload", details: err.message }),
    };
  }

  const {
    id = "no-id",
    videoUrl,
    wowColors = [],
    avoidColors = [],
    perColorNotes = {},
    undertoneAnalysis = { colors: [] },
    colorTimestamps = {},
  } = payload;

  if (!videoUrl) {
    console.error('Missing videoUrl');
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "videoUrl required" }),
    };
  }

  // Download video to /tmp
  const vidPath = `/tmp/${id}.mp4`;
  try {
    if (videoUrl.startsWith("s3://")) {
      const [, , bucket, ...keyParts] = videoUrl.split("/");
      const Key = keyParts.join("/");
      const { Body } = await s3.send(
        new GetObjectCommand({ Bucket: bucket, Key })
      );
      await pipeline(Body, createWriteStream(vidPath));
    } else {
      const res = await fetch(videoUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      writeFileSync(vidPath, buf);
    }
    console.log('Video downloaded successfully to', vidPath);
  } catch (err) {
    console.error('Download error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Download failed", details: err.message }),
    };
  }

  // Probe video duration
  let duration = 0;
  try {
    const out = execSync(
      `/opt/bin/ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${vidPath}`,
      { stdio: "pipe" }
    )
      .toString()
      .trim();
    duration = parseFloat(out);
    console.log('Video duration:', duration);
  } catch (err) {
    console.error('ffprobe error:', err);
  }

  // Get unique colors
  const keys = [
    ...(Array.isArray(wowColors) ? wowColors.map(c => c.color || '') : []),
    ...(Array.isArray(avoidColors) ? avoidColors.map(c => c.color || '') : []),
    ...Object.keys(perColorNotes),
    ...(undertoneAnalysis.colors ? undertoneAnalysis.colors.map(c => c.color || '') : [])
  ].filter(Boolean);
  const uniqueColors = [...new Set(keys)];
  console.log('Unique colors:', uniqueColors);

  // Enhanced frame extraction and analysis
  const frames = {};
  try {
    if (uniqueColors.length > 0 && duration > 0) {
      const hasTimestamps = Object.keys(colorTimestamps).length > 0;
      const interval = duration / (uniqueColors.length + 1);

      for (const [i, color] of uniqueColors.entries()) {
        let baseTs = hasTimestamps ? colorTimestamps[color] : (i + 1) * interval;
        if (baseTs === undefined || baseTs < 0 || baseTs > duration) {
          baseTs = (i + 1) * interval;
        } else if (baseTs > duration - 5) {
          baseTs = duration - 5;
        }
        
        // Smart timing strategy: Extract frames around the mention time
        // Don't add fixed delays - let color analysis determine the best frame
        console.log(`Base TS for ${color}: ${baseTs} (extracting frames around this time)`);

        // Comprehensive frame extraction to catch different timing patterns
        let frameRange = 45; // Default: ±45 seconds (wider range)
        let frameStep = 1.5; // Default: 1.5-second steps (more granular)
        
        // Adjust based on video duration
        if (duration < 120) {
          frameRange = 30;
          frameStep = 1;
        } else if (duration > 600) {
          frameRange = 60;
          frameStep = 2;
        }
        
        // Generate offsets dynamically
        const offsets = [];
        for (let offset = -frameRange; offset <= frameRange; offset += frameStep) {
          offsets.push(offset);
        }
        const candidateData = [];
        
        for (const offset of offsets) {
          let ts = baseTs + offset;
          ts = Math.max(0, Math.min(duration - 1, ts));
          const tempPath = `/tmp/${id}_${color.replace(/\s/g, '_')}_${offset}.jpg`;
          
          try {
            execSync(
              `/opt/bin/ffmpeg -y -loglevel error -ss ${ts} -i ${vidPath} -vframes 1 "${tempPath}"`
            );
            console.log(`Extracted candidate at ${ts}s: ${tempPath}`);

            // Analyze color immediately - this is where the magic happens!
            const colorAnalysis = await analyzeFrameColor(tempPath, color);
            
            // Upload candidate
            const slug = color.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
            const file = `${id}_${slug}_${offset}.jpg`;
            const Key = `${id}/candidates/${file}`;
            await s3.send(
              new PutObjectCommand({
                Bucket: BUCKET,
                Key,
                Body: readFileSync(tempPath),
                ContentType: "image/jpeg",
                ACL: 'public-read'
              })
            );
            const url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${Key}`;
            
            candidateData.push({
              url,
              hex: colorAnalysis.hex,
              matches: colorAnalysis.matches,
              score: colorAnalysis.matches ? 1 : 0,
              timestamp: ts
            });
            
            console.log(`Analyzed candidate for ${color}: ${url} (hex: ${colorAnalysis.hex}, matches: ${colorAnalysis.matches})`);
            unlinkSync(tempPath);
          } catch (err) {
            console.error(`Error processing candidate ${offset}:`, err);
          }
        }

        // Smart frame selection strategy that adapts to different timing patterns
        let selectedFrame;
        
        // Strategy 1: Look for frames with the expected color that appear AFTER the mention
        // This handles cases where the drape is put on immediately or shortly after mention
        const laterMatchingFrames = candidateData.filter(c => 
          c.matches && c.timestamp >= baseTs
        );
        
        if (laterMatchingFrames.length > 0) {
          // Score later frames based on color quality and timing
          const scoredFrames = laterMatchingFrames.map(frame => {
            const hsl = hexToHsl(frame.hex);
            const timeScore = 1 / (1 + Math.abs(frame.timestamp - baseTs)); // Closer to mention = better
            const vibrancyScore = hsl.s * hsl.l; // More vibrant = better
            const delayScore = Math.min(1, (frame.timestamp - baseTs) / 20); // Some delay is good, but not too much
            
            return {
              ...frame,
              totalScore: timeScore * vibrancyScore * (1 + delayScore * 0.5)
            };
          });
          
          selectedFrame = scoredFrames.reduce((best, current) => 
            current.totalScore > best.totalScore ? current : best
          );
          
          console.log(`Selected later matching frame for ${color}: ${selectedFrame.timestamp}s (${selectedFrame.timestamp - baseTs}s after mention)`);
        } else {
          // Strategy 2: Look for ANY frames with the expected color (including before mention)
          // This handles cases where the drape was already on or mentioned late
          const allMatchingFrames = candidateData.filter(c => c.matches);
          
          if (allMatchingFrames.length > 0) {
            const scoredFrames = allMatchingFrames.map(frame => {
              const hsl = hexToHsl(frame.hex);
              const timeScore = 1 / (1 + Math.abs(frame.timestamp - baseTs));
              const vibrancyScore = hsl.s * hsl.l;
              const positionScore = frame.timestamp >= baseTs ? 1.2 : 0.8; // Slight preference for later frames
              
              return {
                ...frame,
                totalScore: timeScore * vibrancyScore * positionScore
              };
            });
            
            selectedFrame = scoredFrames.reduce((best, current) => 
              current.totalScore > best.totalScore ? current : best
            );
            
            console.log(`Selected any matching frame for ${color}: ${selectedFrame.timestamp}s`);
          } else {
            // Strategy 3: OpenAI Vision backup for intelligent selection
            if (OPENAI_API_KEY) {
              const candidateUrls = candidateData.map(c => c.url);
              const visionResult = await selectBestFrameWithVision(color, candidateUrls);
              selectedFrame = candidateData.find(c => c.url === visionResult.url);
              console.log(`Used Vision API for ${color}`);
            }
            
            // Strategy 4: Smart fallback - prefer vibrant colors in later frames
            if (!selectedFrame) {
              const scoredFrames = candidateData.map(frame => {
                const hsl = hexToHsl(frame.hex);
                const timeScore = 1 / (1 + Math.abs(frame.timestamp - baseTs));
                const vibrancyScore = hsl.s * hsl.l;
                const positionScore = frame.timestamp >= baseTs ? 1.3 : 1;
                
                return {
                  ...frame,
                  totalScore: timeScore * vibrancyScore * positionScore
                };
              });
              
              selectedFrame = scoredFrames.reduce((best, current) => 
                current.totalScore > best.totalScore ? current : best
              );
              
              console.log(`Used fallback strategy for ${color}: ${selectedFrame.timestamp}s`);
            }
          }
        }

        frames[color] = {
          url: selectedFrame.url,
          hex: selectedFrame.hex,
          candidates: candidateData.map(c => c.url),
          analysis: {
            totalCandidates: candidateData.length,
            matchingCandidates: candidateData.filter(c => c.matches).length,
            selectedStrategy: selectedFrame.matches ? 'color-matching' : 'vision-api'
          }
        };
        
        console.log(`Selected frame for ${color}: ${selectedFrame.url} (hex: ${selectedFrame.hex})`);
      }
    }
    unlinkSync(vidPath);
  } catch (err) {
    console.error('Extraction/analysis error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "ffmpeg/analysis failed", details: err.message }),
    };
  }

  // Return enriched JSON with analyzed frames
  console.log('Enhanced frames analysis:', frames);
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ok: true,
      id,
      wowColors,
      avoidColors,
      perColorNotes,
      undertoneAnalysis,
      frames,  // { color: { url, hex, candidates, analysis } }
    }),
  };
};