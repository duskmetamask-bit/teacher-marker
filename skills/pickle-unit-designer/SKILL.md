# PickleNickAI — Unit Page Designer Skill

## Purpose
Produce professional, print-ready unit page outputs for PickleNickAI. Every unit page must look like it was designed by a premium SaaS product — Notion meets government design system meets Stripe.

## Trigger
Use this skill when:
- Building a new unit page for PickleNickAI
- Rebuilding an existing unit with updated design
- Creating any teaching resource webpage

## How to Use

### Step 1 — Read the Design System First
Read these files before starting any unit page:
- `vault/shared/PROJECTS/ezy-teach/design-system/PICKLENICKAI-DESIGN-SYSTEM.md` — the rules
- `vault/shared/PROJECTS/ezy-teach/design-system/styles.css` — the CSS
- `vault/shared/PROJECTS/ezy-teach/design-system/base-template.html` — the HTML scaffold

### Step 2 — Gather Unit Content
Collect:
- Subject, year level, duration (weeks × lessons)
- Curriculum codes (AC v9)
- Mentor text (book title + description)
- Learning intention + success criteria (4-6 items)
- 8-week structure (lesson titles, week themes)
- Cold task + Hot task descriptions
- Rubric (criterion × A-E grades)
- Differentiation notes (EAL, gifted, NEP)

### Step 3 — Fill the Template
Copy `base-template.html` and fill every section:
- Page header (badges, title, subtitle, mentor text)
- Meta grid (6 items)
- Success criteria (4-6 items)
- Cold task card
- Week summary table (8 rows)
- Hot task card
- 8 week sections × 3 lessons
- Rubric table (5 grades, 4-6 criteria)
- Differentiation grid (3 columns)

### Step 4 — CSS Integration
The HTML must:
- Import `styles.css` from the design-system folder
- Use ONLY CSS variables defined in `styles.css`
- No inline styles except for one-off colors
- No hardcoded color values

### Step 5 — Quality Checklist
Before deploying, verify:
- [ ] No emojis anywhere
- [ ] All content from the template — no placeholders
- [ ] All table cells populated (no empty cells)
- [ ] Lesson types correct: explicit/guided/independent/assessment
- [ ] Cold task = green left border, Hot task = red left border
- [ ] Week headers use accent gradient
- [ ] Rubric grade colors: A=green, B=blue, C=amber, D=orange, E=red
- [ ] Responsive at 900px max-width
- [ ] Print styles included

### Step 6 — Deploy to Vercel
```bash
mkdir -p /tmp/[unit-name]
cp [unit-name].html /tmp/[unit-name]/index.html
echo '{"version":2,"routes":[{"src":"/(.*)","dest":"/index.html"}]}' > /tmp/[unit-name]/vercel.json
cd /tmp/[unit-name] && VERCEL_TOKEN=[REDACTED] npx vercel --yes --prod
```

### Step 7 — Log the Output
After deploying:
- Save HTML to: `vault/shared/PROJECTS/ezy-teach/units/[unit-name]/[unit-name].html`
- Save markdown to: `vault/shared/PROJECTS/ezy-teach/units/[unit-name]/[unit-name]-POLISHED.md`
- Post live URL to Discord #builds
- Log in decisions-log.md

## Design Rules

**Never:**
- Use emojis in any output
- Use decorative illustrations
- Use more than 2 font weights
- Use bright or clashing colors
- Leave table cells empty
- Use placeholder text

**Always:**
- Structure creates hierarchy (not decoration)
- Typography does the work
- Whitespace between sections
- Color-coded elements (green=cold, red=hot, teal=accent)
- Professional badges for metadata
- Consistent component patterns

## File Locations

| File | Path |
|------|------|
| Design System Spec | `vault/shared/PROJECTS/ezy-teach/design-system/PICKLENICKAI-DESIGN-SYSTEM.md` |
| CSS | `vault/shared/PROJECTS/ezy-teach/design-system/styles.css` |
| Base Template | `vault/shared/PROJECTS/ezy-teach/design-system/base-template.html` |
| Output Directory | `vault/shared/PROJECTS/ezy-teach/units/` |

## Output Requirements

Every unit page must include:
1. Professional header with metadata badges
2. Learning intention + success criteria
3. Cold task card (pre-assessment)
4. 8-week overview table
5. Hot task card (post-assessment)
6. 8 week sections with 3 lesson cards each
7. Full A-E rubric with curriculum codes
8. Differentiation grid (EAL / Gifted / NEP)
9. Footer with curriculum info

**No exceptions.** Every unit, every time.
