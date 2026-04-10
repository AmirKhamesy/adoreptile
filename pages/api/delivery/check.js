import { mongooseConnect } from "@/lib/mongoose";
import { Setting } from "@/models/Setting";

// Haversine formula to calculate distance between two lat/lng points in km
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { streetAddress, city, postalCode, country } = req.query;

  if (!streetAddress || !city || !postalCode || !country) {
    return res.status(400).json({ error: "Missing address fields" });
  }

  await mongooseConnect();

  const deliverySettingsDoc = await Setting.findOne({ name: "deliverySettings" });
  if (!deliverySettingsDoc?.value) {
    return res.json({ available: false, reason: "Local delivery not configured" });
  }

  const deliverySettings = deliverySettingsDoc.value;
  const { location, maxRadiusKm, deliveryFee = 15 } = deliverySettings;

  if (!location?.lat || !location?.lng) {
    return res.json({ available: false, reason: "Delivery location not configured" });
  }

  // Geocode user address via Nominatim (OpenStreetMap, free, no API key)
  const query = encodeURIComponent(
    `${streetAddress}, ${city}, ${postalCode}, ${country}`
  );
  const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

  let userLat, userLng;
  try {
    const response = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "AdoReptile/1.0 (adoreptile.com)",
      },
    });
    const data = await response.json();
    if (!data || data.length === 0) {
      return res.json({ available: false, reason: "Could not geocode address" });
    }
    userLat = parseFloat(data[0].lat);
    userLng = parseFloat(data[0].lon);
  } catch (err) {
    console.error("Geocoding error:", err);
    return res.json({ available: false, reason: "Geocoding failed" });
  }

  const distanceKm = haversineDistance(
    location.lat,
    location.lng,
    userLat,
    userLng
  );

  const available = distanceKm <= maxRadiusKm;

  return res.json({
    available,
    distanceKm: Math.round(distanceKm * 10) / 10,
    maxRadiusKm,
    deliveryFee,
    reason: available ? null : `Your address is ${Math.round(distanceKm)} km away (max ${maxRadiusKm} km)`,
  });
}
