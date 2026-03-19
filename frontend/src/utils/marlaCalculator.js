/**
 * Marla Calculator - Society-Specific Marla Calculations
 * 
 * Different societies use different marla standards:
 * - Standard Pakistan: 1 Marla = 272.25 sq ft (30×50 for 5 Marla = 1500 sq ft = 5.51 marla)
 * - Some societies: 1 Marla = 225 sq ft (custom)
 * - Others: Different standards
 * 
 * This module handles society-specific calculations
 */

/**
 * Calculate all plot dimensions based on society's marla standard
 * @param {number} marlaStandard - sq ft per marla (e.g., 272.25)
 * @param {string} baseMarlaName - Base marla name as string (e.g., "5 Marla")
 * @returns {object} All plot sizes with calculated dimensions
 */
export const calculateMarlaStandard = (marlaStandard, baseMarlaName = '5 Marla') => {
  if (!marlaStandard) return null;

  // Standard base marla definitions for common sizes (at 272.25 sq ft per marla)
  const baseMarlaDefinitions = {
    '5 Marla': { marlas: 5, sqft: 1500, x: 30, y: 50 },
    '6 Marla': { marlas: 6, sqft: 1632, x: 32, y: 51 },
    '7 Marla': { marlas: 7, sqft: 1904, x: 40, y: 47.6 },
    '10 Marla': { marlas: 10, sqft: 2727, x: 45, y: 60.6 },
    '1 Kanal': { marlas: 20, sqft: 5454, x: 66, y: 82.6 }
  };

  // Use the provided base marla or default to 5 Marla
  const baseMarlaName_safe = baseMarlaDefinitions[baseMarlaName] ? baseMarlaName : '5 Marla';
  const baseMarla = baseMarlaDefinitions[baseMarlaName_safe];

  const baseSqft = baseMarla.sqft;
  const baseX = baseMarla.x;
  const baseY = baseMarla.y;

  const calculations = {
    '5 Marla': calculateDimensions('5 Marla', 5, marlaStandard, baseX, baseY),
    '6 Marla': calculateDimensions('6 Marla', 6, marlaStandard, baseX, baseY),
    '7 Marla': calculateDimensions('7 Marla', 7, marlaStandard, baseX, baseY),
    '8 Marla': calculateDimensions('8 Marla', 8, marlaStandard, baseX, baseY),
    '9 Marla': calculateDimensions('9 Marla', 9, marlaStandard, baseX, baseY),
    '10 Marla': calculateDimensions('10 Marla', 10, marlaStandard, baseX, baseY),
    '11 Marla': calculateDimensions('11 Marla', 11, marlaStandard, baseX, baseY),
    '12 Marla': calculateDimensions('12 Marla', 12, marlaStandard, baseX, baseY),
    '13 Marla': calculateDimensions('13 Marla', 13, marlaStandard, baseX, baseY),
    '14 Marla': calculateDimensions('14 Marla', 14, marlaStandard, baseX, baseY),
    '15 Marla': calculateDimensions('15 Marla', 15, marlaStandard, baseX, baseY),
    '16 Marla': calculateDimensions('16 Marla', 16, marlaStandard, baseX, baseY),
    '17 Marla': calculateDimensions('17 Marla', 17, marlaStandard, baseX, baseY),
    '18 Marla': calculateDimensions('18 Marla', 18, marlaStandard, baseX, baseY),
    '19 Marla': calculateDimensions('19 Marla', 19, marlaStandard, baseX, baseY),
    '1 Kanal': calculateDimensions('1 Kanal', 20, marlaStandard, baseX, baseY),
    '2 Kanal': calculateDimensions('2 Kanal', 40, marlaStandard, baseX, baseY)
  };

  // Add alternative naming formats (with parentheses)
  const kanalDimensions = calculations['1 Kanal'];
  const kanal2Dimensions = calculations['2 Kanal'];
  calculations['20 Marla (1 Kanal)'] = kanalDimensions;
  calculations['40 Marla (2 Kanal)'] = kanal2Dimensions;

  return {
    marlaStandard,
    baseMarla: baseMarlaName_safe,
    calculations
  };
};

/**
 * Calculate dimensions for a specific plot size based on marla standard
 * Maintains the aspect ratio of the base marla
 * 
 * @param {string} plotName - e.g., "5 Marla"
 * @param {number} marlas - Number of marlas (e.g., 5)
 * @param {number} marlaStandard - sq ft per marla
 * @param {number} baseX - Base dimension X
 * @param {number} baseY - Base dimension Y
 * @returns {object} {x, y, sqft}
 */
const calculateDimensions = (plotName, marlas, marlaStandard, baseX, baseY) => {
  const baseSqft = baseX * baseY;
  const baseMarlas = baseSqft / marlaStandard;
  const targetSqft = marlas * marlaStandard;
  
  // Scale factor to maintain aspect ratio
  const scaleFactor = Math.sqrt(targetSqft / baseSqft);
  
  const x = Math.round(baseX * scaleFactor * 10) / 10; // Round to 1 decimal
  const y = Math.round(baseY * scaleFactor * 10) / 10;
  const sqft = Math.round(x * y);
  
  return {
    marlaSize: plotName,
    marlas,
    x: parseFloat(x.toFixed(2)),
    y: parseFloat(y.toFixed(2)),
    sqft,
    area: `${sqft.toLocaleString()} sq ft`
  };
};

/**
 * Normalize plot size names to handle alternative formatting
 * Maps various naming formats to standard keys
 * @param {string} plotSize - Plot size name (e.g., "20 Marla (1 Kanal)" or "1 Kanal")
 * @returns {string} Normalized plot size name
 */
const normalizePlotSizeName = (plotSize) => {
  if (!plotSize) return null;
  
  const normalized = plotSize.trim();
  
  // Already a standard key
  if (normalized.match(/^\d+\s+Marla$/) || normalized.match(/^\d+\s+Kanal$/)) {
    return normalized;
  }
  
  // Extract Kanal notation from parentheses (e.g., "20 Marla (1 Kanal)" -> "1 Kanal")
  const kanalMatch = normalized.match(/\((\d+\s+Kanal)\)/);
  if (kanalMatch) {
    return kanalMatch[1];
  }
  
  // If contains "1 Kanal" or "2 Kanal", use as-is
  if (normalized.includes('1 Kanal') || normalized.includes('2 Kanal')) {
    return normalized;
  }
  
  return normalized;
};

/**
 * Get dimensions for a specific plot size using society's marla standard
 * @param {string} plotSize - e.g., "5 Marla" or "20 Marla (1 Kanal)"
 * @param {object} societyMarlaData - Society's marla standard data
 * @returns {object|null} {x, y, sqft} or null if not found
 */
export const getDimensionsForPlotSize = (plotSize, societyMarlaData) => {
  if (!societyMarlaData || !societyMarlaData.calculations) {
    return null;
  }
  
  // Try direct lookup first
  if (societyMarlaData.calculations[plotSize]) {
    return societyMarlaData.calculations[plotSize];
  }
  
  // Try normalized version
  const normalized = normalizePlotSizeName(plotSize);
  if (normalized && societyMarlaData.calculations[normalized]) {
    return societyMarlaData.calculations[normalized];
  }
  
  return null;
};

/**
 * Get all available plot sizes for a society
 * @param {object} societyMarlaData - Society's marla standard data
 * @returns {array} Array of plot size names
 */
export const getAvailablePlotSizes = (societyMarlaData) => {
  if (!societyMarlaData || !societyMarlaData.calculations) {
    return [];
  }
  return Object.keys(societyMarlaData.calculations);
};

/**
 * Calculate Y dimension when X is changed (maintaining constant area)
 * @param {number} newX - New X dimension
 * @param {number} totalArea - Total area to maintain
 * @returns {number} Calculated Y dimension
 */
export const calculateYFromX = (newX, totalArea) => {
  if (!newX || !totalArea || newX <= 0) return 0;
  return Math.round((totalArea / newX) * 100) / 100;
};

/**
 * Calculate X dimension when Y is changed (maintaining constant area)
 * @param {number} newY - New Y dimension
 * @param {number} totalArea - Total area to maintain
 * @returns {number} Calculated X dimension
 */
export const calculateXFromY = (newY, totalArea) => {
  if (!newY || !totalArea || newY <= 0) return 0;
  return Math.round((totalArea / newY) * 100) / 100;
};

/**
 * Validate if dimensions are reasonable for the given area
 * @param {number} x - X dimension
 * @param {number} y - Y dimension
 * @param {number} tolerance - Percentage tolerance (default 5%)
 * @returns {boolean}
 */
export const validateDimensions = (x, y, targetArea, tolerance = 5) => {
  if (!x || !y || x <= 0 || y <= 0) return false;
  
  const calculatedArea = x * y;
  const difference = Math.abs(calculatedArea - targetArea);
  const percentDifference = (difference / targetArea) * 100;
  
  return percentDifference <= tolerance;
};
