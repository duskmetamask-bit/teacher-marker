import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const WA_CURRICULUM_TEMPLATES = [
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
    objectives:
      "1. Solve multiplication problems involving 2-digit numbers multiplied by 1-digit numbers using mental and written strategies.\n2. Use arrays and number lines to model multiplication.\n3. Explain the relationship between multiplication and addition.",
    activities:
      "Mental warm-up (multiplication facts game) — 10 min\nIntroduction: arrays on board with 2-digit × 1-digit examples — 10 min\nGuided practice: teacher-led problem solving with student whiteboards — 15 min\nIndependent practice: worksheet (mild/hot/spicy levels) — 20 min\nReflection: share strategies with partner — 5 min",
    resources: "Whiteboards, multi-link cubes, worksheet (differentiated), number lines",
    description:
      "Explicitly teaches 2-digit × 1-digit multiplication using arrays and mental strategies. Includes warm-up, modelling, guided practice, and three-tiered independent task.",
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
    objectives:
      "1. Compare and order fractions with like denominators.\n2. Use fraction walls and number lines to justify reasoning.\n3. Recognise equivalent fractions in context.",
    activities:
      "Warm-up: fraction match game — 10 min\nExploration: compare fractions using fraction walls in pairs — 15 min\nWhole class discussion: share strategies — 10 min\nIndependent task: Fractions worksheet (mild/hot/spicy) — 20 min\nExit ticket: 3 quick compare-and-order questions — 5 min",
    resources: "Fraction wall strips (printed), worksheet, mini-whiteboards",
    description:
      "Guided discovery lesson on comparing fractions using hands-on fraction walls. Students explore equivalent fractions before completing differentiated independent tasks.",
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
    objectives:
      "1. Estimate, measure and compare angles using degrees.\n2. Identify acute, right, obtuse, and reflex angles.\n3. Use a protractor accurately to draw angles of a given size.",
    activities:
      "Angle hunt around the classroom — 10 min\nExplicit instruction: types of angles with card sort — 15 min\nProtractor practice: draw angles on worksheets — 15 min\nChallenge: create a shape picture using specific angles — 10 min",
    resources: "Protractors, angle card sort set, worksheets, classroom objects for angle hunt",
    description:
      "Students discover different angle types through exploration, then learn to measure and draw them accurately. Extension challenge integrates art with geometry.",
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
    objectives:
      "1. Plan and conduct statistical investigations using surveys and experiments.\n2. Select appropriate data displays to represent findings.\n3. Interpret results from data displays, identifying mean, median, and mode.",
    activities:
      "Design our survey question (class vote on a school issue) — 10 min\nCollect data: conduct survey across the class — 15 min\nData representation: choose best display and construct graph — 20 min\nGallery walk: interpret each other's graphs — 10 min\nReflection: what story does our data tell? — 5 min",
    resources: "Graph paper, devices for digital graphs, survey tally sheets, poster materials",
    description:
      "Full statistical investigation cycle — students design a question, collect data, represent it, and interpret results.",
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
    objectives:
      "1. Select and apply efficient mental and written strategies for addition and subtraction.\n2. Explain why a particular strategy was chosen for a given problem.\n3. Use estimation to check the reasonableness of answers.",
    activities:
      "Strategy chant warm-up — 5 min\nModelled: 3 problems — which strategy is best and why — 15 min\nGuided: similar problems with partner, justify choice — 15 min\nIndependent: choose your strategy and estimate first — 10 min",
    resources: "Number lines, base-10 blocks, strategy posters, worksheet",
    description:
      "Explicitly teaches strategy selection for addition and subtraction. Students learn WHEN to use jump, split, or compensation strategies.",
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
    objectives:
      "1. Describe patterns with numbers and identify the rule.\n2. Continue and create number patterns following a given rule.\n3. Explain the relationship between consecutive terms in a pattern.",
    activities:
      "Clap and stamp pattern (teacher-led) — 5 min\nIdentify the rule: number pattern cards on board — 10 min\nGuided exploration: continue and create patterns in pairs — 15 min\nIndependent: pattern challenge cards — 10 min",
    resources: "Pattern cards, number tiles, connecting cubes, worksheet",
    description:
      "Introduces algebraic thinking through number patterns. Students identify rules, continue patterns, and create their own.",
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
    objectives:
      "1. Count a collection of objects accurately to at least 20.\n2. Use one-to-one correspondence when counting.\n3. Compare quantities using words like 'more', 'less', and 'same as'.",
    activities:
      "Song: 1-20 counting song — 5 min\nModelled counting: demonstrate one-to-one correspondence with real objects — 10 min\nRotations: counting collections at 3 stations — 15 min\nSession reflection: which station had more/less? — 5 min",
    resources: "Counting collections (pom-poms, blocks, counters), number cards 1-20, tens frames",
    description:
      "Early number sense through hands-on counting collections. Students practice one-to-one correspondence in small group rotations.",
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
    objectives:
      "1. Recognise, model, and partition two-digit numbers into tens and ones.\n2. Use bundling and unbundling to demonstrate place value.\n3. Read and write numbers to 100 in words and numerals.",
    activities:
      "Warm-up: tens and ones song — 5 min\nModelled: use base-10 blocks to show numbers 10-99 — 10 min\nGuided: students build numbers with base-10 on mini-whiteboards — 10 min\nIndependent: tens and ones worksheet — 15 min",
    resources: "Base-10 blocks, mini-whiteboards, worksheets, number cards",
    description:
      "Foundational place value using concrete base-10 materials. Students build, read, and write two-digit numbers.",
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
    objectives:
      "1. Plan a narrative using the story mountain structure.\n2. Write a narrative with a clear beginning, middle, and end.\n3. Use descriptive language and dialogue to engage the reader.",
    activities:
      "Read a modelled narrative — identify story mountain parts — 10 min\nShared writing: plan our class story on story mountain template — 15 min\nExplicit teaching: how to write a strong orientation and complication — 10 min\nIndependent writing: draft narrative using plan — 20 min",
    resources: "Story mountain template (printed), modelled narrative text, writing books, word banks",
    description:
      "Explicitly teaches narrative structure using the story mountain visual organiser. Students plan then draft a complete narrative.",
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
    objectives:
      "1. Identify the structure of a persuasive text.\n2. Write a persuasive text with at least 3 clear reasons supporting a position.\n3. Use persuasive language features: strong verbs, emotional appeals, rhetorical questions.",
    activities:
      "View and analyse: persuasive advertisement — what makes it convincing? — 10 min\nExplicit: deconstruct persuasive structure on chart paper — 10 min\nShared planning: choose a topic, brainstorm reasons together — 10 min\nIndependent writing: draft persuasive text using plan — 25 min",
    resources: "Persuasive texts (advertisements, speeches), chart paper, writing books, persuasive language word bank",
    description:
      "Introduces persuasive writing through real-world examples. Students deconstruct the structure then write their own persuasive text.",
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
    objectives:
      "1. Make inferences about characters, settings, and events using text evidence and prior knowledge.\n2. Distinguish between what is explicitly stated and what is implied.\n3. Justify inferences with explicit reference to the text.",
    activities:
      "Guided reading: read a short text together — 10 min\nModel: think aloud — making inferences from clues in the text — 10 min\nGuided practice: text excerpts — infer character motivation in groups — 15 min\nWhole class: share inferences and justify with evidence — 10 min",
    resources: "Short fiction texts (age-appropriate), inference task cards, highlighters",
    description:
      "Explicitly teaches inferencing strategy using a gradual release model. Students learn to combine text evidence with background knowledge.",
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
    objectives:
      "1. Recognise and use common word families (e.g., -ight, -ound, -ake).\n2. Apply knowledge of word family patterns to spell new words.\n3. Build and blend words within word families.",
    activities:
      "Sort: word family card sort — 10 min\nExplicit: introduce target word family, build words with magnetic letters — 10 min\nWord hunt: find word family words in a text — 5 min\nIndependent: word family extension sheet — 10 min",
    resources: "Magnetic letters, word family cards, word hunts sheets, worksheets",
    description:
      "Systematic spelling instruction using word family patterns. Students discover how words are related by pattern.",
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
    objectives:
      "1. Recognise that energy exists in different forms and can be transformed.\n2. Investigate how energy changes from one form to another through simple experiments.\n3. Record and explain energy transformations in everyday contexts.",
    activities:
      "Exploration: station rotation — light torch, rub hands, battery fan — 20 min\nRecording: complete energy transformation worksheet at each station — 10 min\nDiscussion: share findings, build class chart of energy transformations — 10 min\nConnection: identify energy forms at home and school — 10 min",
    resources: "Torches, fans, batteries, solar calculators, worksheets, science journals",
    description:
      "Hands-on science exploration of energy forms and transformations through station rotations. Students discover energy changes form through memorable experiments.",
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
    objectives:
      "1. Describe the external features of a variety of living things.\n2. Identify how different living things have features suited to their habitat.\n3. Compare the features of animals that live in different environments.",
    activities:
      "Setup: Tidy Tray exploration — what can we observe? — 10 min\nExplicit: introduce external features — fur, feathers, scales, leaves — 5 min\nInvestigation: compare two creatures (fish vs bird) — 15 min\nResearch: creatures in different habitats — 15 min",
    resources: "Tidy Tray items, creature comparison worksheets, habitat images, science journals",
    description:
      "Students explore living thing external features through hands-on observation and comparison. Connects structure to function.",
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
    objectives:
      "1. Describe and explain the causes of day and night on Earth.\n2. Use a model to demonstrate the rotation of the Earth.\n3. Relate the movement of the Sun to shadows and time.",
    activities:
      "Question: Why does it get dark? (prior knowledge brainstorm) — 5 min\nExplicit model: torch and globe demonstration — rotation = day/night — 15 min\nPrediction: what will happen to our shadow at different times? — 5 min\nInvestigation: track shadow changes throughout the day — 15 min",
    resources: "Globe, torch/flashlight, shadow tracking worksheets, compass",
    description:
      "Uses hands-on modelling to explain the causes of day and night. Students make predictions about shadows then investigate.",
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
    objectives:
      "1. Investigate how and why places have changed over time.\n2. Use sources (photos, maps, interviews) to gather evidence about past environments.\n3. Describe how change affects a community.",
    activities:
      "Photo comparison: same place, then vs now — what changed? — 10 min\nExplicit: introduce investigation question — has our local area changed? — 5 min\nResearch: 3 groups investigate 3 different time periods using sources — 20 min\nMapping: mark changes on a simple local map — 10 min",
    resources: "Historical and contemporary photos, simple local maps, source analysis worksheets",
    description:
      "Historical inquiry into how and why places change. Students use primary and secondary sources to investigate local area history.",
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
    objectives:
      "1. Sequence key events in the exploration of Australia by Europeans.\n2. Describe the experiences of an explorer during first contact.\n3. Discuss the impact of exploration on Aboriginal and Torres Strait Islander peoples.",
    activities:
      "Timeline: sequence key exploration events on a class timeline — 10 min\nModelled: examine a primary source (explorer's journal entry) — 10 min\nGuided analysis: source analysis sheet — explorer images and accounts — 15 min\nDiscussion circles: how might First Nations peoples have responded? — 10 min",
    resources: "Timeline strips, primary source images, source analysis worksheets, A3 paper for journal",
    description:
      "Introduces Australian exploration through careful use of sources. Includes sensitive content guidance and First Nations perspectives.",
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
    objectives:
      "1. Recognise that digital systems represent data as binary digits.\n2. Investigate how text, images, and sound are represented in digital systems.\n3. Create a simple binary representation of their own name.",
    activities:
      "Unplugged: binary name bracelets (students encode their name in binary using beads) — 20 min\nExplicit: how computers represent images as pixels — show zoomed-in photos — 10 min\nExploration: use a binary to text decoder to crack secret messages — 10 min\nCreate: design a simple pixel art image and count the bits — 10 min",
    resources: "Binary cards (printed), beads and string, binary decoder chart, pixel grid worksheets",
    description:
      "Unplugged introduction to binary and data representation through hands-on activities. Students encode their own names and create pixel art.",
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
    objectives:
      "1. Identify and use different types of lines (horizontal, vertical, diagonal, curved).\n2. Create an artwork using a variety of lines and shapes to create contrast and mood.\n3. Describe how line and shape are used in artworks by known artists.",
    activities:
      "Explore: examine artwork images — find the lines and shapes the artist used — 10 min\nExplicit: types of lines and how they create mood (Calder vs Kandinsky) — 10 min\nGuided practice: quick line exercises in sketchbooks — 10 min\nIndependent creation: line and shape artwork on A3 paper — 25 min",
    resources: "Artwork images (Calder, Kandinsky), A3 paper, markers, oil pastels, sketchbooks",
    description:
      "Explicitly teaches line and shape as expressive elements. Students study artists, then create their own original compositions.",
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
    objectives:
      "1. Identify the five food groups and their recommended proportions for a balanced diet.\n2. Analyse a day's eating pattern against the Australian Guide to Healthy Eating.\n3. Plan a healthy meal for themselves, justifying food group choices.",
    activities:
      "Sort: food group card sort — which group does each food belong to? — 10 min\nExplicit: the five food groups and proportions using the plate model — 10 min\nAnalysis: examine a sample day's meals — which food groups are missing? — 10 min\nPlanning: design a healthy lunch for myself with food group labels — 10 min",
    resources: "Food group cards, Australian Guide to Healthy Eating poster, sample menu cards, planning worksheet",
    description:
      "Practical food and nutrition lesson using the Australian Guide to Healthy Eating. Students move from recognition to personal application.",
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
    objectives:
      "1. Recognise that decimals are another way to represent fractions.\n2. Read, write, and interpret decimals to hundredths.\n3. Relate decimal notation to place value and money.",
    activities:
      "Warm-up: what fraction of the square is shaded? Express as decimal — 10 min\nModelled: decimal place value chart — tenths and hundredths — 10 min\nConcrete: use base-10 blocks — if the flat = 1, the rod = ? the cube = ? — 10 min\nGuided: represent decimal amounts using materials — connect to money (cents) — 15 min",
    resources: "Base-10 blocks (flat, rod, cube), decimal place value chart, worksheet, play money (cents)",
    description:
      "Bridges fraction and decimal understanding using hands-on base-10 materials. Connections to money help students anchor decimal place value.",
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
    objectives:
      "1. Identify and explain the effect of figurative language (metaphor, simile, personification).\n2. Analyse how poets use language to create imagery and emotional impact.\n3. Write an original poem using at least two types of figurative language.",
    activities:
      "Read: two poems — find the figurative language, how does it make us feel? — 10 min\nExplicit: unpack simile, metaphor, and personification with examples — 10 min\nCraft: list of topics, generate figurative language phrases together — 10 min\nDraft: write original poem using at least two figurative language types — 15 min",
    resources: "Poems (printed), figurative language reference poster, topic cards, writing books",
    description:
      "Introduces figurative language through careful poem analysis before students apply their understanding to write original poetry.",
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
    objectives:
      "1. Convert between fractions, decimals, and percentages.\n2. Solve problems involving percentages of quantities.\n3. Apply percentage knowledge to real-world shopping and discount contexts.",
    activities:
      "Quick conversion sprint: fraction → decimal → percentage (timed) — 5 min\nExplicit: modelling the relationship using 10×10 grid — 15 min\nGuided: percentage of a quantity examples (10%, 25%, 50%) with visual models — 15 min\nIndependent: real-world shopping problems — calculate discounts at 'Class Shop' — 20 min",
    resources: "10×10 grids (printed), percentage poster, Class Shop price tags, calculator (optional)",
    description:
      "Connects all three representations of part-whole relationships and applies to realistic shopping scenarios.",
    tags: ["Number", "Percentages", "Real-world"],
  },
];

function buildSystemPrompt(
  teacherProfile: { name?: string; yearLevels?: string[]; subjects?: string[] } | null
): string {
  const personalization = teacherProfile
    ? `The teacher you are helping is ${teacherProfile.name || "a teacher"}. They teach ${(teacherProfile.yearLevels || []).join(", ")} and their subjects are ${(teacherProfile.subjects || []).join(", ")}. Personalise your responses accordingly — use their name and reference their year levels and subjects.`
    : "";

  return `You are PickleNickAI, an expert AI teaching assistant for Australian teachers.${personalization}

## Your Expertise
You help teachers with lesson plans, rubrics, worksheets, unit planners, and teaching resources.

## Australian Curriculum Context
- Year levels: Pre-Primary to Year 12
- Key subjects: Mathematics, English, Science, HASS, Technologies, The Arts, HPE, Languages
- Each subject has strands/focus areas (e.g. Mathematics: Number, Algebra, Measurement, Geometry, Statistics, Probability)

## Teaching Frameworks You Use

### WIEP Framework (default lesson structure)
- **Warm-up** (5-10 min): Hook activity to activate prior knowledge, engagement
- **Introduction/Explore** (10-15 min): Introduction to new concept, exploration phase
- **Explicit Teaching** (15-20 min): Direct instruction, modelling, worked examples
- **Practice/Consolidation** (10-20 min): Guided practice, independent tasks, closure

### 5E Framework
- **Engage**: Capture interest, activate prior knowledge
- **Explore**: Hands-on exploration, investigation
- **Explain**: Concepts explained, labels introduced
- **Elaborate**: Apply understanding to new contexts
- **Evaluate**: Assessment of understanding

### Direct Instruction (I Do, We Do, You Do)
- **I Do**: Teacher models/demonstrates
- **We Do**: Guided practice with teacher
- **You Do**: Independent practice

### Bloom's Taxonomy (use for writing learning objectives)
From lowest to highest: Remember, Understand, Apply, Analyse, Evaluate, Create

## Differentiation Strategies
- **EAL/D support**: Visual scaffolds, sentence starters, bilingual resources/glossaries, graphic organisers
- **Gifted extension**: Higher-order questioning (Bloom's Evaluate/Create), independent research projects, peer mentoring roles, open-ended challenges
- **Adjustment students**: Modified tasks, alternative formats (audio, visual), teacher aide support, adjusted success criteria

## Assessment Rubric Best Practices
- Criteria-based (align to curriculum standards)
- Each criterion has a clear description
- Achievement standards referenced (A-E scale for WA)
- Specific success criteria for each level
- Feedback directly linked to criteria

## WA Curriculum Lesson Plan Templates (22 available)
These templates are examples of high-quality lesson plans in the WA curriculum context:

${WA_CURRICULUM_TEMPLATES.map(
  (t) =>
    `### ${t.title} (${t.subject}, ${t.yearLevel})
- Topic: ${t.topic}
- Duration: ${t.duration} min
- Type: ${t.lessonType}
- Differentiation: ${t.differentiation}
- Description: ${t.description}`
).join("\n\n")}

## How to Respond
- When asked for a lesson plan, use WIEP format by default unless another framework is specified
- Always include learning objectives (use Bloom's Taxonomy verbs)
- Include specific success criteria
- Include WA Curriculum alignment codes (e.g. AC9M3N06)
- Be specific about year level, subject, and topic
- When given a rubric/task, provide constructive feedback with specific next steps
- Always differentiate — include EAL/D support, gifted extension, and adjustment notes
${personalization}

Be warm, professional, and highly practical. Give teachers resources they can use immediately.`;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function chatWithAgent(
  messages: { role: string; content: string }[],
  teacherProfile: { name?: string; yearLevels?: string[]; subjects?: string[] } | null
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return "The OPENAI_API_KEY environment variable is not configured. Please set it to use PickleNickAI.";
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
