/**
 * Google Maps Geocoding adapter.
 * Requires GOOGLE_MAPS_API_KEY env var.
 */

export interface GeocodingResult {
  lat: number
  lng: number
  formattedAddress: string
}

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    console.warn("[maps] GOOGLE_MAPS_API_KEY not set.")
    return null
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
  const res = await fetch(url)
  const data = await res.json()

  if (data.status !== "OK" || !data.results?.[0]) return null

  const { lat, lng } = data.results[0].geometry.location
  return { lat, lng, formattedAddress: data.results[0].formatted_address }
}
