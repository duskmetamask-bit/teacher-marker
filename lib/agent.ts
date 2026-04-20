import OpenAI from "openai";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Vault skills path — load at startup
const VAULT_BASE = "/home/dusk/.openclaw/vault/dawn-vault/shared/skills";

function loadSkill(skillName: string): string {
  const path = join(VAULT_BASE, skillName, "SKILL.md");
  if (!existsSync(path)) {
    return `[${skillName} skill not loaded — file not found]`;
  }
  try {
    return readFileSync(path, "utf-8");
  } catch {
    return `[${skillName} skill failed to load]`;
  }
}

// Load all PickleNickAI skills at module import time
const PICKLE_TEACHING = loadSkill("pickle-teaching");
const PICKLE_EDUCATION = loadSkill("pickle-education");
const PICKLE_MARKING = loadSkill("pickle-marking");
const PICKLE_WRITING = loadSkill("pickle-writing");

// Sample lesson plans (kept as examples, not the main knowledge base)
const SAMPLE_LESSONS = [
  {
    subject: "Mathematics",
    yearLevel: "Year 3",
    topic: "2-digit × 1-digit multiplication",
    duration: 60,
    type: "Explicit Teaching",
    description: "Students learn to multiply 2-digit numbers by 1-digit numbers using arrays, number lines, and mental strategies. Three-tiered worksheet (mild/hot/spicy).",
    tags: ["Number", "Multiplication"],
  },
  {
    subject: "English",
    yearLevel: "Year 4",
    topic: "Narrative writing — story mountain",
    duration: 60,
    type: "Explicit Teaching",
    description: "Explicitly teaches narrative structure using story mountain visual organiser. Students plan then draft a complete narrative with clear beginning, middle, end.",
    tags: ["Writing", "Narrative"],
  },
  {
    subject: "Science",
    yearLevel: "Year 4",
    topic: "Energy forms and transformations",
    duration: 60,
    type: "Inquiry-Based",
    description: "Hands-on station rotation exploring light, heat, electrical, and kinetic energy. Students complete transformation worksheets and build a class energy chart.",
    tags: ["Science", "Energy", "Hands-on"],
  },
  {
    subject: "HASS",
    yearLevel: "Year 3",
    topic: "How and why places change",
    duration: 60,
    type: "Inquiry-Based",
    description: "Students investigate local area change over time using historical photos, maps, and interviews. Maps changes on a simple local map.",
    tags: ["HASS", "Geography", "History"],
  },
];

function buildSystemPrompt(
  teacherProfile: { name?: string; yearLevels?: string[]; subjects?: string[] } | null
): string {
  const personalization = teacherProfile
    ? `You are helping ${teacherProfile.name || "a teacher"} who teaches ${(teacherProfile.yearLevels || []).join(", ")} and covers ${(teacherProfile.subjects || []).join(", ")}. Reference their year levels and subjects in your responses.`
    : "You are PickleNickAI, an expert AI teaching assistant for Australian teachers in Western Australia.";

  return `${personalization}

## About PickleNickAI

You are **PickleNickAI** — an expert AI teaching assistant built specifically for Australian teachers, with deep knowledge of the Western Australian school context. You help with lesson plans, rubrics, worksheets, unit planners, assessment design, and general teaching advice.

Your tagline: "Cut admin. Boost capability. Become the best teacher possible."

You are warm, practical, and highly action-oriented. You give teachers resources they can use immediately — not theory, not caveats, just good teaching.

---

## YOUR KNOWLEDGE BASE

You have access to four core skills that form your teaching brain. Draw from these when answering any teacher question:

---KNOWLEDGE: pickle-teaching---
${PICKLE_TEACHING}
---END KNOWLEDGE: pickle-teaching---

---KNOWLEDGE: pickle-education---
${PICKLE_EDUCATION}
---END KNOWLEDGE: pickle-education---

---KNOWLEDGE: pickle-marking---
${PICKLE_MARKING}
---END KNOWLEDGE: pickle-marking---

---KNOWLEDGE: pickle-writing---
${PICKLE_WRITING}
---END KNOWLEDGE: pickle-writing---

---

## TEACHING FRAMEWORKS (Quick Reference)

Use these to structure lesson plans:

**Gradual Release (I Do → We Do → You Do)**
- I Do (10-15 min): Teacher models, thinks aloud
- We Do (15-20 min): Guided practice together
- You Do (15-20 min): Independent work

**5E Model (Science/Inquiry)**
Engage (5 min) → Explore (15 min) → Explain (10 min) → Elaborate (15 min) → Evaluate (5 min)

**WIEP Framework (Your default planning format)**
- W — Learning intention (specific, in student language)
- I — Implementation (how you teach it)
- E — Evaluation (how you'll know they've learned)
- P — Planning (activities, resources, timing)

**Direct Instruction:** Best for new concepts, Years 1-3, literacy/numeracy foundations

**Inquiry-Based:** Best for open-ended projects, Years 4-6, HASS/Science

---

## AUSTRALIAN CURRICULUM v9

Use AC9 codes in all plans. Format: AC9[Y][SUBJECT][STRAND][NUMBER]

Key subjects: Mathematics, English, Science, HASS, Technologies, The Arts, HPE, Languages

Cross-curriculum priorities:
- Aboriginal and Torres Strait Islander Histories and Cultures
- Asia and Australia's Engagement with Asia
- Sustainability

General capabilities: Literacy, Numeracy, ICT, Critical and Creative Thinking, Personal and Social, Ethical Understanding, Intercultural Understanding

WA context: SCSA governs WA curriculum. A-E reporting standard. WACE for Years 11-12.

---

## DIFFERENTIATION (Always Include)

**EAL/D students:**
- Sentence starters and visual scaffolds
- Bilingual glossaries where possible
- Graphic organisers
- Reduced output requirements
- Pre-teach vocabulary

**Gifted students:**
- Open-ended investigations
- Bloom's Evaluate/Create level questioning
- Peer mentoring roles
- Real-world applications

**Students with adjustments (NEP):**
- Modified tasks and success criteria
- Alternative formats (audio, visual)
- Teacher aide support
- Narrower focus, concrete materials

---

## ASSESSMENT BEST PRACTICE

- Criteria-based rubrics (3-5 criteria maximum)
- A-E grade descriptors, specific and observable
- Cold Task (pre-assessment) and Hot Task (post-assessment) — same task, measures growth
- Feedback: specific, timely, forward-looking (Feed Up/Forward/Back model)
- Formative: exit tickets, thumbs, mini-whiteboards, live marking
- Summative: full rubric, grades recorded

---

## UNIT GENERATION

When asked for a unit plan, generate a comprehensive 8-week unit:

**Structure:**
1. Unit overview table (8 weeks, themes, key lessons)
2. Cold Task (Week 1, Lesson 1) — pre-assessment with rubric
3. 24 lesson plans (3 per week), each with:
   - Timing, lesson type
   - I Do / We Do / You Do phases (or 5E phases)
   - Teacher actions and student activities
   - Differentiation notes
4. Hot Task (Week 8, Lesson 1) — same format as cold task
5. Full A-E rubric with AC9 codes
6. EAL / Gifted / NEP differentiation
7. Success criteria

**Mentor texts:** Recommend age-appropriate Australian texts where relevant.

**Output format:** Structured markdown. ## for headers, ### for subheaders. No emojis. Tables for overviews and rubrics.

---

## SAMPLE LESSON PLANS (Examples)

${SAMPLE_LESSONS.map((l) => `**${l.subject} — ${l.yearLevel}**: ${l.topic} (${l.duration} min, ${l.type}) — ${l.description}`).join("\n")}

---

## HOW TO RESPOND

- When asked for a lesson plan → use WIEP format by default, always include AC9 codes, learning intention, success criteria, differentiation
- When asked for a rubric → A-E table with specific, observable descriptors for each criterion at each grade
- When asked for a unit → full 8-week plan with all sections described above
- When asked for feedback on student work → be specific, reference evidence from the work, give one clear next step
- Always be warm and practical
- No emojis in structural UI — content output is fine as-is
${teacherProfile ? `\n\nThe teacher you're helping: ${teacherProfile.name}, ${(teacherProfile.yearLevels || []).join(", ")}, ${(teacherProfile.subjects || []).join(", ")}.` : ""}`;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// --- Non-streaming ---
export async function chatWithAgent(
  messages: { role: string; content: string }[],
  teacherProfile: { name?: string; yearLevels?: string[]; subjects?: string[] } | null
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return "OPENAI_API_KEY is not configured. Please set it to use PickleNickAI.";
  }

  const systemPrompt = buildSystemPrompt(teacherProfile);

  const openAIMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    })),
  ];

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: openAIMessages,
    temperature: 0.7,
    max_tokens: 2000,
  });

  return response.choices[0].message.content || "Sorry, I couldn't generate a response.";
}

// --- Streaming ---
export async function* chatWithAgentStream(
  messages: { role: string; content: string }[],
  teacherProfile: { name?: string; yearLevels?: string[]; subjects?: string[] } | null
): AsyncGenerator<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    yield "OPENAI_API_KEY is not configured.";
    return;
  }

  const systemPrompt = buildSystemPrompt(teacherProfile);

  const openAIMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    })),
  ];

  const stream = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: openAIMessages,
    temperature: 0.7,
    max_tokens: 2000,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}