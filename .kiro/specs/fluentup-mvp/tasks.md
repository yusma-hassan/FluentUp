# Implementation Plan: FluentUp MVP-0

## Overview

Build the complete FluentUp MVP-0 application from scratch: a stateless, single-session communication training loop using Next.js 14 App Router, TypeScript (strict), Tailwind CSS, and Google Gemini 2.5 Flash. The implementation follows a bottom-up order — scaffolding → shared types → business logic → API routes → UI components → wiring → deployment. Property-based tests using fast-check are placed immediately after the code they verify.

---

## Tasks

- [x] 1. Initialize project and configure tooling
  - [x] 1.1 Scaffold Next.js 14 App Router project with TypeScript strict mode and Tailwind CSS
    - Run `npx create-next-app@latest` with `--typescript`, `--app`, `--tailwind`, `--src-dir` flags
    - Confirm `tsconfig.json` has `"strict": true`
    - Remove boilerplate content from `src/app/page.tsx` and `src/app/layout.tsx`
    - _Requirements: 11.1 (single-page app, no reload between phases)_

  - [x] 1.2 Install runtime and development dependencies
    - Add `@google/genai` (Gemini SDK) as a runtime dependency
    - Add `fast-check` as a dev dependency for property-based tests
    - Add `jest`, `@testing-library/react`, `@testing-library/jest-dom`, `ts-jest`, and `jest-environment-jsdom` as dev dependencies
    - Configure `jest.config.ts` for Next.js with `testEnvironment: 'jsdom'` for UI tests and `node` for server-side tests
    - _Requirements: 6.1 (AI service layer), 9.1 (server-side API routes)_

  - [x] 1.3 Create environment configuration files
    - Create `.env.example` listing `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL`, `AI_TIMEOUT_MS` with placeholder values
    - Verify `.gitignore` includes `.env.local` and `.env*.local`
    - Create `.env.local` (not committed) with actual `AI_API_KEY=<your_key>`, `AI_MODEL=gemini-2.5-flash`
    - _Requirements: 6.3 (env var config), 9.2 (no client bundle exposure), 9.6 (`.env.example`)_

- [x] 2. Define core TypeScript types
  - [x] 2.1 Create `src/types/index.ts` with all shared type definitions
    - Define `EvaluationCriterion`, `Framework`, `Topic`, `GeneratedTopic` interfaces
    - Define `TopicGenerationRequest`, `TopicGenerationResult`, `TopicGenerationError`, `TopicGenerationResponse` types
    - Define `NumberedSlot<T>`, `FrameworkSlot`, `TopicSlot` types
    - Define `ChallengeContext` interface
    - Define `CategoryScore`, `Evaluation`, `EvaluationError`, `EvaluationResult` types
    - Define the `ChallengePhase` union type (all 8 phases: `FRAMEWORK_SELECTION` | `GENERATING_TOPICS` | `TOPIC_SELECTION` | `CHALLENGE_SCREEN` | `PREPARATION` | `RECORDING` | `ANALYZING` | `FEEDBACK`)
    - Define `ChallengeFlowState` and `ChallengeFlowAction` discriminated union (all 15 action types)
    - _Requirements: 6.2 (Evaluation schema), 7.4 (Evaluation fields), 10.2 (Framework fields), 11.1 (phase sequence)_

- [x] 3. Build the Framework data layer
  - [x] 3.1 Create `src/lib/challenge-pool/frameworks.ts` with PREP and What-So-What-Now-What frameworks
    - Define the `FRAMEWORKS` constant array typed as `Framework[]`
    - PREP entry: id `'prep'`, 4 structural steps, 6 evaluation criteria (prep_point, prep_reason, prep_example, prep_restate, relevance, clarity), `preparationTimeSeconds: 15`, `speakingTimeSeconds: 60`
    - What-So-What-Now-What entry: id `'what_so_what_now_what'`, 3 structural steps, 5 evaluation criteria (wsnw_what, wsnw_sowhat, wsnw_nowwhat, relevance, clarity), same time values
    - _Requirements: 1.2 (PREP required), 10.1 (static typed pool), 10.4 (PREP + What-So-What-Now-What), 10.2 (all required fields)_

  - [x] 3.2 Create `src/lib/challenge-pool/index.ts` with startup validation
    - Import `FRAMEWORKS` from `frameworks.ts`
    - Implement `validateFrameworks(frameworks: Framework[]): Framework[]` that checks each entry for required fields (`id`, `name`, `description`, `structuralSteps`, `evaluationCriteria`, `preparationTimeSeconds`, `speakingTimeSeconds`) — all must be present and non-empty/non-zero
    - For each invalid entry, call `console.error` with the framework id and the missing field name
    - Export `ACTIVE_FRAMEWORKS` as the validated subset
    - _Requirements: 10.7 (startup validation, log + exclude malformed entries)_

  - [x] 3.3 Write property test for Challenge Pool startup validation (P11)
    - **Property 11: Pool startup validation excludes all malformed entries**
    - Generate arbitrary `Framework[]` arrays where some entries are missing required fields using fast-check arbitraries
    - Assert that `validateFrameworks` returns only entries where every required field is present and non-empty
    - Assert no malformed entry ever appears in the result
    - Tag: `// Feature: fluentup-mvp, Property 11: Pool startup validation`
    - _Requirements: 10.7_

- [x] 4. Build the random slot assignment utility
  - [x] 4.1 Create `src/lib/random-selector.ts` with `assignSlots`
    - Implement `assignSlots<T>(items: T[]): NumberedSlot<T>[]` that shuffles items using `Array.sort(() => Math.random() - 0.5)` and maps each to `{ slot: i + 1, item }`
    - Export `assignSlots`
    - _Requirements: 1.3 (randomized order), 1.5 (shuffled into slots), 2.1 (numbered topic slots)_

  - [x] 4.2 Write property test for `assignSlots` (P1)
    - **Property 1: Slot shuffling produces a valid, complete assignment**
    - Generate arbitrary arrays of 1–10 items (strings, numbers, objects) via fast-check
    - Assert output length equals input length
    - Assert slot numbers form the set `{1, 2, ..., N}` with no duplicates
    - Assert every input item appears in the output exactly once
    - Tag: `// Feature: fluentup-mvp, Property 1: Slot shuffling completeness`
    - _Requirements: 1.3, 1.5, 1.7, 2.1, 2.5_

- [ ] 5. Build the AI service layer
  - [x] 5.1 Create `src/lib/ai/types.ts` with AI-specific interfaces
    - Define `AIEvaluationRequest` interface: `audioBlob: Buffer`, `audioMimeType: string`, `frameworkId: string`, `frameworkName: string`, `evaluationCriteria: EvaluationCriterion[]`, `topicText: string`
    - Define `AIProvider` interface: `readonly id: string`, `evaluate(request: AIEvaluationRequest): Promise<EvaluationResult>`
    - _Requirements: 6.1 (unified AI interface), 6.2 (returns Evaluation schema)_

  - [x] 5.2 Create `src/lib/ai/gemini-provider.ts` implementing `AIProvider`
    - Read `AI_API_KEY`, `AI_MODEL`, `AI_TIMEOUT_MS` from `process.env`
    - Implement `evaluate(request: AIEvaluationRequest): Promise<EvaluationResult>`:
      - Base64-encode `request.audioBlob`
      - Build evaluation prompt using `request.evaluationCriteria` array only — no `if (frameworkId === 'prep')` branching
      - Call Gemini with `response_mime_type: 'application/json'`, audio inline as base64 `inlineData` part
      - Enforce 30-second timeout using `AbortController`; on timeout return `{ success: false, error: { type: 'TIMEOUT', message: '...' } }`
      - Validate response against `Evaluation` schema; on mismatch return `{ success: false, error: { type: 'SCHEMA_MISMATCH', ... } }`
      - On network/HTTP error return `{ success: false, error: { type: 'PROVIDER_ERROR', message: 'The AI service is unavailable. Please try again.' } }` — strip all raw provider details from `message`
    - _Requirements: 6.7 (structured error on HTTP failure), 6.8 (schema mismatch error), 7.2 (framework-criteria-driven eval), 7.7 (30s timeout), 7.8 (criteria from pool, no hardcoding), 9.2 (server-side only)_

  - [x] 5.3 Write property test for evaluation schema constraints (P3)
    - **Property 3: Evaluation output satisfies schema constraints**
    - Generate varied mock `AIEvaluationRequest` inputs via fast-check
    - Use a mock provider that returns varied valid-looking JSON
    - Assert every success-path result has all required fields, `overallScore` is a number, `categoryScores` entries have `score`, `strengths` has 1–5 items, `weaknesses` has 1–5 items, `suggestions` has 1–3 items, `frameworkFeedback` and `exampleResponse` are non-empty strings
    - Assert JSON round-trip produces structurally equivalent value
    - Tag: `// Feature: fluentup-mvp, Property 3: Evaluation schema constraints`
    - _Requirements: 6.2, 7.4, 6.8_

  - [x] 5.4 Write property test for score bounds (P4)
    - **Property 4: Server-side score bounds are always in range**
    - Generate `Evaluation` objects with varied numeric fields via fast-check
    - Assert `overallScore` is in `[0, 100]`
    - Assert every `categoryScores[i].score` is in `[0, 100]`
    - Tag: `// Feature: fluentup-mvp, Property 4: Score bounds`
    - _Requirements: 7.4, 7.5_

  - [x] 5.5 Write property test for AI prompt derivation (P5)
    - **Property 5: AI prompt is fully derived from Framework criteria with no hardcoded framework names**
    - Generate arbitrary `Framework` entries with varied `evaluationCriteria` arrays (1–10 criteria) via fast-check
    - Invoke the internal prompt-builder function exported for testing
    - Assert every `criterion.description` string appears in the constructed prompt string
    - Assert the source of `GeminiProvider` (read as a string) contains no literal framework id values such as `'prep'` or `'what_so_what_now_what'` inside conditional branches
    - Tag: `// Feature: fluentup-mvp, Property 5: Prompt derivation from criteria`
    - _Requirements: 7.8, 10.3_

  - [x] 5.6 Write property test for AI error isolation (P10)
    - **Property 10: AI Service never exposes raw provider error details to callers**
    - Generate varied fake provider error bodies (HTTP status codes, random JSON, partial API key fragments) via fast-check
    - Invoke `GeminiProvider.evaluate` with a mocked HTTP layer that returns these error bodies
    - Assert that `EvaluationError.message` contains none of the raw provider-sourced strings
    - Assert `message` is a generic user-facing string
    - Tag: `// Feature: fluentup-mvp, Property 10: AI error isolation`
    - _Requirements: 6.7, 9.7_

  - [x] 5.7 Create `src/lib/ai/topic-generation-service.ts`
    - Read `AI_API_KEY`, `AI_MODEL`, `AI_TIMEOUT_MS` from `process.env`
    - Implement `generateTopics(request: TopicGenerationRequest): Promise<TopicGenerationResponse>`:
      - Build prompt including framework name, description, structural steps, and evaluation criteria; request exactly 10 topics as `{ "topics": [{ "text": "..." }, ...] }`
      - Call Gemini with `response_mime_type: 'application/json'`; enforce 30-second timeout
      - Validate response: exactly 10 topics (if more, truncate to first 10; if fewer, return `INSUFFICIENT_TOPICS` error); non-empty text; no duplicate text values (case-insensitive, return `DUPLICATE_TOPICS` error)
      - Assign sequential IDs `generated-1` through `generated-10`
      - Wrap all errors as `TopicGenerationError` with typed `type` and user-facing `message`
    - _Requirements: 2.1 (10 topics), 2.3 (variety), 2.4 (reveal on selection), 2.5 (5–10 slots), 6.6 (structured JSON), 6.7 (wrapped errors)_

  - [x] 5.8 Write property test for topic generation validation (P2)
    - **Property 2: Topic generation validation enforces exactly 10 distinct topics**
    Topic generation validation SHALL require at least 10 valid, distinct topics from the AI response.
- If the AI returns more than 10 valid, distinct topics, the service SHALL use the first 10 and discard the rest.
- If the AI returns fewer than 10 valid topics, the service SHALL reject the response and retry generation.
- If the response contains duplicate or invalid topics such that fewer than 10 valid, distinct topics remain, the service SHALL reject the response and retry generation.
- The final TopicGenerationResult returned to the client SHALL always contain exactly 10 valid, distinct topics.
- The service SHALL never pad the result with fabricated, static, or previously generated topics.
    - Tag: `// Feature: fluentup-mvp, Property 2: Topic generation validation`
    - _Requirements: 2.1, 2.4, 2.5, 6.6, 6.7_


    TopicGenerationService SHALL remain a separate service from the evaluation AI service.

TopicGenerationService is responsible only for generating and validating practice topics.

The evaluation AI service/provider is responsible only for analyzing the user's recorded response and producing structured feedback.

The two services SHALL have separate responsibilities, request/result types, and API routes:

- POST /api/generate-topics → TopicGenerationService
- POST /api/evaluate → AI evaluation service/provider

Topic generation logic SHALL NOT be implemented inside GeminiProvider.evaluate(), and evaluation logic SHALL NOT be implemented inside TopicGenerationService.

Both services may use the same configured Gemini model and API key, but they SHALL remain logically and architecturally separate.

  - [x] 5.9 Create `src/lib/ai/ai-service.ts` factory
    - Implement `createAIProvider(): AIProvider` that returns `new GeminiProvider()`
    - Add a comment noting that future providers would be selected via `AI_PROVIDER` env var
    - _Requirements: 6.3 (provider via env), 6.4 (swappable without UI changes)_

- [x] 6. Build server-side validation helpers
  - [x] 6.1 Create `src/lib/validation.ts` with reusable validators
    - Implement `validateFrameworkId(frameworkId: unknown, pool: Framework[]): Framework | null` — returns the matching Framework or null
    - Implement `validateAudioPayload(file: { type: string; size: number } | null): string | null` — returns an error string or null on success; checks file present, `content-type` starts with `audio/`, size ≤ 25 MB (26,214,400 bytes)
    - Implement `validateTopicText(text: unknown): string | null` — checks present and non-empty, max 500 chars
    - _Requirements: 9.3, 9.4, 9.5, 9.8_

- [x] 7. Build Next.js API routes
  - [x] 7.1 Create `src/app/api/generate-topics/route.ts`
    - Handle `POST` only; parse JSON body; extract `frameworkId`
    - Validate `frameworkId` against `ACTIVE_FRAMEWORKS`; return HTTP 400 `{ error: string }` on failure
    - Build `TopicGenerationRequest` from the matched `Framework`
    - Call `generateTopics`; on success return HTTP 200 `{ success: true, result: TopicGenerationResult }`; on error return HTTP 200 `{ success: false, error: TopicGenerationError }`
    - On unexpected exception return HTTP 500 `{ error: 'An unexpected error occurred.' }` with no internal details
    - _Requirements: 9.1 (server-side), 9.4 (validate frameworkId), 9.5 (400 on bad payload)_

  - [x] 7.2 Create `src/app/api/evaluate/route.ts`
    - Handle `POST` only; parse `multipart/form-data` using `request.formData()`
    - Run validation sequence in order: audio present + `audio/*` content-type → audio size ≤ 25 MB → `frameworkId` in pool → `topicText` non-empty; return HTTP 400 with specific user-facing error string on first failure
    - Convert audio `File` to `Buffer`; build `AIEvaluationRequest`
    - Call `createAIProvider().evaluate()`; return HTTP 200 with `EvaluationResult` (both success and AI error paths)
    - On unexpected exception return HTTP 500 `{ error: 'An unexpected error occurred.' }`
    - _Requirements: 7.5 (scores server-side), 9.1–9.8_

  - [ ] 7.3 Write property test for audio payload rejection (P6)
    - **Property 6: API route rejects oversized or absent audio before calling AI**
    - Generate byte-array sizes spanning [0, 30 MB] and varied content-type strings via fast-check
    - Invoke `validateAudioPayload` directly; also invoke the route handler with mocked `Request` objects
    - Assert HTTP 400 and zero AI calls for: absent audio, non-`audio/*` content type, size > 25 MB
    - Assert no AI invocation occurs on any rejection path
    - Tag: `// Feature: fluentup-mvp, Property 6: Audio payload rejection`
    - _Requirements: 9.3, 9.5, 9.8_

  - [ ] 7.4 Write property test for framework ID rejection (P7)
    - **Property 7: API route rejects unknown framework IDs before calling AI**
    - Generate arbitrary strings not in `ACTIVE_FRAMEWORKS` as `frameworkId` via fast-check
    - Invoke `validateFrameworkId` directly; also invoke both route handlers with these IDs
    - Assert HTTP 400 and zero AI calls for any unrecognized ID
    - Tag: `// Feature: fluentup-mvp, Property 7: Framework ID rejection`
    - _Requirements: 9.4, 9.5_

- [x] 8. Checkpoint — verify server-side layer
  - Ensure all server-side tests pass (`jest --testPathPattern='lib|api'`)
  - Confirm TypeScript compiles with no errors (`tsc --noEmit`)
  - Ask the user if any questions arise before proceeding to the UI layer.

- [x] 9. Implement client-side state machine
  - [x] 9.1 Create the `ChallengeFlowContext` and `useChallengeFlow` hook in `src/components/layout/ChallengeContext.tsx`
    - Implement the `challengeFlowReducer` handling all action types from `ChallengeFlowAction`
    - `CONFIRM_FRAMEWORK` → phase `GENERATING_TOPICS`; trigger `/api/generate-topics` call via `useEffect`/side-effect dispatcher; on success dispatch `TOPICS_GENERATED`; on failure dispatch `TOPIC_GENERATION_ERROR`
    - `TOPICS_GENERATED` → populate `topicSlots`, phase `TOPIC_SELECTION`
    - `TOPIC_GENERATION_ERROR` → store `topicGenerationError`, stay in `GENERATING_TOPICS`
    - `RETRY_TOPIC_GENERATION` → clear error, re-enter `GENERATING_TOPICS`, retry the API call
    - `CONFIRM_TOPIC` → phase `CHALLENGE_SCREEN`, then immediately `PREPARATION`
    - `PREP_COMPLETE` / `SKIP_PREP` → phase `RECORDING`
    - `ADD_PREPARATION_TIME` → no-op in reducer; `addTime(15)` is handled entirely by the `useCountdown` hook in `PreparationPhase`; action is included for state-machine completeness
    - `RECORDING_COMPLETE` → store `audioBlob`
    - `RECORDING_TIMER_COMPLETE` → store `audioBlob` AND advance phase to `ANALYZING` atomically (single reducer case; no separate `SUBMIT_FOR_ANALYSIS` needed in normal flow)
    - `SUBMIT_FOR_ANALYSIS` → phase `ANALYZING`; call `/api/evaluate`; dispatch `ANALYSIS_SUCCESS` or `ANALYSIS_ERROR`
    - `ANALYSIS_SUCCESS` / `ANALYSIS_ERROR` → phase `FEEDBACK`
    - `RETRY_SUBMISSION` → phase `ANALYZING`, re-use existing `audioBlob`
    - `RE_RECORD` → phase `RECORDING`, clear `audioBlob`
    - `START_NEW_CHALLENGE` → reset to `FRAMEWORK_SELECTION`, call `assignSlots` to reshuffle framework slots
    - Export `ChallengeFlowContext`, `ChallengeFlowProvider`, `useChallengeFlow` hook
    - _Requirements: 11.1–11.8 (full sequential flow), 11.8 (per-phase error recovery without navigation back)_

  - [x] 9.2 Write property test for state machine phase validity (P8)
    - **Property 8: Challenge flow reducer only produces valid phase values**
    - Generate arbitrary sequences of `ChallengeFlowAction` values applied to varied `ChallengeFlowState` starting states via fast-check
    - `arbAction` generator covers all action types including `ADD_PREPARATION_TIME` and `RECORDING_TIMER_COMPLETE`
    - Assert after every action the resulting `phase` is one of the 8 valid `ChallengePhase` literals
    - Assert the reducer never throws
    - Tag: `// Feature: fluentup-mvp, Property 8: State machine phase validity`
    - _Requirements: 11.1, 11.8_

- [x] 10. Implement custom hooks
  - [x] 10.1 Create `src/hooks/useCountdown.ts`
    - Implement `useCountdown(totalSeconds: number, onComplete: () => void)` returning `{ remaining, running, skip, addTime }`
    - Use `setInterval` that decrements `remaining` once per second; call `onComplete` and clear interval when `remaining` reaches 0; completion fires synchronously (no nested setTimeout)
    - Timer starts automatically on mount — `running` is a read-only output (true while interval active), not a start trigger
    - `skip()` calls `onComplete` immediately and clears the interval; sets `running` to false
    - `addTime(seconds)` adds seconds to the current remaining time; the interval keeps running without restarting
    - `addTime` is a no-op when remaining is already 0 (timer complete)
    - Clean up interval on unmount via `useEffect` return
    - _Requirements: 4.1–4.10 (prep timer), 5.4–5.6 (recording timer)_

  - [x] 10.2 Create `src/hooks/useAudioRecorder.ts`
    - Implement `useAudioRecorder()` returning `{ state, startRecording, stopRecording, audioBlob, durationMs, error, shortRecordingWarning }`
    - `state`: `'idle' | 'requesting' | 'recording' | 'stopped' | 'error'`
    - `startRecording()`: calls `getUserMedia({ audio: true })`; on denial set `state = 'error'` with mic-denied message
    - Format selection: try `audio/webm;codecs=opus`, `audio/webm`, `audio/ogg;codecs=opus`, `audio/wav` in order using `MediaRecorder.isTypeSupported`
    - Assemble `Blob` from `ondataavailable` chunks on `onstop`; track `durationMs` from start to stop timestamp
    - Set `shortRecordingWarning = true` when `durationMs < 3000`
    - Handle `onerror` and mid-recording data loss: set `state = 'error'` with mic-disconnect message
    - _Requirements: 5.1–5.12_

  - [x] 10.3 Write property test for short recording warning (P9)
    - **Property 9: Short recording always surfaces a warning**
    - Generate recording duration values in `[0, 2999]` ms via fast-check
    - Invoke the hook's internal `computeShortRecordingWarning(durationMs)` helper (exported for testing)
    - Assert `shortRecordingWarning = true` for all values in `[0, 2999]`
    - Assert `shortRecordingWarning = false` for values ≥ 3000
    - Tag: `// Feature: fluentup-mvp, Property 9: Short recording warning`
    - _Requirements: 5.11_

  - [x] 10.4 Write unit tests for `useCountdown` — `src/hooks/__tests__/useCountdown.test.ts`
    - 13 tests covering: auto-start (running=true immediately, initialises to totalSeconds, decrements per second), addTime (adds exactly N seconds, timer continues after addTime, multiple addTime calls accumulate, no-op when complete), skip (fires onComplete immediately, stops interval so onComplete not called again), automatic completion at zero (fires onComplete at zero, does NOT fire before zero, sets running=false), cleanup on unmount (onComplete not called after unmount)
    - Uses `jest.useFakeTimers()` and `@testing-library/react` `renderHook`/`act`
    - _Requirements: 4.1–4.10, 5.4–5.9_

  - [x] 10.5 Write unit tests for recording flow reducer — `src/components/layout/__tests__/recordingFlow.test.ts`
    - 11 tests covering: RECORDING_TIMER_COMPLETE (stores blob + transitions to ANALYZING, skips intermediate phases, preserves framework and topic), ADD_PREPARATION_TIME (no-op — phase stays PREPARATION, no other fields modified), full automatic flow sequence (CONFIRM_TOPIC → CHALLENGE_SCREEN, PREP_COMPLETE → RECORDING, SKIP_PREP → RECORDING, RECORDING_TIMER_COMPLETE → ANALYZING, full sequence TOPIC_SELECTION → ANALYZING, Add Time + Skip combination), no manual stop/submit path (RECORDING_TIMER_COMPLETE stores blob atomically without SUBMIT_FOR_ANALYSIS)
    - _Requirements: 4.9, 5.6, 5.9, 11.1–11.4_

- [x] 11. Build shared UI components
  - [x] 11.1 Create `src/components/ui/NumberedGrid.tsx`
    - Accept `NumberedGridProps`: `count`, `onSelect`, `selectedSlot`, `revealedLabel`, `disabled`
    - Render `count` numbered buttons in a responsive grid; show `revealedLabel` on the selected button after selection; disable all buttons when `disabled` is true or after a slot is revealed
    - _Requirements: 1.1 (hidden until selected), 1.6 (reveal on selection), 2.1 (topic grid), 2.6 (no text before selection)_

  - [x] 11.2 Create `src/components/ui/CountdownTimer.tsx`
    - Accept `CountdownTimerProps`: `totalSeconds`, `onComplete`, `running`
    - Use `useCountdown` hook internally; display remaining whole seconds
    - _Requirements: 4.3 (prep countdown display), 5.5 (recording countdown display)_

  - [x] 11.3 Create `src/components/ui/ScoreCard.tsx`
    - Accept a `CategoryScore` prop; render label and score (0–100) with a visual bar or indicator
    - _Requirements: 8.2 (per-category scores displayed)_

  - [x] 11.4 Create `src/components/ui/LoadingIndicator.tsx`
    - Render a spinner/animated indicator with an optional message prop
    - _Requirements: 11.6 (loading indicator while AI processes)_

  - [x] 11.5 Create `src/components/ui/ErrorMessage.tsx`
    - Accept `message: string` and optional `onRetry: () => void`; render error text and a retry button if `onRetry` is provided
    - _Requirements: 11.8 (per-phase error display with retry)_

- [x] 12. Build phase components
  - [x] 12.1 Create `src/components/phases/FrameworkSelection.tsx`
    - Consume `useChallengeFlow`; read `frameworkSlots` from state
    - Render `<NumberedGrid count={frameworkSlots.length} ... />` with hidden framework names
    - On slot selection dispatch `SELECT_FRAMEWORK`; reveal framework name and ≤50-word description
    - Enable proceed button after selection; on proceed dispatch `CONFIRM_FRAMEWORK`
    - _Requirements: 1.1, 1.6, 1.7, 1.8, 1.9_

  - [x] 12.2 Create `src/components/phases/TopicSelection.tsx`
    - Consume `useChallengeFlow`; read `topicSlots` from state
    - Render `<NumberedGrid count={topicSlots.length} ... />` with hidden topic text
    - On selection dispatch `SELECT_TOPIC`; reveal topic text within 1 second
    - Enable proceed button after selection; on proceed dispatch `CONFIRM_TOPIC`
    - _Requirements: 2.1, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [x] 12.3 Create `src/components/phases/ChallengeScreen.tsx`
    - Consume `useChallengeFlow`; read `selectedFramework` and `selectedTopic`
    - Display: framework name, structural steps as a numbered list, topic text, preparation time (15s), speaking time (60s)
    - Dispatch `PREP_COMPLETE` via `onComplete` callback — the phase transition to `PREPARATION` and auto-timer start is handled by the context
    - If `selectedFramework` or `selectedTopic` is null, dispatch navigation back to topic selection and show `<ErrorMessage>`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 12.4 Create `src/components/phases/PreparationPhase.tsx`
    - Consume `useChallengeFlow`; read `selectedFramework` and `selectedTopic`
    - Use `useCountdown` directly (not `<CountdownTimer>`) to access `addTime`, which is not exposed through the CountdownTimer component interface
    - Timer starts automatically on mount — no user action required (Req 4.1, 4.7, 4.8)
    - Render "+15s Preparation" button that calls `addTime(15)` and dispatches `ADD_PREPARATION_TIME` (no-op in reducer; kept for action-log completeness)
    - Render "Skip Preparation" button that calls `skip()` which fires `onComplete` → dispatches `PREP_COMPLETE`
    - Display framework name, structural requirements, and topic text throughout
    - NO "Start Recording" or equivalent button
    - _Requirements: 4.1–4.10_

  - [x] 12.5 Create `src/components/phases/RecordingPhase.tsx`
    - Use `useAudioRecorder` internally
    - On mount call `startRecording()` automatically inside `useEffect([], [])` — no user action required (Req 5.3, 5.7)
    - Display pulsing recording indicator and "Recording" label while `state === 'recording'`
    - Render `<CountdownTimer totalSeconds={60} onComplete={stopRecording} running={true} />` — timer auto-starts and calls `stopRecording` at zero (Req 5.4, 5.6)
    - When `recState === 'stopped'` and `audioBlob` is ready, dispatch `RECORDING_TIMER_COMPLETE` automatically via a `useEffect` — transitions directly to ANALYZING (Req 5.9)
    - NO stop button, NO submit button, NO short-recording warning in the normal path
    - When `state === 'error'`: render `<ErrorMessage>` with mic-denied or mic-disconnected message and re-record option
    - _Requirements: 5.1–5.12_

  - [x] 12.6 Create `src/components/phases/FeedbackScreen.tsx`
    - Consume `useChallengeFlow`; read `evaluationResult`, `selectedFramework`, `selectedTopic`
    - Success path: display overall score prominently, `<ScoreCard>` for each category score, strengths list, weaknesses list, framework-specific feedback with framework name label, suggestions list, example stronger response, framework name + topic header
    - Error path: display `<ErrorMessage message={error.message} onRetry={() => dispatch({ type: 'RETRY_SUBMISSION' })} />`
    - "Try Again" button dispatches `START_NEW_CHALLENGE`
    - _Requirements: 8.1–8.10_

- [x] 13. Wire pages and context
  - [x] 13.1 Create `src/app/challenge/page.tsx` as the main challenge shell
    - Wrap content in `<ChallengeFlowProvider>`
    - Read `phase` from `useChallengeFlow` and render the appropriate phase component:
      - `FRAMEWORK_SELECTION` → `<FrameworkSelection />`
      - `GENERATING_TOPICS` → `<LoadingIndicator message="Generating topics..." />` with `topicGenerationError` check → `<ErrorMessage onRetry={() => dispatch({ type: 'RETRY_TOPIC_GENERATION' })} />`
      - `TOPIC_SELECTION` → `<TopicSelection />`
      - `CHALLENGE_SCREEN` → `<ChallengeScreen />`
      - `PREPARATION` → `<PreparationPhase />`
      - `RECORDING` → `<RecordingPhase />`
      - `ANALYZING` → `<LoadingIndicator message="Analyzing your response..." />`
      - `FEEDBACK` → `<FeedbackScreen />`
    - Render a context strip when both `selectedFramework` and `selectedTopic` are set: display framework name and topic text as a persistent header
    - _Requirements: 11.1 (no page reload), 11.5 (context strip between phases), 11.6 (loading indicator during AI analysis)_

  - [x] 13.2 Update `src/app/page.tsx` (home/landing page)
    - Render the app title and tagline
    - Render a "Start Challenge" link/button pointing to `/challenge`
    - _Requirements: 11.1 (entry point to challenge flow)_

  - [x] 13.3 Wrap `src/app/challenge/page.tsx` with a React error boundary
    - Create an `ErrorBoundary` class component (or use a library) that catches unhandled render errors
    - Render a full-page fallback with the error message and a "Start Over" link pointing to `/`
    - _Requirements: 11.8 (phase error handling), 9.7 (no internal details exposed)_

  - [x] 13.4 Update `src/app/layout.tsx` with global styles and metadata
    - Set `<title>FluentUp</title>` and a brief `<meta name="description">`
    - Import global Tailwind CSS
    - _Requirements: 11.1 (app-level layout)_

- [x] 14. Checkpoint — full integration verification
  - Ensure all tests pass (`jest --runInBand`)
  - Confirm TypeScript compiles with no errors (`tsc --noEmit`)
  - Manually verify the end-to-end flow: Framework Selection → Topic Generation → Topic Selection → Preparation → Recording → Feedback
  - Ask the user if any questions arise before proceeding to deployment configuration.

- [x] 15. Deployment configuration
  - [x] 15.1 Create/update `next.config.ts` for production
    - Ensure no `NEXT_PUBLIC_AI_*` variables are referenced anywhere
    - Set any required Vercel-specific Next.js config (e.g., `serverExternalPackages` for `@google/generative-ai` if needed)
    - _Requirements: 9.2 (no client-side AI key exposure)_

  - [x] 15.2 Verify Vercel deployment readiness
    - Confirm `package.json` `build` script runs `next build` cleanly
    - Ensure `.env.example` documents all variables needed for Vercel environment configuration
    - Confirm `AI_API_KEY`, `AI_MODEL`, `AI_TIMEOUT_MS` are ready to be added as Vercel environment variables
    - _Requirements: 6.3 (env-var config), 9.6 (`.env.example`)_

- [x] 16. Final checkpoint — production build
  - Run `next build` and confirm zero errors and zero TypeScript diagnostics
  - Run the full test suite one final time
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP; core behavior is covered by non-optional tasks
- Each task references specific requirements clauses for traceability
- The 11 property-based tests (P1–P11) use fast-check with a minimum of 100 iterations each and carry the tag `// Feature: fluentup-mvp, Property N: ...`
- Checkpoints (tasks 8, 14, 16) are gates that must pass before moving to the next layer
- All Gemini API calls are server-side only — no `NEXT_PUBLIC_` env vars, no client-bundle inclusion
- Audio evaluation uses a single native multimodal Gemini call (audio + prompt in one request); no separate transcription step
- The `useChallengeFlow` hook owns all side effects (API calls); phase components only dispatch actions
- `CHALLENGE_SCREEN` and `PREPARATION` are two distinct phases but the preparation timer starts automatically as part of entering `PREPARATION` — no user confirmation required

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["3.1", "4.1", "5.1"] },
    { "id": 3, "tasks": ["3.2", "4.2", "5.2", "6.1"] },
    { "id": 4, "tasks": ["3.3", "5.3", "5.4", "5.7"] },
    { "id": 5, "tasks": ["5.5", "5.6", "5.8", "5.9", "7.1", "7.2"] },
    { "id": 6, "tasks": ["5.8", "7.3", "7.4", "9.1"] },
    { "id": 7, "tasks": ["9.2", "10.1", "10.2"] },
    { "id": 8, "tasks": ["10.3", "10.4", "10.5", "11.1", "11.2", "11.3", "11.4", "11.5"] },
    { "id": 9, "tasks": ["12.1", "12.2", "12.3", "12.4", "12.5", "12.6"] },
    { "id": 10, "tasks": ["13.1", "13.2", "13.3", "13.4"] },
    { "id": 11, "tasks": ["15.1", "15.2"] }
  ]
}
```
