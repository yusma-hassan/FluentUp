// ── Challenge Pool types ──────────────────────────────────────────────────────

export interface EvaluationCriterion {
  id: string;         // e.g., "prep_point"
  label: string;      // e.g., "Clear Point"
  description: string; // 1–200 chars; injected into AI prompt
}

export interface Framework {
  id: string;                          // unique, 1–50 chars, e.g., "prep"
  name: string;                        // display name, 1–100 chars
  description: string;                 // 1–500 chars
  structuralSteps: string[];           // ordered steps shown on Challenge Screen
  evaluationCriteria: EvaluationCriterion[]; // 1–10 items; drives AI prompt
  preparationTimeSeconds: number;      // framework-specific preparation time
  speakingTimeSeconds: number;         // framework-specific speaking time
}

export interface Topic {
  id: string;   // unique identifier
  text: string; // the prompt shown to the user
}

// ── AI-generated topic types ──────────────────────────────────────────────────

export interface GeneratedTopic {
  id: string;   // server-assigned, e.g., "generated-1"
  text: string; // the topic prompt shown to the user after selection
}

export interface TopicGenerationRequest {
  frameworkId: string;
  frameworkName: string;
  frameworkDescription: string;
  structuralSteps: string[];
  evaluationCriteria: EvaluationCriterion[];
}

export interface TopicGenerationResult {
  topics: GeneratedTopic[]; // always exactly 10
}

export type TopicGenerationError = {
  type:
    | 'TIMEOUT'
    | 'SCHEMA_MISMATCH'
    | 'PROVIDER_ERROR'
    | 'VALIDATION_ERROR'
    | 'INSUFFICIENT_TOPICS'
    | 'DUPLICATE_TOPICS';
  message: string;
};

export type TopicGenerationResponse =
  | { success: true; result: TopicGenerationResult }
  | { success: false; error: TopicGenerationError };

// ── Session / flow types ──────────────────────────────────────────────────────

export interface NumberedSlot<T> {
  slot: number; // 1-based display number
  item: T;      // hidden until selected
}

export type FrameworkSlot = NumberedSlot<Framework>;
export type TopicSlot = NumberedSlot<GeneratedTopic>;

export interface ChallengeContext {
  framework: Framework;
  topic: GeneratedTopic;
}

// ── Evaluation schema ─────────────────────────────────────────────────────────

export interface CategoryScore {
  criterionId: string; // matches EvaluationCriterion.id
  label: string;       // human-readable category name
  score: number;       // 0–100, server-computed
}

export interface Evaluation {
  overallScore: number;          // 0–100, server-computed
  categoryScores: CategoryScore[];
  strengths: string[];           // 1–5 items, 10–200 chars each
  weaknesses: string[];          // 1–5 items, 10–200 chars each
  frameworkFeedback: string;     // 50–500 chars, framework-specific
  suggestions: string[];         // 1–3 items, 20–300 chars each
  exampleResponse: string;       // 50–500 chars
}

export interface EvaluationError {
  type:
    | 'TIMEOUT'
    | 'SCHEMA_MISMATCH'
    | 'PROVIDER_ERROR'
    | 'VALIDATION_ERROR'
    /**
     * Returned by the AI layer (second-line defense) when Gemini determines
     * the audio contains no meaningful human speech.
     */
    | 'NO_SPEECH_DETECTED';
  message: string; // human-readable, no internal details
}

export type EvaluationResult =
  | { success: true; evaluation: Evaluation }
  | { success: false; error: EvaluationError };

// ── Client-side challenge flow state machine ──────────────────────────────────

export type ChallengePhase =
  | 'FRAMEWORK_SELECTION'
  | 'GENERATING_TOPICS'
  | 'TOPIC_SELECTION'
  /**
   * 5-second read-only transition: the selected topic is displayed so the
   * user can read it before the preparation timer starts. NOT preparation time.
   * Automatically advances to PREPARATION via TOPIC_DISPLAY_COMPLETE.
   */
  | 'TOPIC_DISPLAY'
  | 'CHALLENGE_SCREEN'   // kept for backward compat; not used in normal flow
  | 'PREPARATION'
  | 'RECORDING'
  | 'ANALYZING'
  | 'FEEDBACK';

export interface ChallengeFlowState {
  phase: ChallengePhase;
  frameworkSlots: FrameworkSlot[];        // shuffled client-side from static Framework Pool
  topicSlots: TopicSlot[];                // populated from /api/generate-topics response
  selectedFramework: Framework | null;
  selectedTopic: GeneratedTopic | null;
  audioBlob: Blob | null;
  evaluationResult: EvaluationResult | null;
  topicGenerationError: TopicGenerationError | null;
  phaseError: string | null;              // per-phase recoverable error
}

export type ChallengeFlowAction =
  | { type: 'SELECT_FRAMEWORK'; framework: Framework }
  | { type: 'CONFIRM_FRAMEWORK' }
  | { type: 'TOPICS_GENERATED'; topicSlots: TopicSlot[] }
  | { type: 'TOPIC_GENERATION_ERROR'; error: TopicGenerationError }
  | { type: 'RETRY_TOPIC_GENERATION' }
  | { type: 'SELECT_TOPIC'; topic: GeneratedTopic }
  | { type: 'CONFIRM_TOPIC' }
  /**
   * Fired automatically by TopicDisplay after the 5-second read period ends.
   * Transitions TOPIC_DISPLAY → PREPARATION. Does NOT start the prep timer
   * (that happens automatically when PreparationPhase mounts).
   */
  | { type: 'TOPIC_DISPLAY_COMPLETE' }
  | { type: 'PREP_COMPLETE' }
  | { type: 'SKIP_PREP' }
  /** Adds 30 seconds to the remaining preparation time. Timer keeps running. */
  | { type: 'ADD_PREPARATION_TIME' }
  | { type: 'RECORDING_COMPLETE'; audioBlob: Blob }
  | { type: 'SUBMIT_FOR_ANALYSIS' }
  /**
   * Fired automatically by RecordingPhase when the 60-second timer expires.
   * Stores the completed audio blob and transitions directly to ANALYZING.
   */
  | { type: 'RECORDING_TIMER_COMPLETE'; audioBlob: Blob }
  | { type: 'ANALYSIS_SUCCESS'; evaluation: Evaluation }
  | { type: 'ANALYSIS_ERROR'; error: EvaluationError }
  | { type: 'RETRY_SUBMISSION' }
  | { type: 'RE_RECORD' }
  | { type: 'START_NEW_CHALLENGE' }
  /**
   * Dispatched by RecordingPhase when client-side silence detection finds
   * no meaningful audio activity. Stays in RECORDING phase and surfaces an
   * error; does NOT advance to ANALYZING or call /api/evaluate.
   */
  | { type: 'SILENCE_DETECTED' };
