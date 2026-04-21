import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const VAULT_PATH = '/home/dusk/.openclaw/vault/dawn-vault/shared/skills';

interface SkillContent {
  name: string;
  content: string;
  loadedAt: number;
}

const skillCache = new Map<string, SkillContent>();

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export class SkillLoader {
  /**
   * Load multiple skills in parallel.
   */
  static async load(skillNames: string[]): Promise<string[]> {
    return Promise.all(skillNames.map(name => this.loadOne(name)));
  }

  /**
   * Load a single skill by name.
   * Returns empty string if skill not found.
   * Caches for 5 minutes (per skill).
   */
  static async loadOne(skillName: string): Promise<string> {
    const cached = skillCache.get(skillName);
    if (cached && Date.now() - cached.loadedAt < CACHE_TTL_MS) {
      return cached.content;
    }

    const path = join(VAULT_PATH, skillName, 'SKILL.md');
    if (!existsSync(path)) {
      console.error(`[SkillLoader] Skill not found: ${path}`);
      return '';
    }

    const content = readFileSync(path, 'utf-8');
    skillCache.set(skillName, { name: skillName, content, loadedAt: Date.now() });
    return content;
  }

  /**
   * Clear all cached skills.
   */
  static clearCache(): void {
    skillCache.clear();
  }
}