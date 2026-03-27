# RASA Platform — Matchmaking Algorithm

## Overview

The discovery system ranks missions for a volunteer (or ranks volunteers for a mission) using a weighted scoring algorithm. Higher scores mean better matches.

**File:** `modules/discovery/matching.ts`

---

## Score Formula

```
MatchScore = 0.35 × skill_coverage
           + 0.25 × interest_alignment
           + 0.25 × location_decay
           + 0.15 × availability_overlap
```

All components produce values in `[0, 1]`. The final score is also in `[0, 1]`.

---

## Components

### 1. Skill Coverage (weight: 0.35)

Measures how many required mission skills the volunteer has.

Uses **Jaccard similarity** (intersection / union):

```
skill_coverage = |volunteer.skills ∩ mission.skills| / |volunteer.skills ∪ mission.skills|
```

If the mission requires no skills, this component returns `1.0` (any volunteer is suitable).

---

### 2. Interest Alignment (weight: 0.25)

Measures how well the volunteer's interests match the mission's categories.

Same Jaccard similarity as skills:

```
interest_alignment = |volunteer.interests ∩ mission.interests| / |volunteer.interests ∪ mission.interests|
```

If the mission has no interest categories, this returns `1.0`.

---

### 3. Location Decay (weight: 0.25)

Measures proximity between volunteer and mission. Uses an exponential decay function that gives full score at 0 km and decays to ~0 at large distances.

```
distance_km = haversine(volunteer.lat, volunteer.lng, mission.lat, mission.lng)
location_decay = e^(−distance_km / 15)
```

The decay constant `15` means:
- 0 km → score ≈ 1.0
- 10 km → score ≈ 0.51
- 15 km → score ≈ 0.37
- 30 km → score ≈ 0.14

If either lat/lng is `0,0` (geocoding not configured), the score will be near `0` for this component but the match still proceeds.

---

### 4. Availability Overlap (weight: 0.15)

Measures whether the volunteer's availability windows overlap with the mission schedule.

The mission's schedule defines a day-of-week and time range. The algorithm checks if the volunteer has any availability slot on that day with a time window overlapping the mission's start-end times.

```
availability_overlap = 1 if any slot overlaps, else 0
```

(Currently binary — either there's overlap or there isn't. Can be extended to partial overlap in future.)

---

## Usage

### Discovery page (volunteer → missions)

`GET /api/discovery` calls `modules/discovery/service.ts` which:
1. Fetches the volunteer's profile
2. Fetches open missions (optionally filtered by city)
3. Scores each mission against the volunteer profile
4. Returns missions sorted by score descending

### Application page (ngo_admin → applicants)

When reviewing applications, `matchScore` is stored on each application at apply-time. The application list is sorted by `matchScore` descending so the best-fit volunteers appear first.

---

## Tuning

The weights can be adjusted in `modules/discovery/matching.ts`:

```typescript
const WEIGHTS = {
  skills:        0.35,
  interests:     0.25,
  location:      0.25,
  availability:  0.15,
}
```

Ensure weights always sum to `1.0`.
