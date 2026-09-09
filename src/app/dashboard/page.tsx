/**
 * /dashboard — authenticated user's personal progress dashboard.
 *
 * This is a Server Component. All Supabase queries run server-side;
 * the user's data never passes through the client bundle.
 *
 * Route protection is handled by src/middleware.ts — unauthenticated
 * visitors are redirected to /login before this component ever renders.
 *
 * User identity is derived exclusively from supabase.auth.getUser()
 * server-side. It is never accepted from query params or headers.
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { SiteNav } from '@/components/layout/SiteNav';
import { PageBackground } from '@/components/ui/PageBackground';
import { OverviewCards } from '@/components/dashboard/OverviewCards';
import { ScoreHistory } from '@/components/dashboard/ScoreHistory';
import { StrengthsWeaknesses, type FrequencyItem } from '@/components/dashboard/StrengthsWeaknesses';
import { RecentAttempts, type RecentAttempt } from '@/components/dashboard/RecentAttempts';
import { EmptyState } from '@/components/dashboard/EmptyState';
import type { ChallengeAttemptRow } from '@/lib/supabase/types';

export const metadata = {
  title: 'Dashboard — FluentUp',
  description: 'Your personal speaking progress dashboard.',
};

// ── Aggregation helpers ───────────────────────────────────────────────────────

function computeFrequency(items: string[][]): FrequencyItem[] {
  const map = new Map<string, number>();
  for (const list of items) {
    for (const item of list) {
      const key = item.trim();
      if (key) map.set(key, (map.get(key) ?? 0) + 1);
    }
  }
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([text, count]) => ({ text, count }));
}

function round(n: number): number {
  return Math.round(n);
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient();

  // Verify authentication server-side (middleware already redirects, but
  // this is a second line of defence in case middleware is misconfigured)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch all attempts for this user, ordered newest-first.
  // RLS guarantees we only ever receive rows where user_id = auth.uid()
  const { data: rows, error } = await supabase
    .from('challenge_attempts')
    .select('*')
    .order('completed_at', { ascending: false });

  if (error) {
    console.error('[dashboard] fetch error:', error.code, error.message);
  }

  const attempts: ChallengeAttemptRow[] = (rows ?? []) as ChallengeAttemptRow[];
  const isEmpty = attempts.length === 0;

  // ── Compute aggregates ────────────────────────────────────────────────────
  const scores = attempts.map((a) => a.overall_score);
  const totalChallenges = attempts.length;
  const averageScore = isEmpty ? 0 : round(scores.reduce((s, v) => s + v, 0) / scores.length);
  const bestScore = isEmpty ? 0 : Math.max(...scores);
  const latestScore = isEmpty ? 0 : scores[0]; // already sorted newest-first

  // Score history — up to last 20, reversed so oldest-first for the chart
  const historyPoints = attempts
    .slice(0, 20)
    .reverse()
    .map((a) => ({
      score: a.overall_score,
      completedAt: a.completed_at,
      frameworkName: a.framework_name,
    }));

  // Strengths / weaknesses frequency
  const topStrengths = computeFrequency(attempts.map((a) => a.strengths as string[]));
  const topWeaknesses = computeFrequency(attempts.map((a) => a.weaknesses as string[]));

  // Recent attempts — last 8 for the list
  const recentAttempts: RecentAttempt[] = attempts.slice(0, 8).map((a) => ({
    id: a.id,
    frameworkName: a.framework_name,
    topicText: a.topic_text,
    overallScore: a.overall_score,
    completedAt: a.completed_at,
  }));

  // Greeting name from user metadata
  const displayName =
    (user.user_metadata?.full_name as string | undefined)?.split(' ')[0] ??
    user.email?.split('@')[0] ??
    'there';

  return (
    <>
      <SiteNav />
      <main
        className="relative min-h-screen"
        style={{ background: 'var(--bg-page)' }}
      >
        <PageBackground variant="dashboard" gridOpacity={0.04} />

        <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8 py-10 sm:py-14 flex flex-col gap-8">

          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>
                Welcome back,
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--navy)' }}>
                {displayName}
              </h1>
            </div>
            <Link href="/challenge" className="fu-btn-primary self-start sm:self-auto">
              New Challenge →
            </Link>
          </div>

          {isEmpty ? (
            <EmptyState />
          ) : (
            <>
              {/* ── Overview stat cards ── */}
              <section aria-label="Overview">
                <OverviewCards
                  totalChallenges={totalChallenges}
                  averageScore={averageScore}
                  bestScore={bestScore}
                  latestScore={latestScore}
                />
              </section>

              {/* ── Score history sparkline ── */}
              <section aria-label="Score history">
                <ScoreHistory points={historyPoints} />
              </section>

              {/* ── Strengths & weaknesses ── */}
              <section aria-label="Strengths and areas to improve">
                <StrengthsWeaknesses
                  strengths={topStrengths}
                  weaknesses={topWeaknesses}
                />
              </section>

              {/* ── Recent challenges ── */}
              <section aria-label="Recent challenges">
                <RecentAttempts attempts={recentAttempts} />
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}
