export const farmToGeoJSON = farm => {
  if (!farm?.field || !Array.isArray(farm.field)) {
    throw new Error('Farm boundary is missing');
  }

  if (farm.field.length < 3) {
    throw new Error('Farm boundary must contain at least 3 points');
  }

  const coordinates = farm.field.map(point => [
    Number(point.lng),
    Number(point.lat),
  ]);

  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];

  // GeoJSON polygons must be closed.
  if (first[0] !== last[0] || first[1] !== last[1]) {
    coordinates.push([...first]);
  }

  return {
    type: 'Polygon',
    coordinates: [coordinates],
  };
};