# Requirements Document

## Introduction

FluentUp MVP-0 is a web-based communication training application that guides a user through a single, complete training loop: random framework selection → random topic selection → preparation → voice recording → AI analysis → structured feedback. The system's core philosophy is "train yourself to communicate when you don't have time to prepare." The random challenge system enforces this by hiding both the framework and the topic behind numbered selections, preventing users from gravitating toward comfortable subjects. MVP-0 delivers a fully functional end-to-end vertical slice of this core loop using Next.js, TypeScript, Tailwind CSS, and a server-side AI integration layer.

---

## Glossary

- **Application**: The FluentUp MVP-0 Next.js web application running in the browser.
- **Challenge**: A single training session defined by one Framework and one Topic.
- **Framework**: A structured communication technique (e.g., PREP, What-So What-Now What) that defines how the user should organize their spoken response.
- **Topic**: A prompt or subject the user must speak about using the selected Framework.
- **Challenge_Pool**: The static, server-side data store containing all available Frameworks and Topics for MVP-0.
- **Random_Selector**: The server-side module responsible for randomly assigning a numbered slot to each Framework or Topic in a given session.
- **Preparation_Timer**: The countdown timer displayed during the preparation phase before recording begins.
- **Recording_Timer**: The countdown timer displayed during the voice recording phase.
- **Audio_Recorder**: The browser-side module that captures microphone input and produces an audio blob.
- **AI_Service**: The server-side abstraction layer that sends audio or transcripts to the configured AI provider and returns a structured evaluation.
- **AI_Provider**: The external AI API used for speech transcription and communication analysis (configurable via environment variables).
- **Evaluation**: The structured AI-generated assessment of the user's spoken response against the selected Framework and Topic.
- **Feedback_Screen**: The UI component that displays the Evaluation results to the user.
- **PREP**: A specific communication framework: Point, Reason, Example, Point (restatement).
- **Score**: A numeric value between 0 and 100 representing performance in a given evaluation category.
- **API_Route**: A Next.js server-side API endpoint that handles requests from the browser without exposing secrets.

---

## Requirements

### Requirement 1: Random Framework Selection

**User Story:** As a user, I want to select a framework by choosing a number rather than browsing a list, so that I am forced into spontaneous practice and cannot default to my comfort zone.

#### Acceptance Criteria

1. WHEN the user starts a new Challenge, THE Application SHALL display a numbered selection grid where each number maps to a hidden Framework, showing only the number with no Framework name or description visible.

2. THE Application SHALL include PREP as one of the available Frameworks for MVP-0.

3. WHEN a new session begins, THE Random_Selector SHALL assign the available Frameworks to numbered slots in a randomized order such that the same Framework is not intentionally fixed to the same number across sessions.

4. THE Framework Pool SHALL consist of a fixed, predefined set of communication Frameworks maintained by the Application. Frameworks SHALL NOT be newly generated for each session.

5. WHEN a new session begins, THE Application SHALL shuffle the existing Frameworks from the Framework Pool into the available numbered slots.

6. WHEN the user selects a number, THE Application SHALL reveal the Framework name and a description of no more than 50 words mapped to that number within 1 second of selection.

7. THE Application SHALL present between 5 and 10 numbered choices on the Framework selection screen, with the exact count determined by the number of available Frameworks, not exceeding 10.

8. WHEN a Framework has been revealed, THE Application SHALL enable a proceed control that navigates the user to the Topic selection screen.

9. IF the user attempts to access Framework names or descriptions before making a selection, THEN THE Application SHALL display no Framework identity information and SHALL show only the numbered slots.
---

### Requirement 2: Random Topic Selection

**User Story:** As a user, I want to receive a fresh and unfamiliar topic by choosing a number rather than browsing a list, so that I practice responding to subjects that I did not deliberately choose.

#### Acceptance Criteria

1. WHEN the user proceeds from Framework selection, THE Application SHALL provide a fresh set of Topics for the new Challenge and SHALL display them as a numbered selection grid where each number maps to a hidden Topic, with no Topic text visible.

2. WHEN a new Challenge begins, THE Application SHALL NOT reuse the same set of Topics presented in the immediately preceding Challenge.

3. THE Topic selection mechanism SHALL provide sufficient topic variety so that repeated Challenges do not routinely present the same topics to the user.

4. WHEN the user selects a number, THE Application SHALL reveal the Topic text mapped to that number within 1 second of selection.

5. THE Application SHALL present between 5 and 10 numbered Topic choices for each Challenge, with the exact count determined by the available Topic set and fixed for that Challenge once displayed.

6. THE Application SHALL NOT allow the user to view Topic text, hints, or partial text before making a selection.

7. WHEN a Topic has been revealed, THE Application SHALL enable a proceed control that navigates the user to the Challenge screen.

8. IF the user attempts to select a slot number outside the displayed range, THEN THE Application SHALL ignore the action and display no Topic information.

9. THE mechanism used to provide fresh Topics SHALL be defined during the system design phase and SHALL prioritize variety, reliability, low latency, and suitability for hackathon demonstration.
---

### Requirement 3: Challenge Screen

**User Story:** As a user, I want to see the full details of my challenge before and during preparation, so that I understand exactly what is expected of me while being placed under a defined preparation time limit.

#### Acceptance Criteria

1. WHEN the user proceeds from Topic selection, THE Application SHALL display a Challenge screen showing: the selected Framework name, the Framework's structural requirements, the selected Topic, the preparation time duration in seconds, the speaking time duration in seconds, and a numbered list of step-by-step instructions for the session.

2. THE Application SHALL display the PREP framework requirements as exactly four ordered steps: (1) State a Point, (2) give a Reason, (3) provide an Example, (4) restate the Point.

3. WHEN the Challenge Screen is displayed, THE Application SHALL immediately begin the Preparation phase and start the Preparation_Timer without requiring any user confirmation or action.

4. THE Application SHALL NOT require the user to press an "I'm Ready", "Start Preparation", or equivalent button before the Preparation_Timer begins.

5. IF the Challenge screen data is incomplete or unavailable, THEN THE Application SHALL display an error message indicating the challenge details could not be loaded and return the user to the Topic selection screen.
---

### Requirement 4: Preparation Phase

**User Story:** As a user, I want a short, automatically starting preparation period so that I can organize my thoughts under realistic time pressure before speaking.

#### Acceptance Criteria

1. WHEN the Challenge Screen is displayed, THE Preparation_Timer SHALL automatically start counting down from 15 seconds.

2. WHILE the Preparation_Timer is running, THE Application SHALL display the Framework name, Framework requirements, and Topic on the preparation screen.

3. WHILE the Preparation_Timer is running, THE Application SHALL display the remaining preparation time as a whole number of seconds, updated once per second.

4. WHEN the Preparation_Timer reaches zero, THE Application SHALL automatically transition to the Voice Input phase without requiring any user action.

5. WHILE the Preparation_Timer is running, THE Application SHALL display a visible "Skip Preparation" control that the user can activate to immediately end the remaining preparation time and transition to the Voice Input phase.

6. WHEN the user activates "Skip Preparation", THE Application SHALL immediately stop the Preparation_Timer and begin the Voice Input phase.

7. THE user SHALL NOT be required to manually start the Preparation_Timer.

8. THE user SHALL NOT be able to delay the initial start of the 15-second Preparation_Timer after the Challenge Screen is displayed.

9. WHILE the Preparation_Timer is running, THE Application SHALL display a visible "+15s Preparation" control that the user can activate to add exactly 15 seconds to the remaining preparation time. The timer SHALL continue running from the updated remaining time and SHALL NOT restart from the initial 15 seconds.

10. THE "+15s Preparation" control MAY be activated multiple times; each activation SHALL add 15 seconds to the remaining time cumulatively.
---

### Requirement 5: Voice Input and Recording

**User Story:** As a user, I want to record my spoken response automatically after the preparation period, so that I can practice responding under a fixed speaking time limit.

#### Acceptance Criteria

1. WHEN the Voice Input phase begins, THE Audio_Recorder SHALL request microphone permission from the browser.

2. IF the user denies microphone permission, THEN THE Application SHALL display an error message indicating that microphone access is required and provide instructions to enable it in browser settings.

3. WHEN microphone permission is granted, THE Audio_Recorder SHALL begin recording the user's speech automatically and display a visible recording indicator consisting of a pulsing icon and the label "Recording".

4. WHEN the Voice Input phase begins, THE Recording_Timer SHALL automatically start counting down from 60 seconds.

5. WHILE recording is active, THE Application SHALL display the remaining speaking time as a whole number of seconds, updated every second.

6. WHEN the Recording_Timer reaches zero, THE Audio_Recorder SHALL stop recording automatically and THE Application SHALL immediately submit the recorded audio for AI analysis without requiring any user action.

7. THE Application SHALL NOT require the user to press a "Start Speaking", "Stop Recording", or "Submit" button in the normal recording flow. Recording starts, times out, and submits entirely automatically.

8. THE Application SHALL NOT display a manual stop button or a manual submit button during normal recording. The user completes the full 60-second recording period automatically.

9. WHEN the Recording_Timer reaches zero and recording stops, THE Application SHALL transition directly to the AI Analysis phase, storing the audio blob and advancing the phase atomically in a single state update.

10. THE Audio_Recorder SHALL produce an audio blob encoded as WAV or WebM/Opus, matching a format accepted by the configured AI_Provider's transcription input.

11. IF the microphone is denied or becomes unavailable during an active recording, THEN THE Audio_Recorder SHALL stop recording and THE Application SHALL display an error message with an appropriate description (mic denied or mic disconnected) and offer the user the option to re-record.
---

### Requirement 6: AI Service Abstraction

**User Story:** As a developer, I want a provider-agnostic AI service layer, so that the AI model or provider can be changed without rewriting UI or business logic.

#### Acceptance Criteria

1. THE AI_Service SHALL expose a single interface that accepts: audio blob or transcript text, the selected Framework identifier, the Framework's evaluation criteria, and the selected Topic text.
2. THE AI_Service SHALL return a structured Evaluation object conforming to the defined Evaluation schema regardless of which AI_Provider is configured.
3. THE Application SHALL configure the AI_Provider and API key exclusively via environment variables (AI_API_KEY, AI_MODEL) and SHALL NOT hardcode any provider credentials or provider-specific constants in business logic or UI components.
4. WHEN the AI_Provider is changed by updating environment variables, THE AI_Service SHALL return a valid Evaluation object without requiring changes to UI components or business logic.
5. THE AI_Service SHALL select the audio-native path (audio → transcription + analysis in one call) or the two-step path (audio → transcription → text analysis) based on a provider capability flag defined in the AI_Provider configuration, not based on runtime detection.
6. THE AI_Service SHALL request structured JSON output from the AI_Provider for the Evaluation response.
7. IF the AI_Provider returns an HTTP error or connection failure, THEN THE AI_Service SHALL return a structured error object containing an error code and a human-readable message, without propagating provider-specific error details to the caller.
8. IF the AI_Provider returns a response that does not conform to the expected Evaluation JSON schema, THEN THE AI_Service SHALL return a structured error object indicating a schema mismatch, without propagating the raw response to the caller.

---

### Requirement 7: AI Evaluation

**User Story:** As a user, I want the AI to evaluate my response specifically against the framework I was given, so that feedback is targeted and actionable rather than generic.

#### Acceptance Criteria

1. WHEN the user submits a recording, THE AI_Service SHALL send the Framework identifier, the Framework's structural requirements, the Topic, and the transcribed user speech content to the AI_Provider.
2. THE AI_Service SHALL instruct the AI_Provider to evaluate the user's response against the specific Framework criteria rather than applying generic communication feedback.
3. WHEN the Framework is PREP, THE AI_Service SHALL instruct the AI_Provider to evaluate: whether a clear Point was stated, whether a Reason was provided, whether an Example was given, whether the Point was restated, relevance of the response to the Topic, clarity and structure, and overall communication quality.
4. THE AI_Service SHALL produce an Evaluation containing: an overall Score (0–100), per-category Scores (each 0–100), a list of 1 to 5 identified Strengths (each 10–200 characters), a list of 1 to 5 identified Weaknesses (each 10–200 characters), framework-specific feedback (50–500 characters), 1 to 3 actionable improvement suggestions (each 20–300 characters), and an example of a stronger response (50–500 characters) for the given Topic and Framework.
5. THE Application SHALL NOT trust or accept Score values from the client; all scoring SHALL be computed server-side within the AI_Service.
6. IF the AI_Provider returns a malformed or unparseable response, THEN THE AI_Service SHALL return a structured error indicating evaluation failure, preserve the current session state unchanged, and SHALL NOT propagate raw AI_Provider error details to the browser.
7. IF the AI_Provider does not return a response within 30 seconds of the request being sent, THEN THE AI_Service SHALL cancel the request and return a structured timeout error.
8. WHEN the Framework is not PREP, THE AI_Service SHALL derive evaluation criteria from the Framework entry's structured evaluation criteria field in the Challenge_Pool and instruct the AI_Provider to evaluate adherence to those criteria.

---

### Requirement 8: Structured Feedback Display

**User Story:** As a user, I want to see a clear, structured breakdown of my performance after speaking, so that I know exactly what I did well and how to improve.

#### Acceptance Criteria

1. WHEN the Evaluation is received, THE Feedback_Screen SHALL display the overall Score (0–100) before the category Scores on the screen.
2. WHEN the Evaluation is received, THE Feedback_Screen SHALL display each category Score on a 0–100 scale alongside its category name.
3. WHEN the Evaluation is received, THE Feedback_Screen SHALL display the list of Strengths identified by the AI.
4. WHEN the Evaluation is received, THE Feedback_Screen SHALL display the list of Weaknesses identified by the AI.
5. WHEN the Evaluation is received, THE Feedback_Screen SHALL display framework-specific feedback labeled with the name of the evaluated Framework.
6. WHEN the Evaluation is received, THE Feedback_Screen SHALL display at least one actionable improvement suggestion.
7. WHEN the Evaluation is received, THE Feedback_Screen SHALL display the example of a stronger response provided by the AI.
8. WHEN the Evaluation is received, THE Feedback_Screen SHALL display the Framework name and Topic that were evaluated.
9. WHILE the Feedback_Screen is displayed, THE Application SHALL provide a visible control that the user can activate to start a new Challenge from the beginning.
10. IF the AI analysis fails, THEN THE Feedback_Screen SHALL display an error message indicating that the analysis failed and provide a visible control to retry submission without requiring the user to re-record.

---

### Requirement 9: Server-Side API Layer and Security

**User Story:** As a developer, I want all AI API communication to occur server-side, so that API keys are never exposed to the browser.

#### Acceptance Criteria

1. THE API_Route SHALL handle all communication with the AI_Provider from the Next.js server side.
2. THE Application SHALL NOT include AI_Provider API keys, model identifiers, or provider URLs in any client-side JavaScript bundle or browser-accessible resource.
3. THE API_Route SHALL validate that the audio payload is present, has a content type of `audio/*`, and does not exceed 25 MB before forwarding it to the AI_Provider.
4. THE API_Route SHALL validate that the Framework identifier supplied by the client matches a Framework identifier that exists in the Challenge_Pool before constructing the AI evaluation prompt.
5. IF a request to the API_Route contains an invalid payload, THEN THE API_Route SHALL return an error response indicating which validation rule was violated without including internal system details, and SHALL NOT forward the request to the AI_Provider.
6. THE Application SHALL provide a `.env.example` file listing all required environment variables with placeholder values and SHALL NOT commit `.env` files containing real secrets to version control.
7. IF the AI_Provider returns an error response or the request to the AI_Provider fails, THEN THE API_Route SHALL return an error response to the client indicating that the AI service is unavailable, without including raw provider error details, stack traces, or internal identifiers.
8. IF the audio payload size exceeds 25 MB, THEN THE API_Route SHALL return an error response indicating the size limit was exceeded without forwarding the request to the AI_Provider.

---

### Requirement 10: Framework Data and Topic Extensibility

**User Story:** As a developer, I want Frameworks to be represented as structured data and Topics to be independently managed, so that new communication frameworks and new topics can be added without requiring changes to the AI evaluation logic or UI flow.

#### Acceptance Criteria

1. THE Application SHALL maintain a static, typed Framework Pool on the server side containing all MVP-0 Frameworks.

2. Each Framework entry in the Framework Pool SHALL include: a unique identifier (1–50 characters), a display name (1–100 characters), a description (1–500 characters), a list of 1 to 10 structured evaluation criteria (each 1–200 characters), a preparation time in seconds, and a speaking time in seconds.

3. THE AI_Service SHALL derive evaluation prompts solely from the Framework entry's structured evaluation criteria field in the Framework Pool, such that adding a new Framework entry is sufficient to make that Framework available for AI evaluation without modifying AI_Service code.

4. THE Framework Pool SHALL include at minimum the following Frameworks for MVP-0: PREP (Point, Reason, Example, Point), What-So-What-Now-What.

5. Topic data SHALL be managed independently from the Framework Pool so that providing a fresh Topic set for a new Challenge does not require changes to Framework definitions or AI evaluation logic.

6. Each Topic provided to a Challenge SHALL contain a unique identifier and the Topic text.

7. IF a Framework entry in the Framework Pool is missing any required field at server startup, THEN the Application SHALL log an error identifying the missing field and the affected Framework identifier, and SHALL NOT include that Framework in the active Framework Pool.

8. THE mechanism used to provide fresh Topics SHALL be independent of the Framework Pool and SHALL be replaceable without requiring changes to the AI_Service evaluation logic.
---

### Requirement 11: End-to-End Challenge Flow

**User Story:** As a user, I want to complete the entire challenge loop from start to finish without unnecessary interruptions, so that the training session feels like a realistic communication exercise.

#### Acceptance Criteria

1. THE Application SHALL support a sequential user journey through the following phases in order: Framework Selection → Topic Selection → Challenge Screen → automatic 15-second Preparation → automatic Voice Input with a 60-second speaking timer → AI Analysis → Feedback, without requiring a page reload.

2. WHEN the Challenge Screen is displayed, THE Preparation_Timer SHALL begin automatically without requiring user confirmation.

3. WHEN the Preparation_Timer reaches zero, THE Application SHALL automatically begin the Voice Input phase and the 60-second Recording_Timer. Recording SHALL start immediately without any user action, and the application SHALL submit the audio automatically when the Recording_Timer reaches zero.

4. IF the user activates the "Skip Preparation" control, THE Application SHALL immediately end the Preparation phase and automatically begin the Voice Input phase and 60-second Recording_Timer. Recording SHALL start immediately without any user action.

5. WHEN transitioning between phases, THE Application SHALL display the current phase context, including the Framework name and Topic, so the user never loses track of their Challenge.

6. WHILE AI analysis is in progress following audio submission, THE Application SHALL display a visible loading indicator confirming that the response is being processed.

7. WHEN the user completes audio submission, THE Application SHALL display the Feedback Screen within 30 seconds, measured from the moment the audio submission is confirmed by the system, assuming a network round-trip latency of 200ms or less.

8. IF any phase transition fails due to a technical error, THEN THE Application SHALL display an error message identifying which phase failed and present a retry action that re-attempts the failed phase without navigating the user back to Framework Selection or reloading the page.---

## AI Provider Recommendation

Based on the stated evaluation criteria — audio input, transcription, reasoning quality, structured JSON output, hackathon suitability, free-tier availability, Next.js integration, future real-time audio compatibility, and API key security — the following providers are recommended for MVP-0 consideration:

### Recommended: Google Gemini (gemini-2.0-flash or gemini-1.5-flash)

- Native multimodal input: accepts audio blobs directly alongside text prompts in a single API call, eliminating a separate transcription step.
- Strong instruction-following and structured JSON output via `response_mime_type: "application/json"`.
- Generous free tier (Google AI Studio) — suitable for hackathon usage without upfront cost.
- Simple REST and SDK integration with Next.js API routes.
- Google also offers Gemini Live / real-time audio streaming APIs, making it a strong choice for the future conversation module.
- API keys are configured server-side via environment variable; no client exposure needed.

### Alternative: OpenAI (Whisper + GPT-4o)

- Whisper API handles speech-to-text transcription.
- GPT-4o handles structured evaluation with JSON mode.
- Two-step flow (transcription → analysis) but both steps are well-documented and reliable.
- GPT-4o supports structured outputs natively.
- OpenAI Realtime API supports future real-time voice conversation.
- Smaller free tier than Gemini for hackathon use; pay-as-you-go pricing applies.
- Excellent Next.js integration via the official `openai` npm package.

### Abstraction Requirement

Regardless of which provider is selected, the AI_Service layer SHALL abstract all provider-specific API calls so that the provider can be replaced later by changing configuration and the corresponding provider implementation, without requiring changes to the UI or core business logic..
