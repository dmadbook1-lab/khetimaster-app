/*
 * Geometry helpers for GPS-walked farm boundaries.
 * Points are {lat, lng} in degrees.
 */

const EARTH_RADIUS_M = 6371008.8;
const toRad = deg => (deg * Math.PI) / 180;

// Great-circle distance between two points, in meters.
export const distanceMeters = (a, b) => {
  if (!a || !b) {
    return 0;
  }
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
};

// Perimeter of the closed ring, in meters.
export const perimeterMeters = points => {
  if (!Array.isArray(points) || points.length < 2) {
    return 0;
  }
  let total = 0;
  for (let i = 0; i < points.length; i += 1) {
    const next = points[(i + 1) % points.length];
    if (points.length === 2 && i === 1) {
      break;
    }
    total += distanceMeters(points[i], next);
  }
  return total;
};

/*
 * Polygon area in square meters. Projects to a local equirectangular plane
 * around the centroid, then applies the shoelace formula. Accurate to well
 * under 1% for farm-sized plots.
 */
export const areaSquareMeters = points => {
  if (!Array.isArray(points) || points.length < 3) {
    return 0;
  }
  const lat0 = points.reduce((s, p) => s + p.lat, 0) / points.length;
  const lng0 = points.reduce((s, p) => s + p.lng, 0) / points.length;
  const cosLat = Math.cos(toRad(lat0));
  const xy = points.map(p => [
    toRad(p.lng - lng0) * EARTH_RADIUS_M * cosLat,
    toRad(p.lat - lat0) * EARTH_RADIUS_M,
  ]);
  let sum = 0;
  for (let i = 0; i < xy.length; i += 1) {
    const [x1, y1] = xy[i];
    const [x2, y2] = xy[(i + 1) % xy.length];
    sum += x1 * y2 - x2 * y1;
  }
  return Math.abs(sum) / 2;
};

export const SQ_METERS_PER_HECTARE = 10000;
export const SQ_METERS_PER_ACRE = 4046.8564224;
