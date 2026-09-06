'use client';

import { ChallengeFlowProvider, useChallengeFlow } from '@/components/layout/ChallengeContext';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { ChallengeScreen } from '@/components/phases/ChallengeScreen';
import { FeedbackScreen } from '@/components/phases/FeedbackScreen';
import { FrameworkSelection } from '@/components/phases/FrameworkSelection';
import { PreparationPhase } from '@/components/phases/PreparationPhase';
import { RecordingPhase } from '@/components/phases/RecordingPhase';
import { TopicSelection } from '@/components/phases/TopicSelection';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { ProgressSteps } from '@/components/ui/ProgressSteps';

function ChallengeShell() {
  const { state, dispatch } = useChallengeFlow();
  const { phase, topicGenerationError } = state;

  let content: React.ReactNode;

  switch (phase) {
    case 'FRAMEWORK_SELECTION':
      content = <FrameworkSelection />;
      break;
    case 'GENERATING_TOPICS':
      content = topicGenerationError ? (
        <div className="mx-auto w-full max-w-lg px-5 py-10">
          <ErrorMessage
            message={topicGenerationError.message}
            onRetry={() => dispatch({ type: 'RETRY_TOPIC_GENERATION' })}
          />
        </div>
      ) : (
        <LoadingIndicator message="Generating topics…" />
      );
      break;
    case 'TOPIC_SELECTION':
      content = <TopicSelection />;
      break;
    case 'TOPIC_DISPLAY':
    case 'CHALLENGE_SCREEN':
      content = <ChallengeScreen />;
      break;
    case 'PREPARATION':
      content = <PreparationPhase />;
      break;
    case 'RECORDING':
      content = <RecordingPhase />;
      break;
    case 'ANALYZING':
      content = <LoadingIndicator message="Analyzing your response…" />;
      break;
    case 'FEEDBACK':
      content = <FeedbackScreen />;
      break;
    default:
      content = (
        <div className="mx-auto w-full max-w-lg px-5 py-10">
          <ErrorMessage
            message="An unexpected error occurred. Please start over."
            onRetry={() => dispatch({ type: 'START_NEW_CHALLENGE' })}
          />
        </div>
      );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b-2 border-[var(--navy)] bg-[var(--bg-page)]">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-extrabold tracking-tight">
              Fluent<span className="text-[var(--coral)]">Up</span>
            </span>
          </div>
          <ProgressSteps phase={phase as any} />
        </div>
      </header>

      <main className="flex flex-1 flex-col">{content}</main>
    </div>
  );
}

export default function ChallengePage() {
  return (
    <ErrorBoundary>
      <ChallengeFlowProvider>
        <ChallengeShell />
      </ChallengeFlowProvider>
    </ErrorBoundary>
  );
}