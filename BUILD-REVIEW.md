# PickleNickAI Build — Post-Mortem & Quality Review
**Date**: 2026-04-21
**Status**: Deployed at https://pickle-nick-ai.vercel.app

---

## What Was Built

### Core App (`/picklenickai`)
- **7 tabs**: Chat (hero) | Library | Curriculum | Frameworks | Assessments | Admin | Profile
- Premium dark-mode AI aesthetic (deep navy `#0d0f1a`, indigo primary `#6366f1`, cyan accent `#22d3ee`)
- Streaming SSE chat with progressive markdown render via `StreamingDiv` + `useRef.innerHTML`
- Responsive sidebar with mobile hamburger

### Tabs Built
| Tab | Component | Status |
|----|----------|--------|
| Chat | `ChatTab.tsx` | Complete — streaming, suggested prompts, gradient bubbles |
| Library | `LibraryTab.tsx` | Complete — filter bar, unit cards, detail panel |
| Curriculum | `CurriculumTab.tsx` | Complete — AC9 subject/year browser |
| Frameworks | `FrameworksTab.tsx` | Complete — WIEP/5E/Gradual Release/DI/Inquiry |
| Assessments | `AssessmentsTab.tsx` | Complete — AI Rubric Builder |
| Admin | `AdminTab.tsx` | Complete — Meeting Notes, Parent Comms, PD Log |
| Profile | `ProfileTab.tsx` | Existing |

### API Routes
- `/api/chat` — streaming chat with OpenAI
- `/api/generate` — lesson plan generation
- `/api/grade` — student work grading
- `/api/rubric` — AI A-E rubric generation (GPT-4o-mini, 2000 tokens)
- `/api/library/units` — units index with filtering (subject/year/framework/status/search)
- `/api/library/curriculum` — curriculum index
- `/api/library/frameworks` — frameworks index

### Data Layer
- `data/units/index.json` — 6 seed units (maths-fractions, science-ecosystems, english-narrative, etc.)
- `data/curriculum/index.json` — 8 AC9 subjects with strands, year levels, cross-curriculum
- `data/frameworks/index.json` — 5 frameworks (WIEP, 5E, Gradual Release, Direct Instruction, Inquiry-Based)
- `scripts/sync-vault.ts` — vault sync script (not yet tested with real vault)

### Design System
- `lib/design.ts` — centralized: `C` colors, `SUBJECT_COLORS`, `sp` (spacing), `radius`, `shadows`, `transition`

---

## Quality Review

### Strengths
1. **Streaming markdown pattern** — `useRef.innerHTML` approach avoided `dangerouslySetInnerHTML` TS issues cleanly
2. **Design system extraction** — `lib/design.ts` means all components use consistent tokens
3. **Seed data included** — all 3 library tabs work immediately without vault sync
4. **Mobile responsive** — sidebar collapses to hamburger on mobile, CSS media queries handle correctly
5. **Proper tab type** — `TabId` union type propagated correctly through Sidebar → Page → all components
6. **Clean TypeScript** — no type errors in final build, all routes properly typed

### Weaknesses
1. **No error boundaries** — API failures will crash the page silently
2. **No loading skeletons** — LibraryTab shows plain "Loading..." text, not skeleton cards
3. **Rubric parser is fragile** — simple regex/text parsing for rubric criteria, no structured parsing
4. **Root page (`/`) not updated** — still uses old design, doesn't match premium aesthetic of `/picklenickai`
5. **Chat has no library context injection** — AI doesn't get unit/framework context when responding
6. **No inline unit preview cards** — when AI mentions a unit, no clickable preview card shows
7. **Supabase profile persistence missing** — only localStorage on deployed version
8. **`OPENAI_API_KEY` is placeholder on Vercel** — needs real key set via `vercel env add`
9. **`scripts/sync-vault.ts` untested** — never run against real vault path

### Security / Production Concerns
- `OPENAI_API_KEY` is `sk-build-placeholder` on Vercel — needs real key
- No rate limiting on API routes
- No input sanitization on chat messages
- `lib/agent.ts` loads vault skills from local FS path — won't exist on Vercel (but fallback returns placeholder text)

---

## Vercel Deployment Post-Mortem

### Root Causes of Deployment Failures
1. Created `vercel.json.ts` with `@vercel/config/v1` import — package not installed → TypeScript error → build failed
2. Next.js picks wrong workspace root when multiple `package-lock.json` exist — caused `outputFileTracingRoot` warning
3. Vercel build requires `OPENAI_API_KEY` env var to exist (even as placeholder) because `lib/agent.ts` imports OpenAI at module level

### What Worked
```bash
# Install @vercel/config first if using vercel.json.ts
npm install @vercel/config

# Or delete vercel.json.ts and deploy via CLI directly:
vercel deploy --prod --token TOKEN --scope duskmetamask-bits-projects

# Vercel builds on their servers — env vars must exist there
```

### Key Commands
```bash
# Deploy to preview
~/.npm-global/bin/vercel deploy --token <VERCEL_TOKEN> --scope duskmetamask-bits-projects

# Deploy to production
~/.npm-global/bin/vercel deploy --prod --token <VERCEL_TOKEN> --scope duskmetamask-bits-projects

# Set env var on Vercel (when CLI works interactively)
vercel env add OPENAI_API_KEY production

# Check deployments
vercel list pickle-nick-ai --token TOKEN --scope duskmetamask-bits-projects
```

---

## Next Session Priorities

1. **Fix root page** — update `app/page.tsx` to match premium aesthetic
2. **Add error boundaries** — wrap API routes and tab components with error UI
3. **Set real `OPENAI_API_KEY`** on Vercel via dashboard
4. **Test `scripts/sync-vault.ts`** — run against real vault path
5. **Add loading skeletons** to LibraryTab
6. **Inline unit preview cards** in ChatTab when AI references units
7. **Library context injection** — feed relevant units/frameworks into chat context

---

## Skills to Invoke Next Time (Vercel / Next.js builds)

| Skill | When to Use |
|-------|-------------|
| `vercel:nextjs` | Next.js App Router patterns, route handlers, RSC boundaries |
| `vercel:vercel-cli` | Deploy commands, env var management, project linking |
| `vercel:env-vars` | Setting/managing env vars before deploy (avoided pain here) |
| `vercel:ai-sdk` | Streaming chat, LLM integration, structured output |
| `vercel:vercel-functions` | Edge vs Node runtime for API routes |
| `vercel:verification` | End-to-end verification after deploy |
| `vercel:react-best-practices` | React component review for TSX changes |
