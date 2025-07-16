#!/usr/bin/env node

// test-color-analysis.js — Test script for enhanced color analysis
// Run with: node test-color-analysis.js

import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import color utilities
import { 
  EXTENDED_COLOR_EXPECTATIONS, 
  hexToHsl, 
  colorMatches, 
  findSimilarColor,
  calculateColorScore 
} from './color-utils.js';

// Color expectations from main Lambda
const COLOR_EXPECTATIONS = {
  // Yellows
  'yellow': { hue: [45, 75], saturation: [0.6, 1.0], lightness: [0.4, 0.8] },
  'sunny yellow': { hue: [45, 75], saturation: [0.7, 1.0], lightness: [0.5, 0.8] },
  'golden yellow': { hue: [45, 65], saturation: [0.6, 0.9], lightness: [0.4, 0.7] },
  'cream': { hue: [45, 75], saturation: [0.1, 0.4], lightness: [0.7, 0.9] },
  
  // Reds
  'red': { hue: [0, 20], saturation: [0.7, 1.0], lightness: [0.3, 0.6] },
  'brick red': { hue: [0, 20], saturation: [0.6, 0.9], lightness: [0.3, 0.5] },
  'coral': { hue: [10, 25], saturation: [0.6, 0.9], lightness: [0.5, 0.7] },
  'pink': { hue: [330, 360], saturation: [0.4, 0.8], lightness: [0.6, 0.8] },
  
  // Blues
  'blue': { hue: [200, 240], saturation: [0.6, 1.0], lightness: [0.3, 0.6] },
  'navy': { hue: [200, 240], saturation: [0.7, 1.0], lightness: [0.2, 0.4] },
  'royal blue': { hue: [210, 230], saturation: [0.8, 1.0], lightness: [0.4, 0.6] },
  
  // Greens
  'green': { hue: [100, 140], saturation: [0.6, 1.0], lightness: [0.3, 0.6] },
  'emerald': { hue: [120, 140], saturation: [0.7, 1.0], lightness: [0.3, 0.5] },
  'olive': { hue: [60, 80], saturation: [0.4, 0.7], lightness: [0.4, 0.6] },
  
  // Purples
  'purple': { hue: [260, 300], saturation: [0.6, 1.0], lightness: [0.3, 0.6] },
  'lavender': { hue: [260, 300], saturation: [0.3, 0.6], lightness: [0.6, 0.8] },
  
  // Neutrals
  'black': { hue: [0, 360], saturation: [0, 0.1], lightness: [0, 0.2] },
  'white': { hue: [0, 360], saturation: [0, 0.1], lightness: [0.8, 1.0] },
  'gray': { hue: [0, 360], saturation: [0, 0.2], lightness: [0.4, 0.6] },
  'brown': { hue: [20, 40], saturation: [0.3, 0.7], lightness: [0.2, 0.5] },
  'beige': { hue: [45, 65], saturation: [0.1, 0.3], lightness: [0.7, 0.9] },
  
  // Metallics
  'gold': { hue: [45, 65], saturation: [0.4, 0.8], lightness: [0.5, 0.7] },
  'silver': { hue: [0, 360], saturation: [0, 0.2], lightness: [0.6, 0.8] },
};

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

// Test color matching function
function testColorMatching() {
  console.log('🎨 Testing Color Matching...\n');
  
  const testCases = [
    { color: 'sunny yellow', hex: '#FFD700', expected: true },
    { color: 'sunny yellow', hex: '#dd776b', expected: false }, // peach
    { color: 'red', hex: '#FF0000', expected: true },
    { color: 'blue', hex: '#0000FF', expected: true },
    { color: 'green', hex: '#00FF00', expected: true },
    { color: 'black', hex: '#000000', expected: true },
    { color: 'white', hex: '#FFFFFF', expected: true },
    { color: 'gold', hex: '#FFD700', expected: true },
    { color: 'cream', hex: '#FFFDD0', expected: true },
  ];
  
  let passed = 0;
  let total = testCases.length;
  
  for (const testCase of testCases) {
    const result = colorMatches(testCase.color, testCase.hex);
    const hsl = hexToHsl(testCase.hex);
    const status = result === testCase.expected ? '✅' : '❌';
    
    console.log(`${status} ${testCase.color} (#${testCase.hex.slice(1)})`);
    console.log(`   HSL: ${hsl.h.toFixed(1)}°, ${(hsl.s * 100).toFixed(1)}%, ${(hsl.l * 100).toFixed(1)}%`);
    console.log(`   Expected: ${testCase.expected}, Got: ${result}`);
    console.log('');
    
    if (result === testCase.expected) passed++;
  }
  
  console.log(`📊 Color Matching: ${passed}/${total} tests passed (${(passed/total*100).toFixed(1)}%)\n`);
  return passed === total;
}

// Test color scoring function
function testColorScoring() {
  console.log('📊 Testing Color Scoring...\n');
  
  const testCases = [
    { color: 'sunny yellow', hex: '#FFD700', expectedMin: 0.8 },
    { color: 'sunny yellow', hex: '#dd776b', expectedMax: 0.3 }, // peach
    { color: 'red', hex: '#FF0000', expectedMin: 0.9 },
    { color: 'blue', hex: '#0000FF', expectedMin: 0.9 },
  ];
  
  let passed = 0;
  let total = testCases.length;
  
  for (const testCase of testCases) {
    const score = calculateColorScore(testCase.hex, testCase.color, COLOR_EXPECTATIONS);
    const hsl = hexToHsl(testCase.hex);
    
    let status = '❓';
    if (testCase.expectedMin && score >= testCase.expectedMin) {
      status = '✅';
      passed++;
    } else if (testCase.expectedMax && score <= testCase.expectedMax) {
      status = '✅';
      passed++;
    }
    
    console.log(`${status} ${testCase.color} (#${testCase.hex.slice(1)})`);
    console.log(`   Score: ${score.toFixed(3)}`);
    console.log(`   HSL: ${hsl.h.toFixed(1)}°, ${(hsl.s * 100).toFixed(1)}%, ${(hsl.l * 100).toFixed(1)}%`);
    console.log('');
  }
  
  console.log(`📊 Color Scoring: ${passed}/${total} tests passed (${(passed/total*100).toFixed(1)}%)\n`);
  return passed === total;
}

// Test fuzzy color matching
function testFuzzyMatching() {
  console.log('🔍 Testing Fuzzy Color Matching...\n');
  
  const testCases = [
    { input: 'sunny yellow', expected: 'sunny yellow' },
    { input: 'bright yellow', expected: 'yellow' },
    { input: 'deep red', expected: 'red' },
    { input: 'navy blue', expected: 'navy' },
    { input: 'unknown color', expected: null },
  ];
  
  let passed = 0;
  let total = testCases.length;
  
  for (const testCase of testCases) {
    const result = findSimilarColor(testCase.input, COLOR_EXPECTATIONS);
    const status = result === testCase.expected ? '✅' : '❌';
    
    console.log(`${status} "${testCase.input}" → "${result}"`);
    console.log(`   Expected: "${testCase.expected}"`);
    console.log('');
    
    if (result === testCase.expected) passed++;
  }
  
  console.log(`📊 Fuzzy Matching: ${passed}/${total} tests passed (${(passed/total*100).toFixed(1)}%)\n`);
  return passed === total;
}

// Test HSL conversion
function testHslConversion() {
  console.log('🔄 Testing HSL Conversion...\n');
  
  const testCases = [
    { hex: '#FF0000', expected: { h: 0, s: 1, l: 0.5 } },
    { hex: '#00FF00', expected: { h: 120, s: 1, l: 0.5 } },
    { hex: '#0000FF', expected: { h: 240, s: 1, l: 0.5 } },
    { hex: '#FFFF00', expected: { h: 60, s: 1, l: 0.5 } },
    { hex: '#FFD700', expected: { h: 51, s: 1, l: 0.5 } }, // gold
  ];
  
  let passed = 0;
  let total = testCases.length;
  
  for (const testCase of testCases) {
    const result = hexToHsl(testCase.hex);
    const hueMatch = Math.abs(result.h - testCase.expected.h) < 5;
    const saturationMatch = Math.abs(result.s - testCase.expected.s) < 0.1;
    const lightnessMatch = Math.abs(result.l - testCase.expected.l) < 0.1;
    const allMatch = hueMatch && saturationMatch && lightnessMatch;
    
    const status = allMatch ? '✅' : '❌';
    console.log(`${status} ${testCase.hex}`);
    console.log(`   Expected: H:${testCase.expected.h}° S:${(testCase.expected.s*100).toFixed(0)}% L:${(testCase.expected.l*100).toFixed(0)}%`);
    console.log(`   Got:      H:${result.h.toFixed(1)}° S:${(result.s*100).toFixed(1)}% L:${(result.l*100).toFixed(1)}%`);
    console.log('');
    
    if (allMatch) passed++;
  }
  
  console.log(`📊 HSL Conversion: ${passed}/${total} tests passed (${(passed/total*100).toFixed(1)}%)\n`);
  return passed === total;
}

// Test with sample image if provided
async function testImageAnalysis(imagePath) {
  if (!imagePath) {
    console.log('📷 No image path provided. Skipping image analysis test.\n');
    return true;
  }
  
  console.log('📷 Testing Image Analysis...\n');
  
  try {
    const dominantColors = await extractDominantColors(imagePath);
    console.log(`✅ Extracted dominant colors from ${imagePath}:`);
    
    for (let i = 0; i < dominantColors.length; i++) {
      const hex = dominantColors[i];
      const hsl = hexToHsl(hex);
      console.log(`   ${i + 1}. ${hex} - HSL: ${hsl.h.toFixed(1)}°, ${(hsl.s * 100).toFixed(1)}%, ${(hsl.l * 100).toFixed(1)}%`);
    }
    console.log('');
    return true;
  } catch (error) {
    console.error(`❌ Image analysis failed: ${error.message}\n`);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🧪 Enhanced Color Analysis Test Suite\n');
  console.log('=====================================\n');
  
  const results = [];
  
  // Run all tests
  results.push(testHslConversion());
  results.push(testColorMatching());
  results.push(testColorScoring());
  results.push(testFuzzyMatching());
  
  // Test with image if provided
  const imagePath = process.argv[2];
  results.push(await testImageAnalysis(imagePath));
  
  // Summary
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log('📋 Test Summary');
  console.log('==============');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  console.log(`📊 Success Rate: ${(passed/total*100).toFixed(1)}%\n`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Your color analysis system is ready for deployment.');
  } else {
    console.log('⚠️  Some tests failed. Please review the issues above.');
  }
  
  return passed === total;
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests }; 