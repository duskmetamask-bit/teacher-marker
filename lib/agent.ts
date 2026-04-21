import { TeacherContext } from './skills/builder';

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

const OPENCLAW_GATEWAY = 'http://localhost:18789';
const OPENCLAW_TOKEN = '5427075325e3b1f79b8d98df5641fe7e1268e1766c707ae8';
const AGENT_MODEL = 'openclaw/pickle-nick-ai';

/**
 * Send a message to OpenClaw agent and stream response tokens.
 * Uses OpenAI-compatible /v1/chat/completions endpoint.
 */
export async function* chatWithAgentStream(
  messages: ChatMessage[],
  _teacherProfile: TeacherContext | null
): AsyncGenerator<string> {
  const response = await fetch(`${OPENCLAW_GATEWAY}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENCLAW_TOKEN}`,
    },
    body: JSON.stringify({
      model: AGENT_MODEL,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenClaw gateway error: HTTP ${response.status} - ${text}`);
  }

  if (!response.body) {
    throw new Error('OpenClaw gateway returned empty response body');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Non-streaming version — collects full response from OpenClaw.
 */
export async function chatWithAgent(
  messages: ChatMessage[],
  teacherProfile: TeacherContext | null
): Promise<AgentResponse> {
  let fullContent = '';
  for await (const chunk of chatWithAgentStream(messages, teacherProfile)) {
    fullContent += chunk;
  }
  return {
    content: fullContent,
    ac9Validation: { valid: [], invalid: [] },
  };
}

// Legacy export
export async function chatWithAgentLegacy(
  messages: { role: string; content: string }[],
  _teacherProfile: { name?: string; yearLevels?: string[]; subjects?: string[] } | null
): Promise<string> {
  const result = await chatWithAgent(
    messages as ChatMessage[],
    null
  );
  return result.content;
}
