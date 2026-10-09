export default function makePolygonCoordinates(
  points,
  {minPoints = 4, precision = 6} = {},
) {
  if (!Array.isArray(points) || points.length === 0) {
    return [];
  }

  const factor = Math.pow(10, precision);

  const ring = [];

  for (let i = 0; i < points.length; i += 1) {
    const point = points[i];

    let lat = null;
    let lng = null;

    /*
     * Supports:
     *
     * {lat: 20.123, lng: 73.123}
     *
     * OR
     *
     * [20.123, 73.123]
     */

    if (Array.isArray(point)) {
      lat = Number(point[0]);
      lng = Number(point[1]);
    } else if (
      point &&
      typeof point === 'object'
    ) {
      lat = Number(point.lat);
      lng = Number(point.lng);
    }

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      return [];
    }

    /*
     * CropGen requires:
     *
     * [longitude, latitude]
     */

    ring.push([
      Math.round(lng * factor) / factor,
      Math.round(lat * factor) / factor,
    ]);
  }

  /*
   * Polygon requires at least 3 actual points.
   */

  if (ring.length < 3) {
    return [];
  }

  /*
   * Close polygon.
   */

  const first = ring[0];
  const last = ring[ring.length - 1];

  const isClosed =
    first[0] === last[0] &&
    first[1] === last[1];

  if (!isClosed) {
    ring.push([...first]);
  }

  /*
   * After closing, a valid polygon
   * has at least 4 coordinates.
   */

  if (ring.length < minPoints) {
    return [];
  }

  return [ring];
}