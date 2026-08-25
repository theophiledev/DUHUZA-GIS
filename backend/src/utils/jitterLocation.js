/**
 * Applies a small random offset to exact coordinates so the PUBLIC pin
 * shown on the map is approximate, never the exact parcel/house location
 * (SRS: public_lat/public_lng vs private_lat/private_lng, FR16, BR3).
 *
 * This runs once at listing-creation/approval time — the jittered value
 * is stored in public_lat/public_lng, NOT computed on every request, so
 * it stays consistent for a given listing.
 */
function jitterCoordinates(lat, lng, radiusMeters = Number(process.env.LOCATION_JITTER_METERS || 400)) {
  // Random point within a circle of radiusMeters around (lat, lng)
  const radiusInDegrees = radiusMeters / 111320; // rough meters-per-degree at the equator

  const u = Math.random();
  const v = Math.random();
  const w = radiusInDegrees * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const dx = w * Math.cos(t);
  const dy = w * Math.sin(t);

  // Adjust dx for longitude compression at this latitude
  const dLng = dx / Math.cos((lat * Math.PI) / 180);

  return {
    publicLat: lat + dy,
    publicLng: lng + dLng,
  };
}

module.exports = { jitterCoordinates };
