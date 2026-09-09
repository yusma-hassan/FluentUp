/**
 * Supabase database type definitions.
 *
 * These types mirror the PostgreSQL schema created in Supabase.
 * The `challenge_attempts` table stores one row per completed evaluation.
 * The `auth.users` table is managed entirely by Supabase Auth — no custom
 * users table exists in the public schema.
 *
 * SQL to create the table and RLS policies (run in Supabase SQL editor):
 *
 * ```sql
 * create table public.challenge_attempts (
 *   id                uuid primary key default gen_random_uuid(),
 *   user_id           uuid not null references auth.users(id) on delete cascade,
 *   framework_id      text not null,
 *   framework_name    text not null,
 *   topic_text        text not null,
 *   overall_score     integer not null check (overall_score between 0 and 100),
 *   category_scores   jsonb not null,
 *   strengths         jsonb not null,
 *   weaknesses        jsonb not null,
 *   suggestions       jsonb not null,
 *   framework_feedback text not null,
 *   example_response  text not null,
 *   completed_at      timestamptz not null default now()
 * );
 *
 * alter table public.challenge_attempts enable row level security;
 *
 * create policy "users can insert own attempts"
 *   on public.challenge_attempts for insert
 *   with check (auth.uid() = user_id);
 *
 * create policy "users can read own attempts"
 *   on public.challenge_attempts for select
 *   using (auth.uid() = user_id);
 * ```
 */

import type { CategoryScore } from '@/types';

// ── Row shapes ────────────────────────────────────────────────────────────────

export interface ChallengeAttemptRow {
  id: string;
  user_id: string;
  framework_id: string;
  framework_name: string;
  topic_text: string;
  overall_score: number;
  /** Stored as JSONB — cast back to CategoryScore[] on read. */
  category_scores: CategoryScore[];
  /** Stored as JSONB — cast back to string[] on read. */
  strengths: string[];
  /** Stored as JSONB — cast back to string[] on read. */
  weaknesses: string[];
  /** Stored as JSONB — cast back to string[] on read. */
  suggestions: string[];
  framework_feedback: string;
  example_response: string;
  completed_at: string; // ISO-8601 timestamp from Supabase
}

export type ChallengeAttemptInsert = Omit<ChallengeAttemptRow, 'id' | 'completed_at'>;

// ── Typed Database helper (used with createClient generics) ───────────────────

export interface Database {
  public: {
    Tables: {
      challenge_attempts: {
        Row: ChallengeAttemptRow;
        Insert: ChallengeAttemptInsert;
        Update: Partial<ChallengeAttemptInsert>;
      };
    };
    Views: Record<string, never>;
Functions: Record<string, never>;
  };
}
