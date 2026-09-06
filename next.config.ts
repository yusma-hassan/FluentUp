import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Opt @google/genai out of the Server Components bundle so it uses
  // native Node.js require. This is required for the Gemini SDK to work
  // correctly in API routes on Vercel (and other Node.js runtimes).
  // Note: all AI_* env vars are intentionally server-side only — no
  // NEXT_PUBLIC_ prefix is used on any AI-related variable.
  serverExternalPackages: ["@google/genai"],
};

export default nextConfig;
