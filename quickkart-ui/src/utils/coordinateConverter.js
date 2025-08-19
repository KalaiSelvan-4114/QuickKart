/**
 * Coordinate conversion utilities for QuickKart
 * Converts between decimal degrees and DMS (Degrees, Minutes, Seconds) format
 */

/**
 * Convert decimal degrees to DMS format
 * @param {number} decimal - Decimal degrees
 * @param {string} direction - 'N', 'S', 'E', or 'W'
 * @returns {string} DMS format string (e.g., "10°27'27.3"N")
 */
export function decimalToDMS(decimal, direction) {
  if (typeof decimal !== 'number' || isNaN(decimal)) {
    return '';
  }

  // Handle negative coordinates
  const isNegative = decimal < 0;
  const absDecimal = Math.abs(decimal);
  
  // Extract degrees, minutes, and seconds
  const degrees = Math.floor(absDecimal);
  const minutesDecimal = (absDecimal - degrees) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = ((minutesDecimal - minutes) * 60).toFixed(1);
  
  // Determine direction based on sign and coordinate type
  let finalDirection = direction;
  if (direction === 'N' || direction === 'S') {
    finalDirection = isNegative ? 'S' : 'N';
  } else if (direction === 'E' || direction === 'W') {
    finalDirection = isNegative ? 'W' : 'E';
  }
  
  return `${degrees}°${minutes}'${seconds}"${finalDirection}`;
}

/**
 * Convert DMS format to decimal degrees
 * @param {string} dmsString - DMS format string (e.g., "10°27'27.3"N")
 * @returns {number|null} Decimal degrees or null if invalid
 */
export function dmsToDecimal(dmsString) {
  if (!dmsString || typeof dmsString !== 'string') {
    return null;
  }

  // Regex to match DMS format: 10°27'27.3"N
  const dmsRegex = /^(\d+)°(\d+)'(\d+(?:\.\d+)?)"([NSEW])$/i;
  const match = dmsString.trim().match(dmsRegex);
  
  if (!match) {
    return null;
  }

  const degrees = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const seconds = parseFloat(match[3]);
  const direction = match[4].toUpperCase();

  // Convert to decimal
  let decimal = degrees + (minutes / 60) + (seconds / 3600);
  
  // Apply direction sign
  if (direction === 'S' || direction === 'W') {
    decimal = -decimal;
  }
  
  return decimal;
}

/**
 * Convert coordinate object to DMS format
 * @param {Object} coords - Object with lat and lng properties
 * @returns {Object} Object with lat and lng in DMS format
 */
export function coordsToDMS(coords) {
  if (!coords || typeof coords !== 'object') {
    return { lat: '', lng: '' };
  }

  return {
    lat: decimalToDMS(coords.lat, 'N'),
    lng: decimalToDMS(coords.lng, 'E')
  };
}

/**
 * Convert DMS coordinates to decimal coordinate object
 * @param {string} latDMS - Latitude in DMS format
 * @param {string} lngDMS - Longitude in DMS format
 * @returns {Object|null} Object with lat and lng in decimal format or null if invalid
 */
export function dmsToCoords(latDMS, lngDMS) {
  const lat = dmsToDecimal(latDMS);
  const lng = dmsToDecimal(lngDMS);
  
  if (lat === null || lng === null) {
    return null;
  }
  
  return { lat, lng };
}

/**
 * Format coordinates for display
 * @param {Object} coords - Object with lat and lng properties
 * @param {string} format - 'decimal' or 'dms' (default: 'dms')
 * @returns {string} Formatted coordinate string
 */
export function formatCoordinates(coords, format = 'dms') {
  if (!coords || typeof coords !== 'object') {
    return 'Location not set';
  }

  if (format === 'decimal') {
    return `${coords.lat?.toFixed(6) || 0}, ${coords.lng?.toFixed(6) || 0}`;
  }

  const dmsCoords = coordsToDMS(coords);
  return `${dmsCoords.lat} ${dmsCoords.lng}`;
}

/**
 * Validate if a string is in valid DMS format
 * @param {string} dmsString - String to validate
 * @returns {boolean} True if valid DMS format
 */
export function isValidDMS(dmsString) {
  if (!dmsString || typeof dmsString !== 'string') {
    return false;
  }
  
  const dmsRegex = /^(\d+)°(\d+)'(\d+(?:\.\d+)?)"([NSEW])$/i;
  return dmsRegex.test(dmsString.trim());
}

/**
 * Parse coordinate input that could be in decimal or DMS format
 * @param {string} input - Coordinate input string
 * @returns {Object|null} Parsed coordinates or null if invalid
 */
export function parseCoordinateInput(input) {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim();
  
  // Try DMS format first
  if (trimmed.includes('°') && trimmed.includes("'") && trimmed.includes('"')) {
    // Split by space to separate lat and lng
    const parts = trimmed.split(/\s+/);
    if (parts.length === 2) {
      return dmsToCoords(parts[0], parts[1]);
    }
  }
  
  // Try decimal format (lat, lng)
  if (trimmed.includes(',')) {
    const [lat, lng] = trimmed.split(',').map(coord => parseFloat(coord.trim()));
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }
  
  return null;
}
