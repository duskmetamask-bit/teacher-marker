// Skill registry — maps skills to their trigger keywords
// Core skills load on every request; domain skills load based on message classification

export const CORE_SKILLS = [
  'pickle-teaching',
  'pickle-product',
  'pickle-education',
] as const;

export interface SkillEntry {
  name: string;
  triggerKeywords: string[];
  description: string;
}

export const SKILL_REGISTRY: SkillEntry[] = [
  {
    name: 'pickle-teaching',
    triggerKeywords: [], // core — always loaded
    description: 'Pedagogical frameworks, AITSL, behaviour management, trauma-informed, UDL',
  },
  {
    name: 'pickle-product',
    triggerKeywords: [], // core — always loaded
    description: 'How to run PickleNickAI, improvement loop, competitive intel',
  },
  {
    name: 'pickle-education',
    triggerKeywords: [], // core — always loaded
    description: 'AC9 curriculum F-6, WA context, SCSA, cross-curriculum priorities, EAL/D, NCCD, PAT interpretation',
  },
  {
    name: 'pickle-maths',
    triggerKeywords: ['maths', 'mathematics', 'number', 'algebra', 'measurement', 'geometry', 'fractions', 'decimals', 'percentages', 'angles', 'statistics', 'patterns'],
    description: 'AC9 Maths F-6, CPA, Number Talks, CUBES, mental strategies',
  },
  {
    name: 'pickle-science',
    triggerKeywords: ['science', 'scientific', 'biology', 'physics', 'chemistry', 'earth', 'space', 'living things', 'energy'],
    description: 'AC9 Science F-6, IQRM, scientific inquiry',
  },
  {
    name: 'pickle-hass',
    triggerKeywords: ['hass', 'history', 'geography', 'civics', 'economics', 'social sciences', 'aboriginal', 'torres strait'],
    description: 'AC9 HASS F-6, all 4 sub-strands',
  },
  {
    name: 'pickle-technologies',
    triggerKeywords: ['technology', 'technologies', 'coding', 'digital', 'design', 'computational', 'binary'],
    description: 'AC9 Technologies F-6, Design Thinking, coding',
  },
  {
    name: 'pickle-arts',
    triggerKeywords: ['art', 'arts', 'music', 'drama', 'dance', 'media', 'visual', 'creative'],
    description: 'AC9 The Arts F-6, all 5 strands',
  },
  {
    name: 'pickle-wellbeing',
    triggerKeywords: ['health', 'wellbeing', 'mental health', 'pe', 'physical education', 'nutrition', 'safety', 'sel'],
    description: 'SEL frameworks, Zones of Regulation, mental health',
  },
  {
    name: 'pickle-writing',
    triggerKeywords: ['writing', 'persuasive', 'narrative', 'poetry', 'grammar', 'spelling', 'text type', 'writing workshop'],
    description: 'All text types, writing process, Writing Workshop, Showing vs Telling',
  },
  {
    name: 'pickle-assessment',
    triggerKeywords: ['assessment', 'rubric', 'task', 'criteria', 'evaluation', 'brightpath', 'pat'],
    description: 'PAT/Brightpath/WSR, NCCD, moderation',
  },
  {
    name: 'pickle-marking',
    triggerKeywords: ['marking', 'feedback', 'grade', 'evaluate', 'hattie', 'rubric'],
    description: 'Hattie feedback, rubric design, PAT interpretation, A-E grades',
  },
  {
    name: 'pickle-differentiation',
    triggerKeywords: ['differentiation', 'differentiat', 'eal', 'gifted', 'sen', 'adjustment', 'udl', 'trauma', 'eald'],
    description: 'EAL/D, Gifted, SEN, UDL, trauma-informed',
  },
  {
    name: 'pickle-parent',
    triggerKeywords: ['parent', 'communication', 'interview', 'newsletter', 'report comments', 'parent-teacher'],
    description: 'Parent communication, interviews, WA context',
  },
  {
    name: 'pickle-behaviour',
    triggerKeywords: ['behaviour', 'classroom', 'conflict', 'management', 'restorative', 'escalation', 'charter'],
    description: 'Classroom management, escalation, restorative practices',
  },
  {
    name: 'pickle-resources',
    triggerKeywords: ['resource', 'tool', 'find', 'recommend', 'worksheet', 'template'],
    description: 'Best Australian teaching resources',
  },
  {
    name: 'pickle-legal',
    triggerKeywords: ['legal', 'law', 'policy', 'mandatory', 'reporting', 'duty of care', 'child protection', 'ncnd'],
    description: 'WA mandatory reporting, duty of care, NCCD',
  },
  {
    name: 'pickle-standards',
    triggerKeywords: ['standards', 'aitsl', 'professional', 'graduate', 'lead', 'career'],
    description: 'AITSL Professional Standards, AC9 achievement standards',
  },
  {
    name: 'pickle-reporting',
    triggerKeywords: ['report', 'comment', 'a-e', 'grade', 'reporting', 'semester'],
    description: 'WA A-E report writing, comment templates',
  },
];

/**
 * Classify a message and return the domain skills it should trigger.
 * Core skills (pickle-teaching, pickle-product, pickle-education) are always included.
 */
export function classifyMessage(message: string): string[] {
  const lower = message.toLowerCase();
  const triggered: string[] = [];

  for (const skill of SKILL_REGISTRY) {
    // Skip core skills — they are always added separately
    if (CORE_SKILLS.includes(skill.name as typeof CORE_SKILLS[number])) continue;

    for (const keyword of skill.triggerKeywords) {
      if (lower.includes(keyword)) {
        triggered.push(skill.name);
        break;
      }
    }
  }

  return triggered;
}