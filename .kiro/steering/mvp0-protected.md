---
inclusion: always
---

# FLUENTUP — MVP-0 PROTECTED CODE

## CRITICAL RULE

The existing FluentUp MVP-0 audio recording and AI evaluation pipeline is FROZEN.

This code has already been debugged extensively and is currently working.

DO NOT modify, refactor, rewrite, optimize, replace, simplify, reorganize, or "improve" any existing MVP-0 audio/AI functionality.

DO NOT test the MVP-0 audio/AI functionality.

DO NOT change its prompts.

DO NOT change its Gemini configuration.

DO NOT change its audio handling.

DO NOT change its speech detection logic.

DO NOT change its evaluation logic.

DO NOT change its API request/response flow.

DO NOT change its recording lifecycle.

DO NOT change its MediaRecorder implementation.

DO NOT change its MIME-type handling.

DO NOT change its audio-to-Gemini conversion.

DO NOT change its Gemini provider.

DO NOT add transcription to the existing evaluation pipeline.

DO NOT replace the existing Gemini multimodal evaluation with a transcription-first architecture.

DO NOT touch working MVP-0 code merely because a new feature could theoretically be implemented differently.

If a new feature appears to require modifying protected MVP-0 code, STOP and report the dependency instead of modifying the protected code.

## PROTECTED FUNCTIONALITY

The following functionality is considered complete and frozen:

1. Framework selection
2. Topic generation/selection
3. Preparation timer
4. Voice recording
5. Audio blob creation
6. Audio MIME handling
7. Sending recorded audio to the server
8. Gemini audio evaluation
9. Speech/no-speech detection
10. Evaluation scoring
11. Structured evaluation response
12. Evaluation feedback
13. Existing evaluation API flow
14. Existing Gemini provider implementation
15. Existing audio recorder implementation

## PROTECTED FILES

Before making any changes, inspect the repository and identify the actual files responsible for:

- MediaRecorder/audio capture
- recording state
- audio blob creation
- evaluation API
- Gemini provider
- evaluation prompt
- speech detection
- evaluation parsing/validation
- evaluation result handling

Treat those files as READ-ONLY.

Do not modify them.

If the exact filenames differ from this description, determine them from the repository and treat the discovered MVP-0 implementation as protected.

## TESTING RESTRICTION

Do not run tests that exercise the protected MVP-0 audio/AI pipeline.

Do not create new tests that modify or depend on changing the MVP-0 behavior.

Do not "verify" the existing audio/Gemini implementation by changing it.

The purpose of this task is to build the remaining product around the existing working MVP-0.

## IMPLEMENTATION PRINCIPLE

Build new functionality around the existing MVP-0 interfaces.

Prefer:

- new components
- new pages
- new hooks
- new utility modules
- new data models
- new API routes
- adapters around existing interfaces

rather than modifying protected MVP-0 implementation.

The existing MVP-0 behavior is the source of truth.

## CHANGE DISCIPLINE

Before editing any file:

1. Determine whether the file belongs to MVP-0 protected functionality.
2. If yes, DO NOT edit it.
3. If no, it may be modified when required by the new feature.
4. If uncertain, do not modify it. Report the file and ask for permission.

Never assume that a refactor is safe.

Never modify working MVP-0 code simply to make the architecture "cleaner."

## PRIORITY

Protect existing functionality over implementing a new feature.

If there is a conflict:

MVP-0 protection > new feature implementation.

## PROTECTED FILE OVERRIDE

The PROTECTED MVP-0 FILES list is authoritative.

Even if a protected file appears to contain UI code, a bug, outdated code, duplicated code, or code that could be simplified, DO NOT modify it.

Do not move code out of protected files.
Do not rename protected files.
Do not split protected files.
Do not merge protected files.
Do not change imports inside protected files.
Do not change exports inside protected files.

If a new feature needs information from a protected file, consume its existing public interface from outside the file.