'use client';

const STEPS = [
  { id: 1, label: 'Framework' },
  { id: 2, label: 'Topic' },
  { id: 3, label: 'Prep' },
  { id: 4, label: 'Speak' },
  { id: 5, label: 'Results' },
] as const;

type Phase =
  | 'FRAMEWORK_SELECTION'
  | 'GENERATING_TOPICS'
  | 'TOPIC_SELECTION'
  | 'TOPIC_DISPLAY'
  | 'CHALLENGE_SCREEN'
  | 'PREPARATION'
  | 'RECORDING'
  | 'ANALYZING'
  | 'FEEDBACK';

function phaseToStep(phase: Phase): number {
  switch (phase) {
    case 'FRAMEWORK_SELECTION': return 1;
    case 'GENERATING_TOPICS':
    case 'TOPIC_SELECTION': return 2;
    case 'TOPIC_DISPLAY':
    case 'CHALLENGE_SCREEN':
    case 'PREPARATION': return 3;
    case 'RECORDING':
    case 'ANALYZING': return 4;
    case 'FEEDBACK': return 5;
    default: return 1;
  }
}

export function ProgressSteps({ phase }: { phase: Phase }) {
  const current = phaseToStep(phase);

  return (
    <div className="flex items-center justify-between gap-1 w-full max-w-md mx-auto">
      {STEPS.map((step, idx) => {
        const isActive = step.id === current;
        const isCompleted = step.id < current;
        const isLast = idx === STEPS.length - 1;

        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`
                  flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold border-2 border-[var(--navy)]
                  ${isActive ? 'bg-[var(--coral)] text-white' : ''}
                  ${isCompleted ? 'bg-[var(--teal)] text-white' : ''}
                  ${!isActive && !isCompleted ? 'bg-white text-[var(--navy)]' : ''}
                `}
              >
                {isCompleted ? '✓' : step.id}
              </div>
              <span className={`text-[10px] font-bold ${isActive ? 'text-[var(--coral)]' : 'text-[var(--text-muted)]'}`}>
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className={`h-[2px] flex-1 mx-1 ${step.id < current ? 'bg-[var(--teal)]' : 'bg-[var(--grey-300)]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}