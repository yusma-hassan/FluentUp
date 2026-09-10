// 'use client';

// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useReducer,
//   useRef,
// } from 'react';

// import { ACTIVE_FRAMEWORKS } from '@/lib/challenge-pool/index';
// import { assignSlots } from '@/lib/random-selector';
// import type {
//   ChallengeFlowAction,
//   ChallengeFlowState,
//   Evaluation,
//   EvaluationError,
//   TopicGenerationError,
//   TopicSlot,
// } from '@/types';

// // ── Initial state ─────────────────────────────────────────────────────────────

// function buildInitialState(): ChallengeFlowState {
//   return {
//     phase: 'FRAMEWORK_SELECTION',
//     frameworkSlots: assignSlots(ACTIVE_FRAMEWORKS),
//     topicSlots: [],
//     selectedFramework: null,
//     selectedTopic: null,
//     audioBlob: null,
//     evaluationResult: null,
//     topicGenerationError: null,
//     phaseError: null,
//   };
// }

// // ── Reducer ───────────────────────────────────────────────────────────────────

// export function challengeFlowReducer(
//   state: ChallengeFlowState,
//   action: ChallengeFlowAction
// ): ChallengeFlowState {
//   switch (action.type) {
//     // ── Framework selection ──────────────────────────────────────────────────
//     case 'SELECT_FRAMEWORK':
//       return {
//         ...state,
//         selectedFramework: action.framework,
//       };

//     case 'CONFIRM_FRAMEWORK':
//       return {
//         ...state,
//         phase: 'GENERATING_TOPICS',
//         topicSlots: [],
//         topicGenerationError: null,
//         phaseError: null,
//       };

//     // ── Topic generation ─────────────────────────────────────────────────────
//     case 'TOPICS_GENERATED':
//       return {
//         ...state,
//         phase: 'TOPIC_SELECTION',
//         topicSlots: action.topicSlots,
//         topicGenerationError: null,
//       };

//     case 'TOPIC_GENERATION_ERROR':
//       return {
//         ...state,
//         // Stay in GENERATING_TOPICS — UI shows error + retry button
//         phase: 'GENERATING_TOPICS',
//         topicGenerationError: action.error,
//       };

//     case 'RETRY_TOPIC_GENERATION':
//       return {
//         ...state,
//         // Clear error so the useEffect fires again
//         topicGenerationError: null,
//         phase: 'GENERATING_TOPICS',
//       };

//     // ── Topic selection ──────────────────────────────────────────────────────
//     case 'SELECT_TOPIC':
//       return {
//         ...state,
//         selectedTopic: action.topic,
//       };

//     case 'CONFIRM_TOPIC':
//       return {
//         ...state,
//         // Enter the 5-second read-only topic display. Preparation has NOT started.
//         phase: 'TOPIC_DISPLAY',
//         phaseError: null,
//       };

//     // Fired automatically after the 5-second topic display completes.
//     // Transitions to PREPARATION where the 30-second prep timer auto-starts.
//     case 'TOPIC_DISPLAY_COMPLETE':
//       return {
//         ...state,
//         phase: 'PREPARATION',
//         phaseError: null,
//       };

//     // ── Preparation ──────────────────────────────────────────────────────────
//     case 'PREP_COMPLETE':
//     case 'SKIP_PREP':
//       return {
//         ...state,
//         phase: 'RECORDING',
//         phaseError: null,
//       };

//     // ADD_PREPARATION_TIME is handled in PreparationPhase via the hook's
//     // addTime() — the reducer does not need to store the time value because
//     // the countdown state lives entirely inside useCountdown. This action is
//     // included so the state machine test's arbitrary action generator covers it.
//     case 'ADD_PREPARATION_TIME':
//       return state; // no-op in reducer; hook handles the time addition

//     // ── Recording ────────────────────────────────────────────────────────────
//     case 'RECORDING_COMPLETE':
//       return {
//         ...state,
//         audioBlob: action.audioBlob,
//       };

//     /**
//      * Fired automatically when the 60-second recording timer expires.
//      * Stores the audio blob and transitions immediately to ANALYZING —
//      * no separate SUBMIT_FOR_ANALYSIS dispatch needed.
//      */
//     case 'RECORDING_TIMER_COMPLETE':
//       return {
//         ...state,
//         audioBlob: action.audioBlob,
//         phase: 'ANALYZING',
//         phaseError: null,
//       };

//     case 'SUBMIT_FOR_ANALYSIS':
//       return {
//         ...state,
//         phase: 'ANALYZING',
//         phaseError: null,
//       };

//     // SILENCE_DETECTED: stays in RECORDING phase; sets phaseError for UI display.
//     // Does NOT advance to ANALYZING and does NOT call /api/evaluate.
//     case 'SILENCE_DETECTED':
//       return {
//         ...state,
//         phase: 'RECORDING',
//         audioBlob: null,
//         phaseError: 'No speech detected. Please try again and make sure your microphone is working.',
//       };

//     case 'RE_RECORD':
//       return {
//         ...state,
//         phase: 'RECORDING',
//         audioBlob: null,
//         phaseError: null,
//       };

//     // ── Analysis ─────────────────────────────────────────────────────────────
//     case 'ANALYSIS_SUCCESS':
//       return {
//         ...state,
//         phase: 'FEEDBACK',
//         evaluationResult: { success: true, evaluation: action.evaluation },
//         phaseError: null,
//       };

//     case 'ANALYSIS_ERROR':
//       return {
//         ...state,
//         phase: 'FEEDBACK',
//         evaluationResult: { success: false, error: action.error },
//         phaseError: null,
//       };

//     case 'RETRY_SUBMISSION':
//       return {
//         ...state,
//         // Re-use the existing audioBlob; transition back to ANALYZING
//         phase: 'ANALYZING',
//         evaluationResult: null,
//         phaseError: null,
//       };

//     // ── New challenge ────────────────────────────────────────────────────────
//     case 'START_NEW_CHALLENGE':
//       return {
//         ...buildInitialState(),
//         // Re-shuffle framework slots for the new session
//         frameworkSlots: assignSlots(ACTIVE_FRAMEWORKS),
//       };

//     default:
//       return state;
//   }
// }

// // ── Context types ─────────────────────────────────────────────────────────────

// interface ChallengeFlowContextValue {
//   state: ChallengeFlowState;
//   dispatch: React.Dispatch<ChallengeFlowAction>;
// }

// // ── Context ───────────────────────────────────────────────────────────────────

// export const ChallengeFlowContext = createContext<ChallengeFlowContextValue | null>(
//   null
// );

// // ── Provider ──────────────────────────────────────────────────────────────────

// export function ChallengeFlowProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const [state, dispatch] = useReducer(challengeFlowReducer, undefined, buildInitialState);

//   // ── Side effect: topic generation ─────────────────────────────────────────
//   //
//   // Fires when the phase is GENERATING_TOPICS and there is no pending error
//   // (error === null means it is a fresh attempt or a cleared retry).
//   //
//   // A ref tracks whether a fetch is already in flight for the current
//   // GENERATING_TOPICS entry so strict-mode double-invocation and React
//   // concurrent re-renders do not launch duplicate requests.

//   const topicFetchInFlight = useRef(false);

//   useEffect(() => {
//     if (state.phase !== 'GENERATING_TOPICS') return;
//     if (state.topicGenerationError !== null) return;
//     if (topicFetchInFlight.current) return;

//     const framework = state.selectedFramework;
//     if (!framework) {
//       dispatch({
//         type: 'TOPIC_GENERATION_ERROR',
//         error: {
//           type: 'VALIDATION_ERROR',
//           message: 'No framework selected. Please go back and select a framework.',
//         } as TopicGenerationError,
//       });
//       return;
//     }

//     topicFetchInFlight.current = true;
//     let cancelled = false;

//     async function fetchTopics() {
//       try {
//         const response = await fetch('/api/generate-topics', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ frameworkId: framework!.id }),
//         });

//         if (cancelled) return;

//         if (!response.ok) {
//           dispatch({
//             type: 'TOPIC_GENERATION_ERROR',
//             error: {
//               type: 'PROVIDER_ERROR',
//               message: 'Failed to generate topics. Please try again.',
//             } as TopicGenerationError,
//           });
//           return;
//         }

//         const data = await response.json() as
//           | { success: true; result: { topics: { id: string; text: string }[] } }
//           | { success: false; error: TopicGenerationError };

//         if (cancelled) return;

//         if (data.success) {
//           const topicSlots: TopicSlot[] = assignSlots(data.result.topics);
//           dispatch({ type: 'TOPICS_GENERATED', topicSlots });
//         } else {
//           dispatch({ type: 'TOPIC_GENERATION_ERROR', error: data.error });
//         }
//       } catch {
//         if (cancelled) return;
//         dispatch({
//           type: 'TOPIC_GENERATION_ERROR',
//           error: {
//             type: 'PROVIDER_ERROR',
//             message: 'A network error occurred while generating topics. Please try again.',
//           } as TopicGenerationError,
//         });
//       } finally {
//         topicFetchInFlight.current = false;
//       }
//     }

//     fetchTopics();

//     return () => {
//       cancelled = true;
//       topicFetchInFlight.current = false;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [state.phase, state.topicGenerationError]);

//   // ── Side effect: evaluation / analysis ────────────────────────────────────
//   //
//   // Fires when the phase transitions to ANALYZING. Sends the recorded audio
//   // blob along with framework and topic context to /api/evaluate.

//   const analysisFetchInFlight = useRef(false);

//   useEffect(() => {
//     if (state.phase !== 'ANALYZING') return;
//     if (analysisFetchInFlight.current) return;

//     const { audioBlob, selectedFramework, selectedTopic } = state;

//     if (!audioBlob || !selectedFramework || !selectedTopic) {
//       dispatch({
//         type: 'ANALYSIS_ERROR',
//         error: {
//           type: 'VALIDATION_ERROR',
//           message: 'Missing audio, framework, or topic. Please try recording again.',
//         } as EvaluationError,
//       });
//       return;
//     }

//     analysisFetchInFlight.current = true;
//     let cancelled = false;

//     async function submitForEvaluation() {
//       const formData = new FormData();
//       formData.append('audio', audioBlob as Blob);
//       formData.append('frameworkId', selectedFramework!.id);
//       formData.append('topicText', selectedTopic!.text);

//       try {
//         const response = await fetch('/api/evaluate', {
//           method: 'POST',
//           body: formData,
//         });

//         if (cancelled) return;

//         if (!response.ok) {
//           dispatch({
//             type: 'ANALYSIS_ERROR',
//             error: {
//               type: 'PROVIDER_ERROR',
//               message: 'The AI service is unavailable. Please try again.',
//             } as EvaluationError,
//           });
//           return;
//         }

//         const data = await response.json() as
//           | { success: true; evaluation: Evaluation }
//           | { success: false; error: EvaluationError };

//         if (cancelled) return;

//         if (data.success) {
//           dispatch({ type: 'ANALYSIS_SUCCESS', evaluation: data.evaluation });
//         } else {
//           dispatch({ type: 'ANALYSIS_ERROR', error: data.error });
//         }
//       } catch {
//         if (cancelled) return;
//         dispatch({
//           type: 'ANALYSIS_ERROR',
//           error: {
//             type: 'PROVIDER_ERROR',
//             message: 'A network error occurred. Please try again.',
//           } as EvaluationError,
//         });
//       } finally {
//         analysisFetchInFlight.current = false;
//       }
//     }

//     submitForEvaluation();

//     return () => {
//       cancelled = true;
//       analysisFetchInFlight.current = false;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [state.phase]);

//   return (
//     <ChallengeFlowContext.Provider value={{ state, dispatch }}>
//       {children}
//     </ChallengeFlowContext.Provider>
//   );
// }

// // ── Consumer hook ─────────────────────────────────────────────────────────────

// export function useChallengeFlow(): ChallengeFlowContextValue {
//   const ctx = useContext(ChallengeFlowContext);
//   if (ctx === null) {
//     throw new Error(
//       'useChallengeFlow must be used within a <ChallengeFlowProvider>. ' +
//         'Ensure the component is rendered inside the provider tree.'
//     );
//   }
//   return ctx;
// }





// temperary code change to make preview for making UI.
'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from 'react';

import { ACTIVE_FRAMEWORKS } from '@/lib/challenge-pool/index';
import { assignSlots } from '@/lib/random-selector';

import type {
  ChallengeFlowAction,
  ChallengeFlowState,
  Evaluation,
  EvaluationError,
  TopicGenerationError,
  TopicSlot,
} from '@/types';

/* ──────────────────────────────────────────────────────────────────────────
   TEMPORARY TOPIC PREVIEW MODE

   true  = use fake topics so the Topic Selection UI can be previewed
   false = use the real Gemini/API topic generation

   Change this back to false when you want to use Gemini again.
────────────────────────────────────────────────────────────────────────── */

const TOPIC_PREVIEW_MODE = true;

/* ──────────────────────────────────────────────────────────────────────────
   Temporary preview topics
────────────────────────────────────────────────────────────────────────── */

const PREVIEW_TOPICS = [
  {
    id: 'preview-topic-1',
    text: 'A small decision that had a big impact on your life',
  },
  {
    id: 'preview-topic-2',
    text: 'Should students be allowed to use AI for assignments?',
  },
  {
    id: 'preview-topic-3',
    text: 'A skill everyone should learn before turning 18',
  },
  {
    id: 'preview-topic-4',
    text: 'Describe a time when you had to think quickly',
  },
  {
    id: 'preview-topic-5',
    text: 'Is social media making communication better or worse?',
  },
  {
    id: 'preview-topic-6',
    text: 'A person who changed the way you think about something',
  },
  {
    id: 'preview-topic-7',
    text: 'What would you change about the education system?',
  },
  {
    id: 'preview-topic-8',
    text: 'A difficult challenge that taught you something valuable',
  },
  {
    id: 'preview-topic-9',
    text: 'Would you rather work alone or as part of a team?',
  },
  {
    id: 'preview-topic-10',
    text: 'Imagine you could improve one thing about your city',
  },
];

/* ── Initial state ───────────────────────────────────────────────────────── */

function buildInitialState(): ChallengeFlowState {
  return {
    phase: 'FRAMEWORK_SELECTION',
    frameworkSlots: assignSlots(ACTIVE_FRAMEWORKS),
    topicSlots: [],
    selectedFramework: null,
    selectedTopic: null,
    audioBlob: null,
    evaluationResult: null,
    topicGenerationError: null,
    phaseError: null,
  };
}

/* ── Reducer ─────────────────────────────────────────────────────────────── */

export function challengeFlowReducer(
  state: ChallengeFlowState,
  action: ChallengeFlowAction
): ChallengeFlowState {
  switch (action.type) {
    /* ── Framework selection ───────────────────────────────────────────── */

    case 'SELECT_FRAMEWORK':
      return {
        ...state,
        selectedFramework: action.framework,
      };

    case 'CONFIRM_FRAMEWORK':
      return {
        ...state,
        phase: 'GENERATING_TOPICS',
        topicSlots: [],
        topicGenerationError: null,
        phaseError: null,
      };

    /* ── Topic generation ──────────────────────────────────────────────── */

    case 'TOPICS_GENERATED':
      return {
        ...state,
        phase: 'TOPIC_SELECTION',
        topicSlots: action.topicSlots,
        topicGenerationError: null,
      };

    case 'TOPIC_GENERATION_ERROR':
      return {
        ...state,
        // Stay in GENERATING_TOPICS — UI shows error + retry button
        phase: 'GENERATING_TOPICS',
        topicGenerationError: action.error,
      };

    case 'RETRY_TOPIC_GENERATION':
      return {
        ...state,
        // Clear error so the useEffect fires again
        topicGenerationError: null,
        phase: 'GENERATING_TOPICS',
      };

    /* ── Topic selection ───────────────────────────────────────────────── */

    case 'SELECT_TOPIC':
      return {
        ...state,
        selectedTopic: action.topic,
      };

    case 'CONFIRM_TOPIC':
      return {
        ...state,
        // Enter the 5-second read-only topic display. Preparation has NOT started.
        phase: 'TOPIC_DISPLAY',
        phaseError: null,
      };

    // Fired automatically after the 5-second topic display completes.
    // Transitions to PREPARATION where the 30-second prep timer auto-starts.
    case 'TOPIC_DISPLAY_COMPLETE':
      return {
        ...state,
        phase: 'PREPARATION',
        phaseError: null,
      };

    /* ── Preparation ──────────────────────────────────────────────────── */

    case 'PREP_COMPLETE':
    case 'SKIP_PREP':
      return {
        ...state,
        phase: 'RECORDING',
        phaseError: null,
      };

    // ADD_PREPARATION_TIME is handled in PreparationPhase via the hook's
    // addTime() — the reducer does not need to store the time value because
    // the countdown state lives entirely inside useCountdown. This action is
    // included so the state machine test's arbitrary action generator covers it.
    case 'ADD_PREPARATION_TIME':
      return state;

    /* ── Recording ─────────────────────────────────────────────────────── */

    case 'RECORDING_COMPLETE':
      return {
        ...state,
        audioBlob: action.audioBlob,
      };

    /**
     * Fired automatically when the 60-second recording timer expires.
     * Stores the audio blob and transitions immediately to ANALYZING —
     * no separate SUBMIT_FOR_ANALYSIS dispatch needed.
     */
    case 'RECORDING_TIMER_COMPLETE':
      return {
        ...state,
        audioBlob: action.audioBlob,
        phase: 'ANALYZING',
        phaseError: null,
      };

    case 'SUBMIT_FOR_ANALYSIS':
      return {
        ...state,
        phase: 'ANALYZING',
        phaseError: null,
      };

    // SILENCE_DETECTED: stays in RECORDING phase; sets phaseError for UI display.
    // Does NOT advance to ANALYZING and does NOT call /api/evaluate.
    case 'SILENCE_DETECTED':
      return {
        ...state,
        phase: 'RECORDING',
        audioBlob: null,
        phaseError:
          'No speech detected. Please try again and make sure your microphone is working.',
      };

    case 'RE_RECORD':
      return {
        ...state,
        phase: 'RECORDING',
        audioBlob: null,
        phaseError: null,
      };

    /* ── Analysis ──────────────────────────────────────────────────────── */

    case 'ANALYSIS_SUCCESS':
      return {
        ...state,
        phase: 'FEEDBACK',
        evaluationResult: {
          success: true,
          evaluation: action.evaluation,
        },
        phaseError: null,
      };

    case 'ANALYSIS_ERROR':
      return {
        ...state,
        phase: 'FEEDBACK',
        evaluationResult: {
          success: false,
          error: action.error,
        },
        phaseError: null,
      };

    case 'RETRY_SUBMISSION':
      return {
        ...state,
        // Re-use the existing audioBlob; transition back to ANALYZING
        phase: 'ANALYZING',
        evaluationResult: null,
        phaseError: null,
      };

    /* ── New challenge ────────────────────────────────────────────────── */

    case 'START_NEW_CHALLENGE':
      return {
        ...buildInitialState(),
        // Re-shuffle framework slots for the new session
        frameworkSlots: assignSlots(ACTIVE_FRAMEWORKS),
      };

    default:
      return state;
  }
}

/* ── Context types ───────────────────────────────────────────────────────── */

interface ChallengeFlowContextValue {
  state: ChallengeFlowState;
  dispatch: React.Dispatch<ChallengeFlowAction>;
}

/* ── Context ─────────────────────────────────────────────────────────────── */

export const ChallengeFlowContext =
  createContext<ChallengeFlowContextValue | null>(null);

/* ── Provider ────────────────────────────────────────────────────────────── */

export function ChallengeFlowProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(
    challengeFlowReducer,
    undefined,
    buildInitialState
  );

  /* ── Side effect: topic generation ───────────────────────────────────── */

  /*
   * Fires when the phase is GENERATING_TOPICS and there is no pending error
   * (error === null means it is a fresh attempt or a cleared retry).
   *
   * A ref tracks whether a fetch is already in flight for the current
   * GENERATING_TOPICS entry so strict-mode double-invocation and React
   * concurrent re-renders do not launch duplicate requests.
   */

  const topicFetchInFlight = useRef(false);

  useEffect(() => {
    if (state.phase !== 'GENERATING_TOPICS') return;
    if (state.topicGenerationError !== null) return;
    if (topicFetchInFlight.current) return;

    const framework = state.selectedFramework;

    if (!framework) {
      dispatch({
        type: 'TOPIC_GENERATION_ERROR',
        error: {
          type: 'VALIDATION_ERROR',
          message:
            'No framework selected. Please go back and select a framework.',
        } as TopicGenerationError,
      });

      return;
    }

    topicFetchInFlight.current = true;

    let cancelled = false;

    /* ────────────────────────────────────────────────────────────────────
       TEMPORARY PREVIEW MODE

       This completely skips the Gemini/API request.

       The generated topics still go through the exact same
       TOPICS_GENERATED action and assignSlots() flow.
    ──────────────────────────────────────────────────────────────────── */

    if (TOPIC_PREVIEW_MODE) {
      const timer = setTimeout(() => {
        if (cancelled) return;

        const topicSlots: TopicSlot[] = assignSlots(PREVIEW_TOPICS);

        dispatch({
          type: 'TOPICS_GENERATED',
          topicSlots,
        });

        topicFetchInFlight.current = false;
      }, 300);

      return () => {
        cancelled = true;
        clearTimeout(timer);
        topicFetchInFlight.current = false;
      };
    }

    /* ────────────────────────────────────────────────────────────────────
       REAL TOPIC GENERATION
    ──────────────────────────────────────────────────────────────────── */

    async function fetchTopics() {
      try {
        const response = await fetch('/api/generate-topics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            frameworkId: framework!.id,
          }),
        });

        if (cancelled) return;

        if (!response.ok) {
          dispatch({
            type: 'TOPIC_GENERATION_ERROR',
            error: {
              type: 'PROVIDER_ERROR',
              message:
                'Failed to generate topics. Please try again.',
            } as TopicGenerationError,
          });

          return;
        }

        const data = (await response.json()) as
          | {
              success: true;
              result: {
                topics: {
                  id: string;
                  text: string;
                }[];
              };
            }
          | {
              success: false;
              error: TopicGenerationError;
            };

        if (cancelled) return;

        if (data.success) {
          const topicSlots: TopicSlot[] = assignSlots(
            data.result.topics
          );

          dispatch({
            type: 'TOPICS_GENERATED',
            topicSlots,
          });
        } else {
          dispatch({
            type: 'TOPIC_GENERATION_ERROR',
            error: data.error,
          });
        }
      } catch {
        if (cancelled) return;

        dispatch({
          type: 'TOPIC_GENERATION_ERROR',
          error: {
            type: 'PROVIDER_ERROR',
            message:
              'A network error occurred while generating topics. Please try again.',
          } as TopicGenerationError,
        });
      } finally {
        topicFetchInFlight.current = false;
      }
    }

    fetchTopics();

    return () => {
      cancelled = true;
      topicFetchInFlight.current = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.topicGenerationError]);

  /* ── Side effect: evaluation / analysis ──────────────────────────────── */

  /*
   * Fires when the phase transitions to ANALYZING. Sends the recorded audio
   * blob along with framework and topic context to /api/evaluate.
   */

  const analysisFetchInFlight = useRef(false);

  useEffect(() => {
    if (state.phase !== 'ANALYZING') return;
    if (analysisFetchInFlight.current) return;

    const {
      audioBlob,
      selectedFramework,
      selectedTopic,
    } = state;

    if (!audioBlob || !selectedFramework || !selectedTopic) {
      dispatch({
        type: 'ANALYSIS_ERROR',
        error: {
          type: 'VALIDATION_ERROR',
          message:
            'Missing audio, framework, or topic. Please try recording again.',
        } as EvaluationError,
      });

      return;
    }

    analysisFetchInFlight.current = true;

    let cancelled = false;

    async function submitForEvaluation() {
      const formData = new FormData();

      formData.append('audio', audioBlob as Blob);
      formData.append(
        'frameworkId',
        selectedFramework!.id
      );
      formData.append(
        'topicText',
        selectedTopic!.text
      );

      try {
        const response = await fetch('/api/evaluate', {
          method: 'POST',
          body: formData,
        });

        if (cancelled) return;

        if (!response.ok) {
          dispatch({
            type: 'ANALYSIS_ERROR',
            error: {
              type: 'PROVIDER_ERROR',
              message:
                'The AI service is unavailable. Please try again.',
            } as EvaluationError,
          });

          return;
        }

        const data = (await response.json()) as
          | {
              success: true;
              evaluation: Evaluation;
            }
          | {
              success: false;
              error: EvaluationError;
            };

        if (cancelled) return;

        if (data.success) {
          dispatch({
            type: 'ANALYSIS_SUCCESS',
            evaluation: data.evaluation,
          });
        } else {
          dispatch({
            type: 'ANALYSIS_ERROR',
            error: data.error,
          });
        }
      } catch {
        if (cancelled) return;

        dispatch({
          type: 'ANALYSIS_ERROR',
          error: {
            type: 'PROVIDER_ERROR',
            message:
              'A network error occurred. Please try again.',
          } as EvaluationError,
        });
      } finally {
        analysisFetchInFlight.current = false;
      }
    }

    submitForEvaluation();

    return () => {
      cancelled = true;
      analysisFetchInFlight.current = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  return (
    <ChallengeFlowContext.Provider
      value={{ state, dispatch }}
    >
      {children}
    </ChallengeFlowContext.Provider>
  );
}

/* ── Consumer hook ───────────────────────────────────────────────────────── */

export function useChallengeFlow(): ChallengeFlowContextValue {
  const ctx = useContext(ChallengeFlowContext);

  if (ctx === null) {
    throw new Error(
      'useChallengeFlow must be used within a <ChallengeFlowProvider>. ' +
        'Ensure the component is rendered inside the provider tree.'
    );
  }

  return ctx;
}