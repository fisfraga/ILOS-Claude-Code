# Getting Started with ILOS

Welcome to the Intentional Life OS. This guide walks you through the essential setup in about 30 minutes. You do not need to complete everything at once -- each step builds on the last, and you can return to deepen any section later.

---

## Step 1: Fill Your Personal Context (15 minutes)

Start with the files that feel most natural to you. The order below is a suggestion, not a requirement.

**Start here:**
1. Open `QUANTUM/personal-context/8-identity-values.md` -- Write your core values and how you see yourself
2. Open `QUANTUM/personal-context/7-life-stage.md` -- Describe your current season of life
3. Open `QUANTUM/personal-context/1-routines-and-habits.md` -- Document your actual daily rhythm

**Then, when you have time:**
4. Fill in the remaining personal context files (2-6) at your own pace
5. Start `QUANTUM/personal-context/0-life-vision-manifesto.md` -- This is the deepest one, and it is okay if it takes time to emerge

The more context you provide, the more personalized your AI coaching becomes. But even a few files make a significant difference.

---

## Step 2: Set Your Goals (10 minutes)

Open `TIME/active-goals.yaml` and replace the example goals with your own.

**Rules:**
- Maximum 3 goals per time scale (this is non-negotiable -- Extreme Prioritization)
- Start with weekly goals if you are new to the system
- Connect each goal to one of the 12 Key Areas
- If you have annual or quarterly goals, set those too

Do not overthink this. Goals are directions, not commitments to perfection. You will adjust them during reviews.

---

## Step 3: Capture Your First Win (2 minutes)

Open `MEMORY/wins.jsonl` and add your first win after the schema line:

```json
{"id": "win_20260101_120000", "date": "2026-01-01", "description": "Set up my Intentional Life OS", "area": "vision", "source": "setup"}
```

This is the beginning of your Gain log. Every win you capture compounds into evidence of your capability. Start small. Start now.

---

## Step 4: Try a Review (20-30 minutes)

The weekly review is the heartbeat of ILOS. Even if you have only been using the system for a day, try running through the template:

1. Open `TIME/templates/weekly-review.md`
2. Follow the VPER Review Sequence: Celebrate > Recognize > Enhance > Reflect > Redirect > Energize
3. Set 3 goals for next week

If you are using Claude Code with PARACELSUS, you can simply say "let's do a weekly review" and the AI will guide you through the process.

---

## Step 5 (Optional): Configure Tana MCP

Tana integration is **entirely optional**. ILOS works fully with just local files and Claude Code. However, if you use Tana, the MCP integration enables powerful bidirectional data flow — Claude can read your live goals, create wins, mark goals complete, and navigate your workspace directly.

**Prerequisites:**
- You have a Tana workspace with the ILOS supertag structure installed (see Tana documentation)
- The Tana MCP local server is running and configured in Claude Code

**To set up the integration (5 minutes):**

1. Confirm the MCP server is running — type `/tana` and see if Claude can list your workspaces
2. Type `/tana-understand` — Claude will detect that your reference files are empty and automatically explore your workspace
3. Claude will populate `SYSTEM/tana-reference/tag-ids.md`, `field-ids.md`, and `structure-map.md` with your real IDs
4. All future `/tana`, `/win`, `/morning`, and review skills will use these IDs automatically

**Important MCP constraint:**
The Tana MCP local server only supports one operation at a time. Claude handles this automatically — you don't need to do anything, but if you see errors about "transport already connected," this is why.

See `SYSTEM/tana-reference/README.md` for details on what each reference file contains.

---

## What to Do Next

After initial setup, the rhythm is simple:

1. **Daily:** Check your weekly goals. Take aligned action. Optionally capture gratitude.
2. **Weekly:** Run a weekly review (20-30 min). This is the most important habit.
3. **Monthly:** Run a monthly review (30-60 min). Check elemental balance.
4. **Quarterly:** Run a quarterly review (1-2 hrs). Reconnect with vision. Update personal context.
5. **Annually:** Run an annual review (3+ hrs). Full life audit. Next year visioning.

Start with just the weekly review. Add other cycles as the habit strengthens.

---

## The 80/20 of ILOS

If you do nothing else, do these two things every week:

1. **Set 3 goals** at the start of the week
2. **List your wins** at the end of the week

This is the core of the system. Everything else builds on this foundation.
