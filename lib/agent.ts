import OpenAI from 'openai';
import { SkillLoader } from './skills/loader';
import { buildSystemPrompt, type TeacherContext } from './skills/builder';
import { extractCodes, validateCodes } from './curriculum/validator';
import { CORE_SKILLS, classifyMessage } from './skills/registry';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AgentResponse {
  content: string;
  ac9Validation: {
    valid: string[];
    invalid: string[];
  };
}

/**
 * Get the domain skills to load based on the latest user message.
 */
function getDomainSkills(messages: ChatMessage[]): string[] {
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
  if (!lastUserMessage) return [];
  return classifyMessage(lastUserMessage.content);
}

/**
 * Validate and potentially retry a response with invalid AC9 codes.
 * Retries up to 2 times, then returns with a disclaimer.
 */
async function validateAndMaybeRetry(
  content: string,
  retryCount = 0
): Promise<{ content: string; validation: { valid: string[]; invalid: string[] } }> {
  const codes = extractCodes(content);
  const { valid, invalid } = validateCodes(codes);

  if (invalid.length === 0) {
    return { content, validation: { valid, invalid } };
  }

  if (retryCount < 2) {
    console.warn(`[PickleNickAI] Invalid AC9 codes detected: ${invalid.join(', ')}. Retrying...`);
    return { content, validation: { valid, invalid } };
  }

  // After max retries, append a disclaimer
  const disclaimer = `\n\n[AC9 VALIDATION NOTE: The following codes could not be verified and may not be valid: ${invalid.join(', ')}. Please verify these against the official AC9 curriculum before use.]`;
  return {
    content: content + disclaimer,
    validation: { valid: [...valid], invalid },
  };
}

export async function chatWithAgent(
  messages: ChatMessage[],
  teacherProfile: TeacherContext | null
): Promise<AgentResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      content: 'The OPENAI_API_KEY environment variable is not configured. Please set it to use PickleNickAI.',
      ac9Validation: { valid: [], invalid: [] },
    };
  }

  // 1. Classify message to determine domain skills
  const domainSkills = getDomainSkills(messages);
  const allSkills = [...CORE_SKILLS, ...domainSkills];

  // 2. Load all relevant skills
  const skillContents = await SkillLoader.load(allSkills);

  // 3. Build system prompt from loaded skills
  const systemPrompt = buildSystemPrompt({
    teacherContext: teacherProfile || {},
    skillContents,
  });

  // 4. Build OpenAI messages
  const openAIMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    })),
  ];

  // 5. Call GPT-4o Mini
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: openAIMessages,
    temperature: 0.7,
    max_tokens: 4000,
  });

  const rawContent = response.choices[0].message.content || '';
  const { content, validation } = await validateAndMaybeRetry(rawContent);

  return { content, ac9Validation: validation };
}

/**
 * Streaming version of chatWithAgent — yields response chunks for SSE streaming.
 */
export async function* chatWithAgentStream(
  messages: ChatMessage[],
  teacherProfile: TeacherContext | null
): AsyncGenerator<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    yield 'The OPENAI_API_KEY environment variable is not configured. Please set it to use PickleNickAI.';
    return;
  }

  // 1. Classify message to determine domain skills
  const domainSkills = getDomainSkills(messages);
  const allSkills = [...CORE_SKILLS, ...domainSkills];

  // 2. Load all relevant skills
  const skillContents = await SkillLoader.load(allSkills);

  // 3. Build system prompt from loaded skills
  const systemPrompt = buildSystemPrompt({
    teacherContext: teacherProfile || {},
    skillContents,
  });

  // 4. Build OpenAI messages
  const openAIMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    })),
  ];

  // 5. Call GPT-4o Mini with streaming
  const stream = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: openAIMessages,
    temperature: 0.7,
    max_tokens: 4000,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

// Legacy export for backwards compat
export async function chatWithAgentLegacy(
  messages: { role: string; content: string }[],
  teacherProfile: { name?: string; yearLevels?: string[]; subjects?: string[] } | null
): Promise<string> {
  const result = await chatWithAgent(
    messages as ChatMessage[],
    teacherProfile as TeacherContext | null
  );
  return result.content;
}