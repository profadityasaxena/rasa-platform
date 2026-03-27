# RASA Platform — Location Model

## Overview

Location data is used in two contexts: volunteer profiles and mission (opportunity) listings. Both store **structured address fields** alongside **geocoded coordinates**. Coordinates are resolved server-side — users never enter latitude/longitude manually.

---

## Location Fields

Both `IVolunteer.location` and `IOpportunity.location` share the same structure:

| Field | Required | Description |
|-------|----------|-------------|
| `city` | Yes | City name |
| `street` | No | Street number and name |
| `province` | No | Province, state, or region |
| `postalCode` | No | Postal/ZIP code |
| `country` | No | Country name |
| `address` | No | Formatted address returned by geocoder |
| `lat` | Auto | Latitude (resolved by geocoding API) |
| `lng` | Auto | Longitude (resolved by geocoding API) |

`lat` and `lng` default to `0` if geocoding is unavailable.

---

## Geocoding Flow

**When a user saves a location (volunteer profile or mission creation):**

1. User fills in: Street, City, Province, Postal Code, Country in the form
2. Form submits address fields to the API route (no lat/lng in the payload)
3. API route builds a combined address string:
   ```
   "Rua do Ouro, 123, Lisbon, Lisboa, 1100-001, Portugal"
   ```
4. Calls `geocodeAddress(combinedString)` from `adapters/maps/google.ts`
5. If the Google Maps API key is set and geocoding succeeds:
   - `lat`, `lng` are populated from the result
   - `address` is set to the formatted address returned by Google
6. If geocoding fails (no API key, API error, address not found):
   - `lat` and `lng` default to `0`
   - The address is still saved correctly
   - Matching algorithm will give this location a score of 0 for proximity (graceful degradation)

---

## Form Inputs

### Opportunity Create Form (`/opportunity/create`)

```
Street (optional)       → location.street
City (required)         → location.city
Province (optional)     → location.province
Postal Code (optional)  → location.postalCode
Country (optional)      → location.country
```

### Volunteer Profile Form (`/volunteer`)

Same fields. Pre-populated from the stored profile on load.

---

## Geocoding API

**File:** `adapters/maps/google.ts`

**Requires:** `GOOGLE_MAPS_API_KEY` environment variable

**Behaviour without key:** Logs a warning, returns `null`, coords default to `0,0`.

**To enable:** Set `GOOGLE_MAPS_API_KEY=your_key` in `.env`. Requires the Google Maps Geocoding API enabled in your Google Cloud project.

---

## Impact on Matching Algorithm

The matching algorithm uses `lat`/`lng` to calculate proximity between a volunteer and a mission:

```
location_decay = e^(−distance_km / 15)
```

If either location has `lat=0, lng=0` (geocoding failed or not set), the distance calculation produces a near-zero score for that component. The match can still proceed using skills, interests, and availability.

To get accurate proximity matching, ensure both the volunteer profile and the mission have real geocoded coordinates.

---

## Enabling Google Maps Geocoding

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the **Geocoding API**
3. Create an API key with HTTP referrer restrictions for production
4. Add to `.env`:
   ```
   GOOGLE_MAPS_API_KEY=AIza...
   ```
