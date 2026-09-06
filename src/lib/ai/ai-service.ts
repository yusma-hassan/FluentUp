import { GeminiProvider } from './gemini-provider';
import type { AIProvider } from './types';

/**
 * Factory function that returns the configured AI provider.
 *
 * MVP-0: GeminiProvider is the only supported provider.
 *
 * Future: read the AI_PROVIDER environment variable and return the appropriate
 * implementation — e.g.:
 *   if (process.env.AI_PROVIDER === 'openai') return new OpenAIProvider();
 * This allows swapping AI providers without any changes to UI components or
 * business logic (Requirement 6.3, 6.4).
 */
export function createAIProvider(): AIProvider {
  return new GeminiProvider();
}
