# Sprint S3: Transit Integration + Cosmic Blueprint Teasers

**Status:** Done
**Depends on:** S1 (Done), S2 (recommended but not blocking)
**Estimate:** 1-2 sessions
**Element:** Fire → Earth (vision made tangible)

---

## Vision

Connect cosmic transits to the ILOS life system. Show the user which VPER phase the cosmos is activating, which life areas are energized by current planetary positions, and what the elemental weather looks like today — all computed at dashboard generation time by DAEDALUS. The Cosmic Blueprint teaser provides a taste of the full astrology experience as an upsell path.

---

## Architecture

### Two Approaches (Architecture Decision)

**Option A — DAEDALUS computes transits at generation time (Recommended for MVP)**

DAEDALUS reimplements key functions from `cosmic-blueprint/src/services/ilos.ts` and `transits.ts` as part of the data computation step. Transit positions are calculated using simplified ephemeris logic (or pre-computed tables) and injected into the DATA object. No external API needed.

**Advantages:** Zero dependencies, works offline, consistent with ILOS philosophy.
**Trade-off:** Ephemeris accuracy limited without astronomy-engine library. Acceptable for VPER phase detection (only needs sign-level accuracy, not degree-level).

**Option B — Call Cosmic Blueprint API**

DAEDALUS fetches transit data from a running Cosmic Blueprint backend.

**Advantages:** Full accuracy, aspect calculations, interpretation strings.
**Trade-off:** Requires CB backend running, breaks zero-dependency principle for generation.

**Decision:** Start with **Option A** (sign-level accuracy from simplified ephemeris). Upgrade to Option B when CB API is available.

### Simplified Ephemeris Strategy

For VPER phase and area activation, we only need to know which **sign** each planet is in (not exact degree). This can be approximated with:

1. **Sun:** Predictable — moves ~1°/day, ~30 days per sign. A static lookup table by date range covers this perfectly.
2. **Moon:** Fast-moving (~13°/day, 2.5 days per sign). Use a simplified calculation or skip for MVP.
3. **Slow planets (Jupiter, Saturn, Uranus, Neptune, Pluto):** Change signs rarely. A yearly lookup table suffices.
4. **Personal planets (Mercury, Venus, Mars):** More variable. Use approximate monthly positions or skip for MVP.

**MVP scope:** Sun sign (always accurate) + slow planet signs (yearly table) = sufficient for VPER phase summary and area activation.

### Route Structure

| Route | Tab Label | Content |
|-------|-----------|---------|
| `#transits` | Transits | Current cosmic weather → VPER phase activation → life area energies |
| `#cosmic-teaser` | Cosmic Blueprint | Element/sign summary + "Get your full Cosmic Blueprint" CTA |

### Data Shape Extension

```javascript
DATA.transits = {
  date: "2026-02-23",
  sunSign: "pisces",
  sunElement: "water",
  sunVperPhase: "review",

  // Slow planet positions (updated yearly or monthly)
  slowPlanets: [
    { name: "Jupiter", sign: "cancer", element: "water", vperPhase: "review" },
    { name: "Saturn", sign: "pisces", element: "water", vperPhase: "review" },
    { name: "Uranus", sign: "gemini", element: "air", vperPhase: "plan" },
    { name: "Neptune", sign: "aries", element: "fire", vperPhase: "vision" },
    { name: "Pluto", sign: "aquarius", element: "air", vperPhase: "plan" }
  ],

  // Computed summary
  cosmicVper: {
    dominantPhase: "review",         // most planets in this phase
    phaseCounts: { vision: 1, plan: 2, execute: 0, review: 3 },
    activeAreas: [
      { houseNum: 12, areaName: "Spiritual & Transcendence", planet: "Sun", element: "water" },
      { houseNum: 4, areaName: "Home & Foundation", planet: "Jupiter", element: "water" }
    ]
  },

  moonPhase: {
    name: "Waning Crescent",
    emoji: "🌘",
    illumination: 15,
    element: "water",                // waning = review/release energy
    guidance: "Release and reflect before the next cycle begins"
  },

  elementalWeather: {
    fire: 1,   // count of planets in fire signs
    air: 2,
    earth: 0,
    water: 3,
    dominant: "water",
    weakest: "earth",
    summary: "Heavy Water energy — ideal for review and emotional processing"
  }
};

DATA.cosmicTeaser = {
  // Simplified profile teaser (if birth data available in QUANTUM/)
  hasBirthData: true,
  sunSign: "libra",
  sunElement: "air",
  dominantElement: "water",
  ctaUrl: "https://cosmicblueprint.app",      // or null
  ctaText: "Explore your full Cosmic Blueprint"
};
```

### Functions to Reimplement (Inline JS)

From `cosmic-blueprint/src/services/ilos.ts`:

| Function | Complexity | S3 Priority |
|----------|-----------|-------------|
| `ILOS_KEY_AREAS` (constant) | Trivial — copy directly | Must have |
| `SIGN_TO_HOUSE` (constant) | Trivial — copy directly | Must have |
| `VPER_CONFIG` (constant) | Trivial — copy directly | Must have |
| `getKeyAreaName(houseNum)` | Trivial — array lookup | Must have |
| `getCosmicVperSummary(positions)` | Moderate — sign lookup + aggregation | Must have |
| `calculateElementalBalance(placements)` | Moderate — element counting | Should have |

**Not reimplemented (deferred):**
- Full ephemeris (`getPlanetaryPositions`) — replaced by static lookup tables
- Aspect calculations (`calculateAspects`) — requires degree-level accuracy
- Transit interpretations (120 planet×sign strings) — deferred to S3.5

### Static Lookup Tables (New)

Create a reference file for DAEDALUS to use when computing transit data:

**`SYSTEM/transit-data/sign-calendar.yaml`** — Sun sign date ranges (perpetual):
```yaml
aries:     { start: "03-21", end: "04-19", element: fire, vperPhase: vision }
taurus:    { start: "04-20", end: "05-20", element: earth, vperPhase: execute }
# ... all 12 signs
```

**`SYSTEM/transit-data/slow-planets-2026.yaml`** — Slow planet sign positions by month:
```yaml
jupiter:
  2026-01: { sign: cancer, element: water }
  2026-02: { sign: cancer, element: water }
  # ... 12 months
saturn:
  2026-01: { sign: pisces, element: water }
  # ...
```

---

## Tasks

### S3-01: Transit Data Infrastructure

**Files:** New `SYSTEM/transit-data/` directory, `view-specs.md`

**Acceptance Criteria:**
- [ ] Create `SYSTEM/transit-data/sign-calendar.yaml` — all 12 sign date ranges with element + vperPhase
- [ ] Create `SYSTEM/transit-data/slow-planets-2026.yaml` — Jupiter, Saturn, Uranus, Neptune, Pluto positions by month for 2026
- [ ] Create `SYSTEM/transit-data/moon-phases-2026.yaml` — New/Full Moon dates for 2026 (24 entries)
- [ ] Document the transit data shape in `view-specs.md`
- [ ] Document the simplified ephemeris strategy (sign-level, not degree-level)

---

### S3-02: DAEDALUS Transit Computation

**Files:** `SKILL.md`, `view-specs.md`

**Acceptance Criteria:**
- [ ] SKILL.md Step 2 extended: "Compute transit data" — read sign-calendar + slow-planets YAML, determine current Sun sign + slow planet positions
- [ ] Compute `cosmicVper`: count planets per VPER phase, find dominant phase, list active areas
- [ ] Compute `elementalWeather`: count planets per element, find dominant/weakest, generate summary string
- [ ] Compute `moonPhase`: lookup nearest New/Full Moon date, determine 8-phase name + illumination estimate
- [ ] All computations documented in `view-specs.md` with clear formulas

---

### S3-03: Inline JS — ILOS Constants + VPER Summary

**Files:** `html-template.md`

**Acceptance Criteria:**
- [ ] Add `ILOS_KEY_AREAS` constant (12 house→area mappings) to template JS
- [ ] Add `SIGN_TO_HOUSE` constant (12 sign→house natural mappings)
- [ ] Add `SIGN_ELEMENT` constant (12 sign→element mappings)
- [ ] Add `SIGN_VPER` constant (12 sign→vperPhase mappings)
- [ ] Implement `getCosmicVperSummary(positions)` — takes planet positions array, returns { dominantPhase, phaseCounts, activeAreas }
- [ ] Implement `getElementalWeather(positions)` — returns element distribution + summary

---

### S3-04: Transits Page (`#transits`)

**Files:** `html-template.md`

**Acceptance Criteria:**
- [ ] New route `#transits` with sidebar nav icon (☽ or similar)
- [ ] **Cosmic VPER Section:** Large VPER wheel showing cosmic activation (reuse `svgVperWheel` with transit-dominant phase instead of user-set phase). Label: "The cosmos is currently in [Phase] mode"
- [ ] **Elemental Weather Bar:** Horizontal stacked bar showing planetary element distribution (reuse `svgElementalBar` with transit counts)
- [ ] **Active Areas List:** Which life areas are being activated by current transits. Each area card shows: area name, activating planet, element color
- [ ] **Moon Phase Widget:** Current moon phase emoji + name + illumination % + guidance text
- [ ] **Slow Planet Table:** 5 rows showing Jupiter/Saturn/Uranus/Neptune/Pluto with current sign, element badge, VPER phase badge
- [ ] **Cosmic vs Personal:** Side-by-side comparison of cosmic VPER phase vs user's self-assessed VPER phase (from `DATA.vper.phase`). Alignment or tension indicator.
- [ ] Fallback: If no transit data available, show "Transit data not configured. Run `/dashboard` to generate."

---

### S3-05: Cosmic Blueprint Teaser Page (`#cosmic-teaser`)

**Files:** `html-template.md`

**Acceptance Criteria:**
- [ ] New route `#cosmic-teaser` with sidebar nav icon (✧)
- [ ] **Element Profile Card:** If birth data exists in `QUANTUM/self-knowledge/`, show Sun sign + dominant element + brief description
- [ ] **Elemental Balance Radar:** SVG showing the user's natal elemental balance (if available) — Fire/Air/Earth/Water proportions
- [ ] **"What Your Chart Reveals" section:** 3 teaser cards — "Your Life Purpose Path", "Your Energy Type", "Your Transformation Keys" — each with a lock icon and brief description
- [ ] **CTA Button:** "Explore your full Cosmic Blueprint" → links to `DATA.cosmicTeaser.ctaUrl` or shows "Coming soon"
- [ ] **ILOS Connection:** "Your cosmic profile connects to your 12 Key Areas. Each transit activates specific life domains."
- [ ] Fallback: If no birth data, show "Add your birth data to QUANTUM/self-knowledge/ to unlock cosmic insights"

---

### S3-06: Dashboard Integration

**Files:** `html-template.md`

**Acceptance Criteria:**
- [ ] `#dashboard` page: Add a "Cosmic Weather" mini-card in the top row (alongside VPER wheel + elemental balance)
- [ ] Mini-card shows: Moon phase emoji, Sun sign, cosmic dominant phase, 1-line summary
- [ ] Click mini-card → navigates to `#transits`
- [ ] VPER wheel on dashboard now shows TWO rings: inner = user's phase (existing), outer = cosmic phase (new, thinner)

---

## Verification

1. Generate dashboard → `#transits` page shows current Sun sign correctly for today's date
2. Slow planet positions match known 2026 ephemeris (verify Jupiter in Cancer, Saturn in Pisces, etc.)
3. Cosmic VPER summary correctly counts phases and identifies dominant
4. Moon phase widget shows reasonable phase for current date
5. Cosmic vs Personal comparison renders both phases side by side
6. `#cosmic-teaser` shows CTA button and teaser cards
7. Dashboard mini-card shows cosmic weather and links to `#transits`
8. All transit elements respect dark/light mode and element color scheme
9. If transit data files are missing, pages degrade gracefully with informative message
