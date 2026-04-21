/**
 * Badge extraction utilities for PickleNickAI
 * Detects AC9 curriculum codes, AITSL standards, and off-topic queries
 */

// AC9 code regex pattern — matches AC9N4-01, AC9EFLY01, AC9E3MA02, etc.
export function extractAC9Codes(text: string): string[] {
  const matches = text.match(/AC9[A-Z]{1,2}\d{1,2}[A-Z]{2}\d{2}/gi);
  return matches ? [...new Set(matches.map(c => c.toUpperCase()))] : [];
}

// AITSL standards regex — matches "AITSL 3.2", "AITSL 5.1", "AITSL focus area 3"
export function extractAITSLStandards(text: string): string[] {
  const matches = text.match(/AITSL\s+(\d+\.?\d*)|AITSL\s+focus\s+area\s+(\d+)/gi);
  if (!matches) return [];
  const standards = matches.map(m => {
    const num = m.match(/\d+\.?\d*/)?.[0];
    return num ? `AITSL ${num}` : m;
  }).filter(Boolean);
  return [...new Set(standards)];
}

// Off-topic detection
const OFF_TOPIC_KEYWORDS = [
  'recipe', 'cook', 'food', 'weather', 'sports', 'movie', 'music',
  'politics', 'medical', 'legal advice', 'symptoms', 'diagnosis',
  'restaurant', 'gaming', 'fashion', 'celebrity', 'stocks', 'crypto',
];

const TEACHING_KEYWORDS = [
  'lesson', 'unit', 'plan', 'rubric', 'assessment', 'curriculum',
  'AC9', 'AITSL', 'year level', 'student', 'classroom', 'teaching',
  'school', 'education', 'teach', 'worksheet', 'activity', 'instruction',
  'differentiation', 'pedagogy', 'scaffolding', 'rubrics', 'task',
  'outcome', 'standard', 'syllabus', 'WA', 'Australia',
];

export function isOffTopic(text: string): boolean {
  const lower = text.toLowerCase();
  const hasOffTopic = OFF_TOPIC_KEYWORDS.some(k => lower.includes(k));
  const hasTeaching = TEACHING_KEYWORDS.some(k => lower.includes(k));
  return hasOffTopic && !hasTeaching;
}

export function extractTeachingKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  return TEACHING_KEYWORDS.filter(k => lower.includes(k));
}
