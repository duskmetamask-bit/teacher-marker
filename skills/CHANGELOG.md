# Skills Changelog — PickleNickAI

**Purpose:** Version history when skills are updated. When a skill is improved, log it here.

**Rule:** Any time a skill file is modified, append an entry to this log with: date, skill name, what changed, why, who verified it.

---

## 2026-04-21 — Initial Build (v1.0)

All 19 skills built and committed to vault.

| Skill | Size | Status | Built by |
|-------|------|--------|----------|
| pickle-teaching | ~32KB | v1.0 | Yuki (subagent) |
| pickle-education | ~30KB | v1.0 | Yuki (subagent) |
| pickle-marking | ~28KB | v1.0 | Yuki (subagent) |
| pickle-writing | ~32KB | v1.0 | Yuki (subagent) |
| pickle-maths | ~36KB | v1.0 | Yuki (subagent) |
| pickle-product | ~10KB | v1.0 | Yuki |
| pickle-assessment | ~16KB | v1.0 | Yuki (subagent) |
| pickle-differentiation | ~20KB | v1.0 | Yuki (subagent) |
| pickle-resources | ~10KB | v1.0 | Yuki (subagent) |
| pickle-science | ~15KB | v1.0 | Yuki (subagent) |
| pickle-hass | ~18KB | v1.0 | Yuki (subagent) |
| pickle-technologies | ~21KB | v1.0 | Yuki (subagent) |
| pickle-arts | ~12KB | v1.0 | Yuki (subagent) |
| pickle-wellbeing | ~27KB | v1.0 | Yuki (subagent) |
| pickle-parent | ~15KB | v1.0 | Yuki (subagent) |
| pickle-behaviour | ~17KB | v1.0 | Yuki (subagent) |
| pickle-legal | ~12KB | v1.0 | Yuki (subagent) |
| pickle-standards | ~14KB | v1.0 | Yuki (subagent) |
| pickle-reporting | ~10KB | v1.0 | Yuki (subagent) |

**Skill loader system:** Built by Claude Code (commit `fd0732a`)
- `lib/skills/registry.ts` — 19 skills + classifyMessage()
- `lib/skills/loader.ts` — SkillLoader class, 5-min vault cache
- `lib/skills/builder.ts` — buildSystemPrompt()
- `lib/curriculum/validator.ts` — AC9 code validator

---

## Future Updates

Add entries below as skills are improved:

```
### YYYY-MM-DD — v1.X → v1.Y
**Skill:** pickle-[name]
**What changed:** 
**Why:** 
**Verified by:** 
**Test result:** 
```

---

*Document owner: Yuki*
