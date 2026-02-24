# Sprint S2: Educational Pages

**Status:** Planned
**Depends on:** S1 (Done)
**Estimate:** 1 session
**Element:** Fire (knowledge illumination)

---

## Vision

Transform ILOS-KNOWLEDGE markdown files into interactive HTML pages inside the dashboard SPA. Each page teaches a core ILOS concept and weaves the user's own data as living examples. This turns the dashboard from a data viewer into a learning environment — the course material that supplements tutorial videos.

---

## Architecture

### Route Structure

All educational pages nest under `#learn/`:

| Route | Tab Label | Source File | Content Type |
|-------|-----------|-------------|-------------|
| `#learn` | Learn | New | Hub page — 6 topic cards with icons, descriptions, element colors |
| `#learn/vper` | VPER Cycle | `ILOS-KNOWLEDGE/vper-cycle.md` (140 lines) | Interactive VPER wheel explainer + fractal time scales |
| `#learn/elements` | Elements | `ILOS-KNOWLEDGE/elemental-wisdom.md` (171 lines) | 4 element deep dives + self-assessment tool |
| `#learn/gap-to-gain` | Gap to Gain | `ILOS-KNOWLEDGE/gap-to-gain.md` (159 lines) | Mindset module with user's wins as evidence |
| `#learn/areas` | 12 Key Areas | `ILOS-KNOWLEDGE/aligned-goal-setting.md` + area data | Area framework with user's health scores overlaid |
| `#learn/goals` | Goal Setting | `ILOS-KNOWLEDGE/aligned-goal-setting.md` (308 lines) | Alignment chain explainer with user's goal cascade |
| `#learn/planning` | Planning Cycle | `ILOS-KNOWLEDGE/intentional-planning-cycle.md` (356 lines) | Full planning methodology with Dragon Dreaming |

### Data Shape Extension

Add to the existing DATA object:

```javascript
DATA.education = {
  // DAEDALUS converts markdown → structured sections at generation time
  vper: { sections: [{ heading, content, element }], diagram: "ascii-art" },
  elements: { sections: [...], assessment: { fire, air, earth, water } },
  gapToGain: { sections: [...], quotes: [...] },
  areas: { sections: [...], framework: [...] },
  goals: { sections: [...], alignmentChain: [...] },
  planning: { sections: [...], quotes: [...] }
};
```

### Shared UI Components

Build reusable render helpers (used across all 6 pages):

| Component | Description |
|-----------|-------------|
| `renderSection(heading, content, element)` | Collapsible content section with element-colored header |
| `renderQuoteCard(quote, attribution)` | Styled quote block with ether accent |
| `renderElementCard(element, title, body)` | Element-themed card (colored border + soft bg) |
| `renderInteractiveDiagram(type, data)` | SVG diagram renderer (reuses VPER wheel, adds new diagrams) |
| `renderUserDataOverlay(label, userData)` | Shows user's real data inline with educational content |
| `renderTabGroup(tabs)` | Tabbed interface for multi-section content |

---

## Tasks

### S2-01: Router + Learn Hub Page

**Files:** `html-template.md`

**Acceptance Criteria:**
- [ ] Router supports nested routes: `#learn`, `#learn/vper`, `#learn/elements`, etc.
- [ ] Sidebar gets a 5th nav item: "Learn" icon (◉) between Wins and the theme toggle
- [ ] `#learn` hub page renders 6 topic cards in a 2x3 grid
- [ ] Each card: icon, title, description (1 sentence), element color accent, click → navigates to topic
- [ ] Cards: VPER Cycle (Fire), Elements (Ether), Gap to Gain (Water), 12 Key Areas (Earth), Goal Setting (Air), Planning Cycle (Ether)
- [ ] Back navigation: each topic page has a "← Back to Learn" link

**Architecture Notes:**
- Extend the `ROUTES` object with `learn` + 6 sub-routes
- Router change: parse `#learn/vper` as nested → `ROUTES['learn/vper']`
- Mobile bottom bar: Learn replaces nothing — add 5th icon (scroll if needed)

---

### S2-02: VPER Cycle Page (`#learn/vper`)

**Files:** `html-template.md`, `view-specs.md`
**Source:** `ILOS-KNOWLEDGE/vper-cycle.md` (140 lines, 7 sections)

**Acceptance Criteria:**
- [ ] Large interactive VPER wheel (300px) — reuse `svgVperWheel()`, scale up, add click handlers
- [ ] Clicking a quadrant scrolls to that phase's section below
- [ ] 4 phase sections: Vision/Fire, Plan/Air, Execute/Earth, Review/Water — each with full content from source
- [ ] Alignment (Ether) section connecting all four
- [ ] Fractal Time Scales: interactive table showing Year → Quarter → Month → Week → Day with expandable rows
- [ ] Review Sequence: 6-step visual (Celebrate → Recognize → Enhance → Reflect → Redirect → Energize)
- [ ] **User data overlay:** Current VPER phase highlighted, elemental balance scores shown per element section

---

### S2-03: Elemental Wisdom Page (`#learn/elements`)

**Files:** `html-template.md`, `view-specs.md`
**Source:** `ILOS-KNOWLEDGE/elemental-wisdom.md` (171 lines, 8 sections)

**Acceptance Criteria:**
- [ ] 4 element cards at top (Fire/Air/Earth/Water) — click to expand full description
- [ ] Each expanded card shows: Principle, Psychology, VPER mapping, When Weak, When Uncontrolled
- [ ] 5th card: Ether (Alignment) — connecting element
- [ ] Opposite Pole Principle: visual showing Fire↔Water, Air↔Earth complementary pairs
- [ ] **Elemental Self-Assessment tool:** 4 sliders (1-10) for each element, generates a balance summary
- [ ] Pre-populate sliders from `DATA.vper.elementalBalance` scores
- [ ] Nature/Body/Psychology/Sacred Geometry comparison table (from source)
- [ ] **User data overlay:** Current `elementFocus` highlighted with "needs attention" styling

---

### S2-04: Gap to Gain Page (`#learn/gap-to-gain`)

**Files:** `html-template.md`, `view-specs.md`
**Source:** `ILOS-KNOWLEDGE/gap-to-gain.md` (159 lines, 9 sections)

**Acceptance Criteria:**
- [ ] Side-by-side comparison: "The Gap" (red/danger styling) vs "The Gain" (green/success styling)
- [ ] Interactive toggle/tab switching between Gap mindset and Gain mindset descriptions
- [ ] "Why This Matters" section with 3 sub-concepts (Always Start with Wins, No Failure Only Data, Detachment)
- [ ] Time Scale Application: expandable cards for Daily → Weekly → Monthly → Quarterly → Annual
- [ ] Connection to Water Element: philosophical section with element styling
- [ ] Key Quotes: 5 styled quote cards with ether accent
- [ ] **User data overlay:** Recent wins count (90d) as "evidence of the Gain" — "You've logged X wins in the last 90 days. That's the Gain."
- [ ] Win streak and weekly average as Gain metrics

---

### S2-05: Goal Setting + Planning Pages (`#learn/goals`, `#learn/areas`, `#learn/planning`)

**Files:** `html-template.md`, `view-specs.md`
**Sources:** `aligned-goal-setting.md` (308 lines), `intentional-planning-cycle.md` (356 lines)

**Acceptance Criteria:**

**`#learn/goals` — Aligned Goal Setting:**
- [ ] Alignment Chain visualization: Purpose → Vision → Goals → Projects → Systems → Daily Actions (flowchart SVG)
- [ ] Three Parts of Reviewing: Celebrating / Redirecting / Improving as tabbed sections
- [ ] Dragon Dreaming: 4-phase cycle diagram (Dream/Plan/Do/Celebrate) — SVG similar to VPER wheel
- [ ] Key Quotes: 4 quotes with commentary blocks
- [ ] **User data overlay:** User's actual goal cascade (from DATA.goals) shown inline as "Your alignment chain"

**`#learn/areas` — 12 Key Areas:**
- [ ] Framework explanation: 12 areas mapped to zodiac houses, grouped by element
- [ ] Interactive 4x3 grid — same as `#areas` page but with educational annotations per area
- [ ] Each area card: full name, house number, element, brief description of the life domain
- [ ] **User data overlay:** Health scores from DATA.areas overlaid on the framework cards

**`#learn/planning` — Intentional Planning Cycle:**
- [ ] 4-stage cycle visualization (from source)
- [ ] "How to Start Planning Your Year" as 4-step walkthrough
- [ ] Key Principles section (6 core differentiators from source)
- [ ] Cycles of Time: nested timeline (Year → Quarter → Month → Week → Day)
- [ ] **User data overlay:** Last review dates from `DATA.vper` shown in timeline

---

## SKILL.md Changes

Minor update to Step 2 (Fetch data):
- Add: Read all `ILOS-KNOWLEDGE/*.md` files
- Add: Parse markdown into `DATA.education` sections (heading/content pairs)
- Add: Extract quotes from markdown (lines starting with `>`)

---

## Verification

1. Navigate to `#learn` → 6 topic cards render with correct element colors
2. Click each card → navigates to the correct topic page
3. Each topic page renders full content from the source markdown
4. VPER wheel on `#learn/vper` is interactive (click quadrants)
5. Elemental assessment sliders on `#learn/elements` pre-populate from user data
6. Gap to Gain page shows user's actual win count as Gain evidence
7. Goal Setting page shows user's real goal cascade inline
8. All pages respect dark/light mode
9. Mobile: pages stack vertically, diagrams scale down
10. "← Back to Learn" link works from every topic page
