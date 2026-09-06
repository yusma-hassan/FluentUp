'use client';

import { useChallengeFlow } from '@/components/layout/ChallengeContext';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { ScoreCard } from '@/components/ui/ScoreCard';

export function FeedbackScreen() {
  const { state, dispatch } = useChallengeFlow();
  const { evaluationResult, selectedFramework, selectedTopic } = state;

  const handleTryAgain = () => dispatch({ type: 'START_NEW_CHALLENGE' });
  const handleRetry = () => dispatch({ type: 'RETRY_SUBMISSION' });
  const handleReRecord = () => dispatch({ type: 'RE_RECORD' });

  if (!evaluationResult) {
    return (
      <section className="mx-auto w-full max-w-lg px-5 py-10">
        <ErrorMessage message="No evaluation result available." onRetry={handleReRecord} />
      </section>
    );
  }

  if (!evaluationResult.success) {
    const isNoSpeech = evaluationResult.error.type === 'NO_SPEECH_DETECTED';
    return (
      <section className="mx-auto flex w-full max-w-lg flex-col gap-6 px-5 py-10 fu-fade-up text-center">
        <h1 className="text-2xl font-extrabold text-[var(--navy)]">
          {isNoSpeech ? 'No Speech Detected' : 'Analysis Failed'}
        </h1>
        <ErrorMessage message={evaluationResult.error.message} onRetry={isNoSpeech ? undefined : handleRetry} />
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={isNoSpeech ? handleReRecord : handleRetry} className="fu-btn-primary">
            {isNoSpeech ? 'Record Again' : 'Try Again'}
          </button>
          <button type="button" onClick={handleTryAgain} className="fu-btn-secondary">
            New Challenge
          </button>
        </div>
      </section>
    );
  }

  const { evaluation } = evaluationResult;
  const score = evaluation.overallScore;
  const scoreColor = score >= 75 ? 'var(--teal)' : score >= 50 ? 'var(--yellow)' : 'var(--coral)';

  return (
    <section className="mx-auto flex w-full max-w-lg flex-col gap-6 px-5 py-8 sm:py-12 fu-fade-up">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--navy)]">
          Your Results
        </h1>
        {selectedFramework && (
          <p className="text-sm text-[var(--text-muted)] mt-1">{selectedFramework.name}</p>
        )}
      </div>

      {/* Score */}
      <div className="fu-card flex flex-col items-center gap-3 py-8">
        <div className="relative flex h-32 w-32 items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#E5E1DB" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke={scoreColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - score / 100)}`}
            />
          </svg>
          <div className="relative z-10 text-center">
            <span className="text-4xl font-extrabold" style={{ color: scoreColor }}>{score}</span>
            <span className="block text-xs font-bold text-[var(--text-muted)]">/100</span>
          </div>
        </div>
      </div>

      {/* Category scores */}
      {evaluation.categoryScores.length > 0 && (
        <div className="fu-card flex flex-col gap-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Category Scores
          </p>
          {evaluation.categoryScores.map((cs) => (
            <ScoreCard key={cs.criterionId} score={cs} />
          ))}
        </div>
      )}

      {/* Strengths / Weaknesses / Suggestions */}
      <div className="grid gap-4 sm:grid-cols-3">
        {evaluation.strengths.length > 0 && (
          <div className="rounded-[var(--radius-md)] border-[2.5px] border-[var(--navy)] p-4 shadow-[var(--shadow-sm)]" style={{ background: 'var(--success-light)' }}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--teal)] mb-2">Strengths</p>
            <ul className="space-y-1.5">
              {evaluation.strengths.map((s, i) => (
                <li key={i} className="text-sm text-[var(--navy)]">• {s}</li>
              ))}
            </ul>
          </div>
        )}
        {evaluation.weaknesses.length > 0 && (
          <div className="rounded-[var(--radius-md)] border-[2.5px] border-[var(--navy)] p-4 shadow-[var(--shadow-sm)]" style={{ background: 'var(--error-light)' }}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--error)] mb-2">Areas to Improve</p>
            <ul className="space-y-1.5">
              {evaluation.weaknesses.map((w, i) => (
                <li key={i} className="text-sm text-[var(--navy)]">• {w}</li>
              ))}
            </ul>
          </div>
        )}
        {evaluation.suggestions.length > 0 && (
          <div className="rounded-[var(--radius-md)] border-[2.5px] border-[var(--navy)] p-4 shadow-[var(--shadow-sm)]" style={{ background: 'var(--warning-light)' }}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--warning)] mb-2">Suggestions</p>
            <ul className="space-y-1.5">
              {evaluation.suggestions.map((sug, i) => (
                <li key={i} className="text-sm text-[var(--navy)]">{i + 1}. {sug}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {evaluation.frameworkFeedback && (
        <div className="fu-card">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Framework Feedback
          </p>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {evaluation.frameworkFeedback}
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <button type="button" onClick={handleTryAgain} className="fu-btn-primary">
          New Challenge
        </button>
      </div>
    </section>
  );
}