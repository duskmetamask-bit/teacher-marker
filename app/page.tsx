"use client";

import { useState } from "react";

const SUBJECTS: Record<string, string[]> = {
  Mathematics: ["Number", "Algebra", "Measurement", "Geometry", "Statistics", "Probability"],
  English: ["Reading", "Writing", "Speaking & Listening", "Language", "Literature"],
  Science: ["Biological Sciences", "Chemical Sciences", "Earth & Space Sciences", "Physical Sciences"],
  HASS: ["History", "Geography", "Civics & Citizenship", "Economics & Business"],
  Technologies: ["Digital Technologies", "Design & Technologies"],
  "The Arts": ["Visual Arts", "Music", "Drama", "Dance"],
  "Health & Physical Education": ["Health", "Physical Education"],
  Languages: ["Italian", "Japanese", "Mandarin", "Indonesian"],
};

const YEAR_LEVELS = [
  "Pre-Primary",
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5",
  "Year 6",
];

const LESSON_TYPES = [
  "Explicit Teaching",
  "Inquiry-Based",
  "Flipped Classroom",
  "Guided Practice",
  "Independent Task",
  "Review / Revision",
];

const DIFFERENTIATIONS = [
  "Same task, varied support",
  "Tiered tasks",
  "Extension activities",
  "Scaffolding",
  "Mixed-ability groups",
];

interface LessonMeta {
  subject: string;
  yearLevel: string;
  topic: string;
  duration: number;
}

interface GradeResult {
  score: string;
  summary: string;
  breakdown: { criterion: string; marks: string; feedback: string }[];
  areasToImprove: string[];
  nextSteps: string;
}

interface LessonTemplate {
  id: string;
  title: string;
  subject: string;
  yearLevel: string;
  topic: string;
  duration: number;
  lessonType: string;
  differentiation: string;
  focusArea: string;
  objectives: string;
  activities: string;
  resources: string;
  description: string;
  tags: string[];
}

// ─── WA Curriculum Best Practice Templates ──────────────────────

const TEMPLATES: LessonTemplate[] = [
  {
    id: "math-y3-multiplication",
    title: "Multiplication: 2-digit × 1-digit",
    subject: "Mathematics",
    yearLevel: "Year 3",
    topic: "Multiplication and Division",
    duration: 60,
    lessonType: "Explicit Teaching",
    differentiation: "Same task, varied support",
    focusArea: "Number",
    objectives: "1. Solve multiplication problems involving 2-digit numbers multiplied by 1-digit numbers using mental and written strategies.\n2. Use arrays and number lines to model multiplication.\n3. Explain the relationship between multiplication and addition.",
    activities: "Mental warm-up (multiplication facts game) — 10 min\nIntroduction: arrays on board with 2-digit × 1-digit examples — 10 min\nGuided practice: teacher-led problem solving with student whiteboards — 15 min\nIndependent practice: worksheet (mild/hot/spicy levels) — 20 min\nReflection: share strategies with partner — 5 min",
    resources: "Whiteboards, multi-link cubes, worksheet (differentiated), number lines",
    description: "Explicitly teaches 2-digit × 1-digit multiplication using arrays and mental strategies. Includes warm-up, modelling, guided practice, and three-tiered independent task.",
    tags: ["Number", "Multiplication", "Best Practice"],
  },
  {
    id: "math-y4-fractions",
    title: "Fractions: Comparing and Ordering",
    subject: "Mathematics",
    yearLevel: "Year 4",
    topic: "Fractions and Decimals",
    duration: 60,
    lessonType: "Guided Practice",
    differentiation: "Tiered tasks",
    focusArea: "Number",
    objectives: "1. Compare and order fractions with like denominators.\n2. Use fraction walls and number lines to justify reasoning.\n3. Recognise equivalent fractions in context.",
    activities: "Warm-up: fraction match game — 10 min\nExploration: compare fractions using fraction walls in pairs — 15 min\nWhole class discussion: share strategies — 10 min\nIndependent task: Fractions worksheet (mild/hot/spicy) — 20 min\nExit ticket: 3 quick compare-and-order questions — 5 min",
    resources: "Fraction wall strips (printed), worksheet, mini-whiteboards",
    description: "Guided discovery lesson on comparing fractions using hands-on fraction walls. Students explore equivalent fractions before completing differentiated independent tasks.",
    tags: ["Number", "Fractions", "Hands-on"],
  },
  {
    id: "math-y5-angles",
    title: "Angles: Measuring and Naming",
    subject: "Mathematics",
    yearLevel: "Year 5",
    topic: "Geometric Reasoning",
    duration: 50,
    lessonType: "Inquiry-Based",
    differentiation: "Extension activities",
    focusArea: "Geometry",
    objectives: "1. Estimate, measure and compare angles using degrees.\n2. Identify acute, right, obtuse, and reflex angles.\n3. Use a protractor accurately to draw angles of a given size.",
    activities: "Angle hunt around the classroom — 10 min\nExplicit instruction: types of angles with card sort — 15 min\nProtractor practice: draw angles on worksheets — 15 min\nChallenge: create a shape picture using specific angles — 10 min",
    resources: "Protractors, angle card sort set, worksheets, classroom objects for angle hunt",
    description: "Students discover different angle types through exploration, then learn to measure and draw them accurately. Extension challenge integrates art with geometry.",
    tags: ["Geometry", "Angles", "Inquiry"],
  },
  {
    id: "math-y6-statistics",
    title: "Statistical Investigations: Data Representation",
    subject: "Mathematics",
    yearLevel: "Year 6",
    topic: "Statistics",
    duration: 70,
    lessonType: "Inquiry-Based",
    differentiation: "Mixed-ability groups",
    focusArea: "Statistics",
    objectives: "1. Plan and conduct statistical investigations using surveys and experiments.\n2. Select appropriate data displays to represent findings.\n3. Interpret results from data displays, identifying mean, median, and mode.",
    activities: "Design our survey question (class vote on a school issue) — 10 min\nCollect data: conduct survey across the class — 15 min\nData representation: choose best display and construct graph — 20 min\nGallery walk: interpret each other's graphs — 10 min\nReflection: what story does our data tell? — 5 min",
    resources: "Graph paper, devices for digital graphs, survey tally sheets, poster materials",
    description: "Full statistical investigation cycle — students design a question, collect data, represent it, and interpret results.",
    tags: ["Statistics", "Data", "Project"],
  },
  {
    id: "math-y3-add-sub",
    title: "Addition and Subtraction: Strategy Selection",
    subject: "Mathematics",
    yearLevel: "Year 3",
    topic: "Addition and Subtraction",
    duration: 50,
    lessonType: "Explicit Teaching",
    differentiation: "Scaffolding",
    focusArea: "Number",
    objectives: "1. Select and apply efficient mental and written strategies for addition and subtraction.\n2. Explain why a particular strategy was chosen for a given problem.\n3. Use estimation to check the reasonableness of answers.",
    activities: "Strategy chant warm-up — 5 min\nModelled: 3 problems — which strategy is best and why — 15 min\nGuided: similar problems with partner, justify choice — 15 min\nIndependent: choose your strategy and estimate first — 10 min",
    resources: "Number lines, base-10 blocks, strategy posters, worksheet",
    description: "Explicitly teaches strategy selection for addition and subtraction. Students learn WHEN to use jump, split, or compensation strategies.",
    tags: ["Number", "Addition", "Subtraction", "Strategies"],
  },
  {
    id: "math-y2-patterns",
    title: "Number Patterns: Rules and Relationships",
    subject: "Mathematics",
    yearLevel: "Year 2",
    topic: "Patterns and Algebra",
    duration: 45,
    lessonType: "Guided Practice",
    differentiation: "Same task, varied support",
    focusArea: "Algebra",
    objectives: "1. Describe patterns with numbers and identify the rule.\n2. Continue and create number patterns following a given rule.\n3. Explain the relationship between consecutive terms in a pattern.",
    activities: "Clap and stamp pattern (teacher-led) — 5 min\nIdentify the rule: number pattern cards on board — 10 min\nGuided exploration: continue and create patterns in pairs — 15 min\nIndependent: pattern challenge cards — 10 min",
    resources: "Pattern cards, number tiles, connecting cubes, worksheet",
    description: "Introduces algebraic thinking through number patterns. Students identify rules, continue patterns, and create their own.",
    tags: ["Algebra", "Patterns", "Hands-on"],
  },
  {
    id: "math-pp-counting",
    title: "Counting Collections: Quantifying to 20",
    subject: "Mathematics",
    yearLevel: "Pre-Primary",
    topic: "Number and Place Value",
    duration: 40,
    lessonType: "Inquiry-Based",
    differentiation: "Scaffolding",
    focusArea: "Number",
    objectives: "1. Count a collection of objects accurately to at least 20.\n2. Use one-to-one correspondence when counting.\n3. Compare quantities using words like 'more', 'less', and 'same as'.",
    activities: "Song: 1-20 counting song — 5 min\nModelled counting: demonstrate one-to-one correspondence with real objects — 10 min\nRotations: counting collections at 3 stations — 15 min\nSession reflection: which station had more/less? — 5 min",
    resources: "Counting collections (pom-poms, blocks, counters), number cards 1-20, tens frames",
    description: "Early number sense through hands-on counting collections. Students practice one-to-one correspondence in small group rotations.",
    tags: ["Number", "Counting", "Pre-Primary", "Hands-on"],
  },
  {
    id: "math-y1-place-value",
    title: "Place Value: Tens and Ones",
    subject: "Mathematics",
    yearLevel: "Year 1",
    topic: "Number and Place Value",
    duration: 45,
    lessonType: "Explicit Teaching",
    differentiation: "Same task, varied support",
    focusArea: "Number",
    objectives: "1. Recognise, model, and partition two-digit numbers into tens and ones.\n2. Use bundling and unbundling to demonstrate place value.\n3. Read and write numbers to 100 in words and numerals.",
    activities: "Warm-up: tens and ones song — 5 min\nModelled: use base-10 blocks to show numbers 10-99 — 10 min\nGuided: students build numbers with base-10 on mini-whiteboards — 10 min\nIndependent: tens and ones worksheet — 15 min",
    resources: "Base-10 blocks, mini-whiteboards, worksheets, number cards",
    description: "Foundational place value using concrete base-10 materials. Students build, read, and write two-digit numbers.",
    tags: ["Number", "Place Value", "Hands-on"],
  },
  {
    id: "eng-y3-narrative",
    title: "Narrative Writing: Story Mountain",
    subject: "English",
    yearLevel: "Year 3",
    topic: "Creating Texts",
    duration: 60,
    lessonType: "Explicit Teaching",
    differentiation: "Scaffolding",
    focusArea: "Writing",
    objectives: "1. Plan a narrative using the story mountain structure.\n2. Write a narrative with a clear beginning, middle, and end.\n3. Use descriptive language and dialogue to engage the reader.",
    activities: "Read a modelled narrative — identify story mountain parts — 10 min\nShared writing: plan our class story on story mountain template — 15 min\nExplicit teaching: how to write a strong orientation and complication — 10 min\nIndependent writing: draft narrative using plan — 20 min",
    resources: "Story mountain template (printed), modelled narrative text, writing books, word banks",
    description: "Explicitly teaches narrative structure using the story mountain visual organiser. Students plan then draft a complete narrative.",
    tags: ["Writing", "Narrative", "Story Mountain"],
  },
  {
    id: "eng-y4-persuasive",
    title: "Persuasive Writing: Structuring Arguments",
    subject: "English",
    yearLevel: "Year 4",
    topic: "Creating Texts",
    duration: 60,
    lessonType: "Explicit Teaching",
    differentiation: "Tiered tasks",
    focusArea: "Writing",
    objectives: "1. Identify the structure of a persuasive text.\n2. Write a persuasive text with at least 3 clear reasons supporting a position.\n3. Use persuasive language features: strong verbs, emotional appeals, rhetorical questions.",
    activities: "View and analyse: persuasive advertisement — what makes it convincing? — 10 min\nExplicit: deconstruct persuasive structure on chart paper — 10 min\nShared planning: choose a topic, brainstorm reasons together — 10 min\nIndependent writing: draft persuasive text using plan — 25 min",
    resources: "Persuasive texts (advertisements, speeches), chart paper, writing books, persuasive language word bank",
    description: "Introduces persuasive writing through real-world examples. Students deconstruct the structure then write their own persuasive text.",
    tags: ["Writing", "Persuasive", "Real-world"],
  },
  {
    id: "eng-y5-reading",
    title: "Reading Comprehension: Making Inferences",
    subject: "English",
    yearLevel: "Year 5",
    topic: "Literature",
    duration: 50,
    lessonType: "Guided Practice",
    differentiation: "Mixed-ability groups",
    focusArea: "Reading",
    objectives: "1. Make inferences about characters, settings, and events using text evidence and prior knowledge.\n2. Distinguish between what is explicitly stated and what is implied.\n3. Justify inferences with explicit reference to the text.",
    activities: "Guided reading: read a short text together — 10 min\nModel: think aloud — making inferences from clues in the text — 10 min\nGuided practice: text excerpts — infer character motivation in groups — 15 min\nWhole class: share inferences and justify with evidence — 10 min",
    resources: "Short fiction texts (age-appropriate), inference task cards, highlighters",
    description: "Explicitly teaches inferencing strategy using a gradual release model. Students learn to combine text evidence with background knowledge.",
    tags: ["Reading", "Literature", "Inferences", "Guided"],
  },
  {
    id: "eng-y2-spelling",
    title: "Spelling: Word Families and Patterns",
    subject: "English",
    yearLevel: "Year 2",
    topic: "Language",
    duration: 40,
    lessonType: "Explicit Teaching",
    differentiation: "Extension activities",
    focusArea: "Language",
    objectives: "1. Recognise and use common word families (e.g., -ight, -ound, -ake).\n2. Apply knowledge of word family patterns to spell new words.\n3. Build and blend words within word families.",
    activities: "Sort: word family card sort — 10 min\nExplicit: introduce target word family, build words with magnetic letters — 10 min\nWord hunt: find word family words in a text — 5 min\nIndependent: word family extension sheet — 10 min",
    resources: "Magnetic letters, word family cards, word hunts sheets, worksheets",
    description: "Systematic spelling instruction using word family patterns. Students discover how words are related by pattern.",
    tags: ["Language", "Spelling", "Pattern-based"],
  },
  {
    id: "sci-y4-energy",
    title: "Energy: Forms and Transformations",
    subject: "Science",
    yearLevel: "Year 4",
    topic: "Physical Sciences",
    duration: 60,
    lessonType: "Inquiry-Based",
    differentiation: "Same task, varied support",
    focusArea: "Physical Sciences",
    objectives: "1. Recognise that energy exists in different forms and can be transformed.\n2. Investigate how energy changes from one form to another through simple experiments.\n3. Record and explain energy transformations in everyday contexts.",
    activities: "Exploration: station rotation — light torch, rub hands, battery fan — 20 min\nRecording: complete energy transformation worksheet at each station — 10 min\nDiscussion: share findings, build class chart of energy transformations — 10 min\nConnection: identify energy forms at home and school — 10 min",
    resources: "Torches, fans, batteries, solar calculators, worksheets, science journals",
    description: "Hands-on science exploration of energy forms and transformations through station rotations. Students discover energy changes form through memorable experiments.",
    tags: ["Science", "Energy", "Inquiry", "Hands-on"],
  },
  {
    id: "sci-y3-living-things",
    title: "Living Things: External Features and Habitats",
    subject: "Science",
    yearLevel: "Year 3",
    topic: "Biological Sciences",
    duration: 60,
    lessonType: "Inquiry-Based",
    differentiation: "Same task, varied support",
    focusArea: "Biological Sciences",
    objectives: "1. Describe the external features of a variety of living things.\n2. Identify how different living things have features suited to their habitat.\n3. Compare the features of animals that live in different environments.",
    activities: "Setup: Tidy Tray exploration — what can we observe? — 10 min\nExplicit: introduce external features — fur, feathers, scales, leaves — 5 min\nInvestigation: compare two creatures (fish vs bird) — 15 min\nResearch: creatures in different habitats — 15 min",
    resources: "Tidy Tray items, creature comparison worksheets, habitat images, science journals",
    description: "Students explore living thing external features through hands-on observation and comparison. Connects structure to function.",
    tags: ["Science", "Biology", "Living Things", "Inquiry"],
  },
  {
    id: "sci-y5-earth-space",
    title: "Earth and Space: The Day and Night Cycle",
    subject: "Science",
    yearLevel: "Year 5",
    topic: "Earth and Space Sciences",
    duration: 50,
    lessonType: "Explicit Teaching",
    differentiation: "Extension activities",
    focusArea: "Earth & Space Sciences",
    objectives: "1. Describe and explain the causes of day and night on Earth.\n2. Use a model to demonstrate the rotation of the Earth.\n3. Relate the movement of the Sun to shadows and time.",
    activities: "Question: Why does it get dark? (prior knowledge brainstorm) — 5 min\nExplicit model: torch and globe demonstration — rotation = day/night — 15 min\nPrediction: what will happen to our shadow at different times? — 5 min\nInvestigation: track shadow changes throughout the day — 15 min",
    resources: "Globe, torch/flashlight, shadow tracking worksheets, compass",
    description: "Uses hands-on modelling to explain the causes of day and night. Students make predictions about shadows then investigate.",
    tags: ["Science", "Earth & Space", "Model"],
  },
  {
    id: "hass-y3-community",
    title: "HASS: How and Why Places Change",
    subject: "HASS",
    yearLevel: "Year 3",
    topic: "Place and Space",
    duration: 60,
    lessonType: "Inquiry-Based",
    differentiation: "Mixed-ability groups",
    focusArea: "Geography",
    objectives: "1. Investigate how and why places have changed over time.\n2. Use sources (photos, maps, interviews) to gather evidence about past environments.\n3. Describe how change affects a community.",
    activities: "Photo comparison: same place, then vs now — what changed? — 10 min\nExplicit: introduce investigation question — has our local area changed? — 5 min\nResearch: 3 groups investigate 3 different time periods using sources — 20 min\nMapping: mark changes on a simple local map — 10 min",
    resources: "Historical and contemporary photos, simple local maps, source analysis worksheets",
    description: "Historical inquiry into how and why places change. Students use primary and secondary sources to investigate local area history.",
    tags: ["HASS", "Geography", "History", "Inquiry"],
  },
  {
    id: "hass-y4-exploration",
    title: "HASS: Exploration of Australia",
    subject: "HASS",
    yearLevel: "Year 4",
    topic: "Historical Knowledge",
    duration: 50,
    lessonType: "Explicit Teaching",
    differentiation: "Same task, varied support",
    focusArea: "History",
    objectives: "1. Sequence key events in the exploration of Australia by Europeans.\n2. Describe the experiences of an explorer during first contact.\n3. Discuss the impact of exploration on Aboriginal and Torres Strait Islander peoples.",
    activities: "Timeline: sequence key exploration events on a class timeline — 10 min\nModelled: examine a primary source (explorer's journal entry) — 10 min\nGuided analysis: source analysis sheet — explorer images and accounts — 15 min\nDiscussion circles: how might First Nations peoples have responded? — 10 min",
    resources: "Timeline strips, primary source images, source analysis worksheets, A3 paper for journal",
    description: "Introduces Australian exploration through careful use of sources. Includes sensitive content guidance and First Nations perspectives.",
    tags: ["HASS", "History", "Exploration", "Sources"],
  },
  {
    id: "tech-y5-digital",
    title: "Digital Technologies: Data Representation",
    subject: "Technologies",
    yearLevel: "Year 5",
    topic: "Digital Technologies",
    duration: 50,
    lessonType: "Guided Practice",
    differentiation: "Extension activities",
    focusArea: "Digital Technologies",
    objectives: "1. Recognise that digital systems represent data as binary digits.\n2. Investigate how text, images, and sound are represented in digital systems.\n3. Create a simple binary representation of their own name.",
    activities: "Unplugged: binary name bracelets (students encode their name in binary using beads) — 20 min\nExplicit: how computers represent images as pixels — show zoomed-in photos — 10 min\nExploration: use a binary to text decoder to crack secret messages — 10 min\nCreate: design a simple pixel art image and count the bits — 10 min",
    resources: "Binary cards (printed), beads and string, binary decoder chart, pixel grid worksheets",
    description: "Unplugged introduction to binary and data representation through hands-on activities. Students encode their own names and create pixel art.",
    tags: ["Technologies", "Digital", "Unplugged", "Hands-on"],
  },
  {
    id: "arts-y3-visual",
    title: "Visual Arts: Elements of Art — Line and Shape",
    subject: "The Arts",
    yearLevel: "Year 3",
    topic: "Visual Arts",
    duration: 60,
    lessonType: "Explicit Teaching",
    differentiation: "Same task, varied support",
    focusArea: "Visual Arts",
    objectives: "1. Identify and use different types of lines (horizontal, vertical, diagonal, curved).\n2. Create an artwork using a variety of lines and shapes to create contrast and mood.\n3. Describe how line and shape are used in artworks by known artists.",
    activities: "Explore: examine artwork images — find the lines and shapes the artist used — 10 min\nExplicit: types of lines and how they create mood (Calder vs Kandinsky) — 10 min\nGuided practice: quick line exercises in sketchbooks — 10 min\nIndependent creation: line and shape artwork on A3 paper — 25 min",
    resources: "Artwork images (Calder, Kandinsky), A3 paper, markers, oil pastels, sketchbooks",
    description: "Explicitly teaches line and shape as expressive elements. Students study artists, then create their own original compositions.",
    tags: ["Arts", "Visual", "Creative"],
  },
  {
    id: "health-y4-food",
    title: "Health: Food and Nutrition — Healthy Eating",
    subject: "Health & Physical Education",
    yearLevel: "Year 4",
    topic: "Food and Nutrition",
    duration: 45,
    lessonType: "Explicit Teaching",
    differentiation: "Same task, varied support",
    focusArea: "Health",
    objectives: "1. Identify the five food groups and their recommended proportions for a balanced diet.\n2. Analyse a day's eating pattern against the Australian Guide to Healthy Eating.\n3. Plan a healthy meal for themselves, justifying food group choices.",
    activities: "Sort: food group card sort — which group does each food belong to? — 10 min\nExplicit: the five food groups and proportions using the plate model — 10 min\nAnalysis: examine a sample day's meals — which food groups are missing? — 10 min\nPlanning: design a healthy lunch for myself with food group labels — 10 min",
    resources: "Food group cards, Australian Guide to Healthy Eating poster, sample menu cards, planning worksheet",
    description: "Practical food and nutrition lesson using the Australian Guide to Healthy Eating. Students move from recognition to personal application.",
    tags: ["Health", "Nutrition", "Practical"],
  },
  {
    id: "math-y5-decimals",
    title: "Decimals: Tenths and Hundredths",
    subject: "Mathematics",
    yearLevel: "Year 5",
    topic: "Fractions and Decimals",
    duration: 60,
    lessonType: "Explicit Teaching",
    differentiation: "Scaffolding",
    focusArea: "Number",
    objectives: "1. Recognise that decimals are another way to represent fractions.\n2. Read, write, and interpret decimals to hundredths.\n3. Relate decimal notation to place value and money.",
    activities: "Warm-up: what fraction of the square is shaded? Express as decimal — 10 min\nModelled: decimal place value chart — tenths and hundredths — 10 min\nConcrete: use base-10 blocks — if the flat = 1, the rod = ? the cube = ? — 10 min\nGuided: represent decimal amounts using materials — connect to money (cents) — 15 min",
    resources: "Base-10 blocks (flat, rod, cube), decimal place value chart, worksheet, play money (cents)",
    description: "Bridges fraction and decimal understanding using hands-on base-10 materials. Connections to money help students anchor decimal place value.",
    tags: ["Number", "Decimals", "Hands-on"],
  },
  {
    id: "eng-y6-poetry",
    title: "Poetry: Figurative Language and Voice",
    subject: "English",
    yearLevel: "Year 6",
    topic: "Literature",
    duration: 50,
    lessonType: "Explicit Teaching",
    differentiation: "Extension activities",
    focusArea: "Literature",
    objectives: "1. Identify and explain the effect of figurative language (metaphor, simile, personification).\n2. Analyse how poets use language to create imagery and emotional impact.\n3. Write an original poem using at least two types of figurative language.",
    activities: "Read: two poems — find the figurative language, how does it make us feel? — 10 min\nExplicit: unpack simile, metaphor, and personification with examples — 10 min\nCraft: list of topics, generate figurative language phrases together — 10 min\nDraft: write original poem using at least two figurative language types — 15 min",
    resources: "Poems (printed), figurative language reference poster, topic cards, writing books",
    description: "Introduces figurative language through careful poem analysis before students apply their understanding to write original poetry.",
    tags: ["English", "Poetry", "Creative"],
  },
  {
    id: "math-y6-percentages",
    title: "Percentages: Fractions, Decimals, Percentages",
    subject: "Mathematics",
    yearLevel: "Year 6",
    topic: "Fractions, Decimals, Percentages",
    duration: 60,
    lessonType: "Explicit Teaching",
    differentiation: "Tiered tasks",
    focusArea: "Number",
    objectives: "1. Convert between fractions, decimals, and percentages.\n2. Solve problems involving percentages of quantities.\n3. Apply percentage knowledge to real-world shopping and discount contexts.",
    activities: "Quick conversion sprint: fraction → decimal → percentage (timed) — 5 min\nExplicit: modelling the relationship using 10×10 grid — 15 min\nGuided: percentage of a quantity examples (10%, 25%, 50%) with visual models — 15 min\nIndependent: real-world shopping problems — calculate discounts at 'Class Shop' — 20 min",
    resources: "10×10 grids (printed), percentage poster, Class Shop price tags, calculator (optional)",
    description: "Connects all three representations of part-whole relationships and applies to realistic shopping scenarios.",
    tags: ["Number", "Percentages", "Real-world"],
  },
];

// ─── Dark Theme Palette ─────────────────────────────────────────
// Based on best practice: dark grey backgrounds, not pure black
// Muted/saturated accent colours, high-contrast text

const C = {
  bg: "#0d0f1a",          // Deep navy — main background
  surface: "#141627",      // Slightly lighter — card backgrounds
  surface2: "#1c1f35",     // Form/section backgrounds
  border: "#2a2d45",       // Subtle borders
  border2: "#353860",      // Hover borders
  text: "#e8eaf6",         // Off-white — primary text
  text2: "#99a3c7",        // Muted — secondary text
  text3: "#5c6490",        // Dim — labels, placeholders
  primary: "#6366f1",      // Indigo — primary actions
  primaryHover: "#818cf8",  // Lighter indigo — hover
  accent: "#22d3ee",       // Cyan — highlights, accents
  success: "#34d399",      // Emerald — good scores
  warning: "#fbbf24",      // Amber — medium scores
  danger: "#f87171",       // Red — poor scores, errors
  tag: "#1e2145",          // Tag background
};

// Subject colour mapping (muted, desaturated for dark bg)
const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Mathematics: { bg: "#1a1f3d", text: "#93c5fd", border: "#1e3a5f" },
  English:      { bg: "#2d1f2d", text: "#f9a8d4", border: "#4a2040" },
  Science:      { bg: "#1a2d1a", text: "#86efac", border: "#1e4a2e" },
  HASS:         { bg: "#2d2a1a", text: "#fcd34d", border: "#4a3d1e" },
  Technologies: { bg: "#1f1a2d", text: "#c4b5fd", border: "#2e2750" },
  "The Arts":   { bg: "#2d1a2d", text: "#f9a8d4", border: "#4a1e4a" },
  "Health & Physical Education": { bg: "#1a2d2a", text: "#6ee7b7", border: "#1e4a3a" },
  Languages:    { bg: "#1a242d", text: "#7dd3fc", border: "#1e3a50" },
};

// ─── Lesson Planner ───────────────────────────────────────────────

function LessonPlannerTab() {
  const [subject, setSubject] = useState("Mathematics");
  const [yearLevel, setYearLevel] = useState("Year 3");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState(60);
  const [objectives, setObjectives] = useState("");
  const [lessonType, setLessonType] = useState("Explicit Teaching");
  const [resources, setResources] = useState("");
  const [differentiation, setDifferentiation] = useState("Same task, varied support");
  const [activities, setActivities] = useState("");
  const [plan, setPlan] = useState("");
  const [meta, setMeta] = useState<LessonMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterSubject, setFilterSubject] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  const [showTemplates, setShowTemplates] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const focusOptions = SUBJECTS[subject] ?? [];

  const filteredTemplates = TEMPLATES.filter((t) => {
    const matchSubject = filterSubject === "All" || t.subject === filterSubject;
    const matchYear = filterYear === "All" || t.yearLevel === filterYear;
    return matchSubject && matchYear;
  });

  function applyTemplate(template: LessonTemplate) {
    setSubject(template.subject);
    setYearLevel(template.yearLevel);
    setTopic(template.topic);
    setDuration(template.duration);
    setLessonType(template.lessonType);
    setDifferentiation(template.differentiation);
    setObjectives(template.objectives);
    setActivities(template.activities);
    setResources(template.resources);
    setSelectedTemplateId(template.id);
    setShowTemplates(false);
    setError("");
  }

  function clearTemplate() {
    setSelectedTemplateId(null);
  }

  async function handleGenerate() {
    setError("");
    if (!topic.trim()) { setError("Please enter a topic/focus."); return; }
    if (!objectives.trim()) { setError("Please enter at least one learning objective."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, yearLevel, topic, duration, objectives, focusArea: focusOptions[0], lessonType, resources, differentiation, activities }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Generation failed.");
      else { setPlan(data.plan); setMeta({ subject, yearLevel, topic, duration }); }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!plan) return;
    const blob = new Blob([plan], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeTopic = meta?.topic.slice(0, 20).replace(/\s+/g, "_") ?? "topic";
    const date = new Date().toISOString().slice(0, 10);
    a.download = `LessonPlan_${meta?.subject}_${meta?.yearLevel}_${safeTopic}_${date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const inputCls = `w-full rounded-lg px-3 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-0`;
  const labelCls = "block text-xs font-semibold mb-1.5 uppercase tracking-wider";
  const sectionTitleCls = "text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2";

  return (
    <div style={{ color: C.text }} className="space-y-5">

      {/* ── Template Browser ── */}
      {!plan && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold">WA Curriculum Templates</h2>
              <span style={{ background: C.tag, color: C.text2 }} className="text-xs font-mono px-2 py-0.5 rounded-full">
                {filteredTemplates.length} plans
              </span>
            </div>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              style={{ color: C.primaryHover }}
              className="text-sm font-medium hover:underline transition-all"
            >
              {showTemplates ? "▲ Hide" : "▼ Browse Templates"}
            </button>
          </div>

          {showTemplates && (
            <>
              {/* Filters */}
              <div className="flex flex-wrap gap-2.5 mb-5">
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  style={{ background: C.surface2, color: C.text, borderColor: C.border }}
                  className={`${inputCls} border`}
                >
                  <option value="All">All Subjects</option>
                  {Object.keys(SUBJECTS).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  style={{ background: C.surface2, color: C.text, borderColor: C.border }}
                  className={`${inputCls} border`}
                >
                  <option value="All">All Year Levels</option>
                  {YEAR_LEVELS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                {(filterSubject !== "All" || filterYear !== "All") && (
                  <button
                    onClick={() => { setFilterSubject("All"); setFilterYear("All"); }}
                    style={{ color: C.danger }}
                    className="text-xs px-2 py-1 hover:underline"
                  >
                    ✕ Clear
                  </button>
                )}
              </div>

              {/* Active template banner */}
              {selectedTemplateId && (
                <div style={{ background: "linear-gradient(135deg, #1a1f3d, #1e2145)", borderColor: C.primary }}
                  className="border rounded-xl px-4 py-3 mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span style={{ color: C.accent }}>✅</span>
                    <span className="text-sm font-medium">Template loaded — review the form below and hit Generate</span>
                  </div>
                  <button onClick={clearTemplate} style={{ color: C.text2 }} className="text-xs hover:text-white transition-colors">
                    Clear
                  </button>
                </div>
              )}

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredTemplates.map((template) => {
                  const sc = SUBJECT_COLORS[template.subject] ?? { bg: C.tag, text: C.text2, border: C.border };
                  const isSelected = selectedTemplateId === template.id;
                  return (
                    <button
                      key={template.id}
                      onClick={() => applyTemplate(template)}
                      style={{
                        background: isSelected ? C.surface2 : C.surface,
                        border: `1px solid ${isSelected ? C.primary : C.border}`,
                        boxShadow: isSelected ? `0 0 20px rgba(99,102,241,0.15)` : "none",
                      }}
                      className="text-left rounded-xl p-4 transition-all hover:-translate-y-0.5 group"
                    >
                      {/* Subject badge */}
                      <div className="flex items-center justify-between mb-2.5">
                        <span
                          style={{ background: sc.bg, color: sc.text, borderColor: sc.border }}
                          className="text-xs font-semibold px-2 py-0.5 rounded-full border"
                        >
                          {template.subject}
                        </span>
                        <span style={{ color: C.text3 }} className="text-xs">{template.yearLevel}</span>
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-sm mb-1 leading-snug group-hover:text-white transition-colors">
                        {template.title}
                      </h3>

                      {/* Topic */}
                      <p style={{ color: C.text2 }} className="text-xs mb-3">{template.topic}</p>

                      {/* Meta row */}
                      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                        <span style={{ background: C.tag, color: C.text2 }} className="text-xs px-2 py-0.5 rounded">
                          ⏱ {template.duration}m
                        </span>
                        <span style={{ background: C.tag, color: C.text2 }} className="text-xs px-2 py-0.5 rounded">
                          {template.lessonType.split(" ")[0]}
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag) => (
                          <span key={tag} style={{ background: C.tag, color: C.accent }} className="text-xs px-1.5 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {isSelected && (
                        <p style={{ color: C.primaryHover }} className="text-xs font-bold mt-2.5">✓ Active Template</p>
                      )}
                    </button>
                  );
                })}
              </div>

              {filteredTemplates.length === 0 && (
                <div style={{ color: C.text3 }} className="text-center py-16">
                  <p className="text-2xl mb-2">🔍</p>
                  <p className="text-sm">No templates match your filters.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Divider */}
      {!plan && showTemplates && <hr style={{ borderColor: C.border }} />}

      {/* ── How It Works ── */}
      <div style={{ background: "linear-gradient(135deg, #1a1f3d, #141627)", border: `1px solid ${C.border}` }}
        className="rounded-xl p-5">
        <p style={{ color: C.text2 }} className="text-xs font-bold uppercase tracking-widest mb-3">How to use</p>
        <ol className="space-y-1.5">
          {[
            "Browse and click any template card above — it auto-fills the form",
            "Customise any field, then click Generate",
            "Download your tailored lesson plan",
          ].map((step, i) => (
            <li key={i} style={{ color: C.text2 }} className="text-sm flex items-start gap-2.5">
              <span style={{ background: C.primary, color: "#fff" }} className="text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* ── Lesson Details ── */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}` }} className="rounded-xl p-5">
        <h2 className={sectionTitleCls} style={{ color: C.text }}>📝 Lesson Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={labelCls} style={{ color: C.text2 }}>Subject</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)}
              style={{ background: C.surface2, color: C.text, borderColor: C.border }}
              className={`${inputCls} border focus:border-indigo-500 focus:ring-indigo-500/30`}>
              {Object.keys(SUBJECTS).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls} style={{ color: C.text2 }}>Year Level</label>
            <select value={yearLevel} onChange={(e) => setYearLevel(e.target.value)}
              style={{ background: C.surface2, color: C.text, borderColor: C.border }}
              className={`${inputCls} border focus:border-indigo-500 focus:ring-indigo-500/30`}>
              {YEAR_LEVELS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label className={labelCls} style={{ color: C.text2 }}>Topic / Focus</label>
          <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Multiplying 2-digit by 1-digit numbers"
            style={{ background: C.surface2, color: C.text, borderColor: C.border }}
            className={`${inputCls} border focus:border-indigo-500 focus:ring-indigo-500/30`} />
        </div>
        <div>
          <label className={labelCls} style={{ color: C.text2 }}>
            Duration — <span style={{ color: C.accent }} className="font-bold">{duration} min</span>
          </label>
          <input type="range" min={30} max={120} step={5} value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            style={{ accentColor: C.primary }}
            className="w-full mt-1" />
          <div className="flex justify-between text-xs mt-1" style={{ color: C.text3 }}>
            <span>30 min</span><span>120 min</span>
          </div>
        </div>
      </div>

      {/* ── Learning Objectives ── */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}` }} className="rounded-xl p-5">
        <h2 className={sectionTitleCls} style={{ color: C.text }}>🎯 Learning Objectives</h2>
        <textarea value={objectives} onChange={(e) => setObjectives(e.target.value)}
          placeholder={"1. Solve multiplication problems...\n2. Use mental strategies to estimate..."}
          rows={4}
          style={{ background: C.surface2, color: C.text, borderColor: C.border }}
          className={`${inputCls} border focus:border-indigo-500 focus:ring-indigo-500/30 resize-none`} />
      </div>

      {/* ── Strand & Lesson Type ── */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}` }} className="rounded-xl p-5">
        <h2 className={sectionTitleCls} style={{ color: C.text }}>🧩 Strand &amp; Lesson Type</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls} style={{ color: C.text2 }}>Strand / Focus</label>
            <select style={{ background: C.surface2, color: C.text, borderColor: C.border }}
              className={`${inputCls} border`}>
              {focusOptions.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls} style={{ color: C.text2 }}>Lesson Type</label>
            <select value={lessonType} onChange={(e) => setLessonType(e.target.value)}
              style={{ background: C.surface2, color: C.text, borderColor: C.border }}
              className={`${inputCls} border focus:border-indigo-500 focus:ring-indigo-500/30`}>
              {LESSON_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Resources & Differentiation ── */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}` }} className="rounded-xl p-5">
        <h2 className={sectionTitleCls} style={{ color: C.text }}>📎 Resources &amp; Differentiation</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls} style={{ color: C.text2 }}>Resources needed</label>
            <input type="text" value={resources} onChange={(e) => setResources(e.target.value)}
              placeholder="Whiteboards, worksheets, projector"
              style={{ background: C.surface2, color: C.text, borderColor: C.border }}
              className={`${inputCls} border focus:border-indigo-500 focus:ring-indigo-500/30`} />
          </div>
          <div>
            <label className={labelCls} style={{ color: C.text2 }}>Differentiation</label>
            <select value={differentiation} onChange={(e) => setDifferentiation(e.target.value)}
              style={{ background: C.surface2, color: C.text, borderColor: C.border }}
              className={`${inputCls} border focus:border-indigo-500 focus:ring-indigo-500/30`}>
              {DIFFERENTIATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Activities ── */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}` }} className="rounded-xl p-5">
        <h2 className={sectionTitleCls} style={{ color: C.text }}>🕐 Activity Breakdown</h2>
        <textarea value={activities} onChange={(e) => setActivities(e.target.value)}
          placeholder={"Introduction / warm-up — 10 min\nGuided examples — 15 min\nIndependent practice — 20 min"}
          rows={4}
          style={{ background: C.surface2, color: C.text, borderColor: C.border }}
          className={`${inputCls} border focus:border-indigo-500 focus:ring-indigo-500/30 resize-none`} />
        <p style={{ color: C.text3 }} className="text-xs mt-1.5">Format: Activity — X min (one per line)</p>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: `${C.danger}15`, border: `1px solid ${C.danger}40`, color: C.danger }}
          className="rounded-lg px-4 py-3 text-sm">
          ❌ {error}
        </div>
      )}

      {/* Generate Button */}
      <button onClick={handleGenerate} disabled={loading}
        style={{
          background: loading ? C.primary + "60" : "linear-gradient(135deg, #6366f1, #818cf8)",
          boxShadow: loading ? "none" : "0 4px 20px rgba(99,102,241,0.35)",
        }}
        className="w-full text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50">
        {loading ? (
          <><span className="animate-spin">⏳</span> Building your lesson plan...</>
        ) : (
          <>🚀 Generate Lesson Plan</>
        )}
      </button>

      {/* Generated Plan */}
      {plan && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}` }} className="rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: C.accent }}>📄 Your Lesson Plan</h2>
            <button onClick={() => { setPlan(""); setMeta(null); setSelectedTemplateId(null); }}
              style={{ color: C.text2 }}
              className="text-xs hover:text-red-400 transition-colors">
              🗑️ Clear
            </button>
          </div>
          {meta && (
            <p style={{ color: C.text2 }} className="text-sm mb-4 font-medium">
              {meta.subject} · {meta.yearLevel} · {meta.topic}
            </p>
          )}
          <div style={{ background: C.surface2, border: `1px solid ${C.border}` }}
            className="rounded-lg p-5 overflow-x-auto">
            <pre className="text-sm whitespace-pre-wrap" style={{ color: C.text }}>{plan}</pre>
          </div>
          <button onClick={handleDownload}
            style={{
              background: "linear-gradient(135deg, #34d399, #6ee7b7)",
              boxShadow: "0 4px 16px rgba(52,211,153,0.3)",
            }}
            className="mt-4 text-white font-bold py-2.5 px-6 rounded-xl text-sm flex items-center gap-2 hover:opacity-90 transition-all">
            💾 Download Lesson Plan
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Auto Grader ──────────────────────────────────────────────────

function AutoGraderTab() {
  const [studentText, setStudentText] = useState("");
  const [rubric, setRubric] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [yearLevel, setYearLevel] = useState("Year 3");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [error, setError] = useState("");

  const inputCls = `w-full rounded-lg px-3 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-0`;
  const labelCls = "block text-xs font-semibold mb-1.5 uppercase tracking-wider";
  const sectionTitleCls = "text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2";

  function getScoreColor(score: string): string {
    const n = parseFloat(score);
    if (isNaN(n)) return C.surface;
    if (n >= 8) return "#34d39920";
    if (n >= 5) return "#fbbf2420";
    return "#f8717120";
  }

  function getScoreBorder(score: string): string {
    const n = parseFloat(score);
    if (isNaN(n)) return C.border;
    if (n >= 8) return C.success;
    if (n >= 5) return C.warning;
    return C.danger;
  }

  function getScoreLabel(score: string): string {
    const n = parseFloat(score);
    if (isNaN(n)) return "—";
    if (n >= 8) return "Excellent";
    if (n >= 5) return "Satisfactory";
    return "Needs Work";
  }

  async function handleGrade() {
    setError("");
    if (!rubric.trim()) { setError("Please paste a rubric or answer key."); return; }
    if (!studentText.trim()) { setError("Please paste student work text."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: studentText, rubric, subject, yearLevel }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Grading failed.");
      else setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ color: C.text }} className="space-y-5">
      {/* How it works */}
      <div style={{ background: "linear-gradient(135deg, #1a1f3d, #141627)", border: `1px solid ${C.border}` }}
        className="rounded-xl p-5">
        <p style={{ color: C.text2 }} className="text-xs font-bold uppercase tracking-widest mb-3">How it works</p>
        <ol className="space-y-1.5">
          {[
            "Paste the student's written work",
            "Paste your rubric or answer key",
            "Select subject and year level, then click Grade",
            "Get instant score, breakdown, and next steps",
          ].map((step, i) => (
            <li key={i} style={{ color: C.text2 }} className="text-sm flex items-start gap-2.5">
              <span style={{ background: C.primary, color: "#fff" }} className="text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Class Details */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}` }} className="rounded-xl p-5">
        <h2 className={sectionTitleCls} style={{ color: C.text }}>🎓 Class Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls} style={{ color: C.text2 }}>Subject</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)}
              style={{ background: C.surface2, color: C.text, borderColor: C.border }}
              className={`${inputCls} border focus:border-indigo-500 focus:ring-indigo-500/30`}>
              {Object.keys(SUBJECTS).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls} style={{ color: C.text2 }}>Year Level</label>
            <select value={yearLevel} onChange={(e) => setYearLevel(e.target.value)}
              style={{ background: C.surface2, color: C.text, borderColor: C.border }}
              className={`${inputCls} border focus:border-indigo-500 focus:ring-indigo-500/30`}>
              {YEAR_LEVELS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Student Work */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}` }} className="rounded-xl p-5">
        <h2 className={sectionTitleCls} style={{ color: C.text }}>✍️ Student Work</h2>
        <textarea value={studentText} onChange={(e) => setStudentText(e.target.value)}
          placeholder="Paste the student's written response here — essays, short answers, problem solutions..."
          rows={7}
          style={{ background: C.surface2, color: C.text, borderColor: C.border }}
          className={`${inputCls} border focus:border-indigo-500 focus:ring-indigo-500/30 resize-none`} />
        <p style={{ color: C.text3 }} className="text-xs mt-1.5">For image work, paste a text description</p>
      </div>

      {/* Rubric */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}` }} className="rounded-xl p-5">
        <h2 className={sectionTitleCls} style={{ color: C.text }}>📏 Rubric / Answer Key</h2>
        <textarea value={rubric} onChange={(e) => setRubric(e.target.value)}
          placeholder={"Paste your rubric here...\n\nExample:\n- Content accuracy (0-10): Excellent work demonstrates deep understanding...\n- Structure & organisation (0-5): Clear introduction, body, conclusion..."}
          rows={7}
          style={{ background: C.surface2, color: C.text, borderColor: C.border }}
          className={`${inputCls} border focus:border-indigo-500 focus:ring-indigo-500/30 resize-none`} />
        <p style={{ color: C.text3 }} className="text-xs mt-1.5">Include criteria, max marks, and level descriptions</p>
      </div>

      {error && (
        <div style={{ background: `${C.danger}15`, border: `1px solid ${C.danger}40`, color: C.danger }}
          className="rounded-lg px-4 py-3 text-sm">
          ❌ {error}
        </div>
      )}

      {/* Grade Button */}
      <button onClick={handleGrade} disabled={loading}
        style={{
          background: loading ? C.primary + "60" : "linear-gradient(135deg, #6366f1, #818cf8)",
          boxShadow: loading ? "none" : "0 4px 20px rgba(99,102,241,0.35)",
        }}
        className="w-full text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50">
        {loading ? (
          <><span className="animate-spin">⏳</span> Analysing student work...</>
        ) : (
          <>✅ Grade Student Work</>
        )}
      </button>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Score Card */}
          <div
            style={{
              background: getScoreColor(result.score),
              border: `2px solid ${getScoreBorder(result.score)}`,
            }}
            className="rounded-2xl p-6 text-center"
          >
            <p style={{ color: C.text2 }} className="text-xs font-bold uppercase tracking-widest mb-2">Overall Score</p>
            <p className="text-5xl font-black mb-3" style={{ color: C.text }}>{result.score}</p>
            <span
              style={{
                background: getScoreBorder(result.score) + "25",
                color: getScoreBorder(result.score),
                borderColor: getScoreBorder(result.score) + "50",
              }}
              className="inline-block px-4 py-1 rounded-full text-sm font-bold border"
            >
              {getScoreLabel(result.score)}
            </span>
          </div>

          {/* Summary */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}` }} className="rounded-xl p-5">
            <h3 style={{ color: C.text }} className="font-bold text-sm mb-2">📝 Overall Summary</h3>
            <p style={{ color: C.text2 }} className="text-sm leading-relaxed">{result.summary}</p>
          </div>

          {/* Breakdown */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}` }} className="rounded-xl p-5">
            <h3 style={{ color: C.text }} className="font-bold text-sm mb-4">📊 Criterion Breakdown</h3>
            <div className="space-y-3">
              {result.breakdown.map((item, i) => {
                const marks = item.marks.split("/");
                const earned = parseFloat(marks[0]) || 0;
                const total = parseFloat(marks[1]) || 1;
                const pct = (earned / total) * 100;
                const barColor = pct >= 80 ? C.success : pct >= 50 ? C.warning : C.danger;
                return (
                  <div key={i} style={{ background: C.surface2, border: `1px solid ${C.border}` }}
                    className="rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm">{item.criterion}</span>
                      <span className="text-sm font-bold" style={{ color: barColor }}>{item.marks}</span>
                    </div>
                    <div style={{ background: C.border }} className="w-full rounded-full h-2 mb-2">
                      <div style={{ width: `${pct}%`, background: barColor }}
                        className="h-2 rounded-full transition-all" />
                    </div>
                    <p style={{ color: C.text2 }} className="text-xs leading-relaxed">{item.feedback}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Areas to Improve */}
          <div style={{ background: `${C.warning}10`, border: `1px solid ${C.warning}30` }}
            className="rounded-xl p-5">
            <h3 style={{ color: C.warning }} className="font-bold text-sm mb-3">🔻 Areas to Improve</h3>
            <ul className="space-y-2">
              {result.areasToImprove.map((area, i) => (
                <li key={i} style={{ color: C.text2 }} className="text-sm flex items-start gap-2">
                  <span style={{ color: C.warning }}>•</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Next Steps */}
          <div style={{ background: `${C.accent}10`, border: `1px solid ${C.accent}30` }}
            className="rounded-xl p-5">
            <h3 style={{ color: C.accent }} className="font-bold text-sm mb-2">🎯 Recommended Next Steps</h3>
            <p style={{ color: C.text2 }} className="text-sm leading-relaxed">{result.nextSteps}</p>
          </div>

          <button onClick={() => setResult(null)} style={{ color: C.text2 }}
            className="w-full py-2 text-sm hover:text-red-400 transition-colors">
            🗑️ Clear Results
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────

export default function TeacherMarker() {
  const [tab, setTab] = useState<"planner" | "grader">("planner");

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.text }}>
      {/* Header — gradient depth */}
      <header style={{
        background: "linear-gradient(180deg, #1a1f3d 0%, #0d0f1a 100%)",
        borderBottom: `1px solid ${C.border}`,
      }} className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <div style={{
              background: "linear-gradient(135deg, #6366f1, #22d3ee)",
              width: 36, height: 36,
              borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18,
            }}>
              📚
            </div>
            <h1 className="text-2xl font-black">Teacher Marker</h1>
          </div>
          <p style={{ color: C.text2 }} className="text-sm ml-1">WA Curriculum · Lesson Planner &amp; Auto-Grader</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* PickleNickAI Banner */}
        <a
          href="/picklenickai"
          style={{
            display: "block",
            background: "linear-gradient(135deg, #1a1f3d, #141627)",
            border: `1px solid ${C.primary}40`,
            borderRadius: 16,
            padding: "20px 24px",
            marginBottom: 24,
            textDecoration: "none",
            boxShadow: "0 4px 20px rgba(99,102,241,0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                background: "linear-gradient(135deg, #6366f1, #22d3ee)",
                width: 44, height: 44, borderRadius: 12,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, flexShrink: 0,
              }}>
                🤖
              </div>
              <div>
                <p style={{ color: C.text, fontSize: 15, fontWeight: 800, margin: 0 }}>PickleNickAI</p>
                <p style={{ color: C.text2, fontSize: 12, margin: "3px 0 0" }}>Your AI teaching assistant — chat to get lesson plans, rubrics, worksheets and more</p>
              </div>
            </div>
            <div style={{
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              color: "#fff", fontSize: 12, fontWeight: 700,
              padding: "8px 16px", borderRadius: 10, flexShrink: 0,
              whiteSpace: "nowrap",
            }}>
              Open Chat →
            </div>
          </div>
        </a>

        {/* Tab Switcher */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}` }}
          className="rounded-xl p-1.5 flex gap-1 mb-8">
          {tab === "planner" ? (
            <div style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}
              className="flex-1 py-2.5 px-4 rounded-lg font-bold text-sm text-white text-center">
              📚 Lesson Planner
            </div>
          ) : (
            <button onClick={() => setTab("planner")}
              style={{ color: C.text2 }}
              className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all hover:bg-white/5">
              📚 Lesson Planner
            </button>
          )}
          {tab === "grader" ? (
            <div style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}
              className="flex-1 py-2.5 px-4 rounded-lg font-bold text-sm text-white text-center">
              ✅ Auto Grader
            </div>
          ) : (
            <button onClick={() => setTab("grader")}
              style={{ color: C.text2 }}
              className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all hover:bg-white/5">
              ✅ Auto Grader
            </button>
          )}
        </div>

        {tab === "planner" ? <LessonPlannerTab /> : <AutoGraderTab />}

        {/* Footer */}
        <footer style={{ color: C.text3 }} className="text-center text-xs py-8 mt-4">
          Teacher Marker — $19/mo teacher plan · School license $99/mo
        </footer>
      </main>
    </div>
  );
}
