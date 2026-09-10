// import { NextRequest, NextResponse } from 'next/server';
// import { ACTIVE_FRAMEWORKS } from '@/lib/challenge-pool';
// import {
//   validateFrameworkId,
//   validateAudioPayload,
//   validateTopicText,
// } from '@/lib/validation';
// import { createAIProvider } from '@/lib/ai/ai-service';
// import type { AIEvaluationRequest } from '@/lib/ai/types';

// export async function POST(request: NextRequest): Promise<NextResponse> {
//   try {
//     // Parse multipart/form-data
//     const formData = await request.formData();
//     const audioFile = formData.get('audio');
//     const frameworkId = formData.get('frameworkId');
//     const topicText = formData.get('topicText');

//     // Validation step 1 & 2: audio present, correct content-type, and size ≤ 25 MB
//     // Pass null when the field is absent so validateAudioPayload handles both checks.
//     const audioDescriptor =
//       audioFile instanceof File
//         ? { type: audioFile.type, size: audioFile.size }
//         : null;

//     const audioError = validateAudioPayload(audioDescriptor);
//     if (audioError !== null) {
//       return NextResponse.json({ error: audioError }, { status: 400 });
//     }

//     // Validation step 3: frameworkId exists in the active pool
//     const framework = validateFrameworkId(frameworkId, ACTIVE_FRAMEWORKS);
//     if (!framework) {
//       return NextResponse.json(
//         { error: 'Framework ID not found.' },
//         { status: 400 },
//       );
//     }

//     // Validation step 4: topicText non-empty and within length limit
//     const topicTextError = validateTopicText(topicText);
//     if (topicTextError !== null) {
//       return NextResponse.json({ error: topicTextError }, { status: 400 });
//     }

//     // At this point audioFile is definitely a File (audioDescriptor was non-null
//     // and validateAudioPayload returned null), so the cast is safe.
//     const validAudioFile = audioFile as File;

//     // Convert audio File to Buffer for the AI provider
//     const arrayBuffer = await validAudioFile.arrayBuffer();
//     const audioBuffer = Buffer.from(arrayBuffer);

//     // Build the AI evaluation request — scores are computed server-side only
//     const aiRequest: AIEvaluationRequest = {
//       audioBlob: audioBuffer,
//       audioMimeType: validAudioFile.type,
//       frameworkId: framework.id,
//       frameworkName: framework.name,
//       evaluationCriteria: framework.evaluationCriteria,
//       topicText: topicText as string,
//     };

//     // Call the AI provider — both success and AI error paths return HTTP 200
//     const provider = createAIProvider();
//     const result = await provider.evaluate(aiRequest);

//     return NextResponse.json(result, { status: 200 });
//   } catch {
//     // Unexpected exception — no stack traces or internal details in the response
//     return NextResponse.json(
//       { error: 'An unexpected error occurred.' },
//       { status: 500 },
//     );
//   }
// }



import { NextRequest, NextResponse } from 'next/server';

import { ACTIVE_FRAMEWORKS } from '@/lib/challenge-pool';

import {
  validateFrameworkId,
  validateAudioPayload,
  validateTopicText,
} from '@/lib/validation';

import { createAIProvider } from '@/lib/ai/ai-service';

import { createClient } from '@/lib/supabase/server';

import type { AIEvaluationRequest } from '@/lib/ai/types';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse multipart/form-data
    const formData = await request.formData();

    const audioFile = formData.get('audio');
    const frameworkId = formData.get('frameworkId');
    const topicText = formData.get('topicText');

    // Validation step 1 & 2: audio present, correct content-type, and size ≤ 25 MB
    const audioDescriptor =
      audioFile instanceof File
        ? { type: audioFile.type, size: audioFile.size }
        : null;

    const audioError = validateAudioPayload(audioDescriptor);

    if (audioError !== null) {
      return NextResponse.json({ error: audioError }, { status: 400 });
    }

    // Validation step 3: frameworkId exists in the active pool
    const framework = validateFrameworkId(
      frameworkId,
      ACTIVE_FRAMEWORKS,
    );

    if (!framework) {
      return NextResponse.json(
        { error: 'Framework ID not found.' },
        { status: 400 },
      );
    }

    // Validation step 4: topicText non-empty and within length limit
    const topicTextError = validateTopicText(topicText);

    if (topicTextError !== null) {
      return NextResponse.json(
        { error: topicTextError },
        { status: 400 },
      );
    }

    // At this point audioFile is definitely a File
    const validAudioFile = audioFile as File;

    // Get the authenticated user server-side
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'You must be signed in to submit a challenge.' },
        { status: 401 },
      );
    }

    // Convert audio File to Buffer for the AI provider
    const arrayBuffer = await validAudioFile.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    // Build the AI evaluation request
    const aiRequest: AIEvaluationRequest = {
      audioBlob: audioBuffer,
      audioMimeType: validAudioFile.type,
      frameworkId: framework.id,
      frameworkName: framework.name,
      evaluationCriteria: framework.evaluationCriteria,
      topicText: topicText as string,
    };

    // Call the AI provider
    const provider = createAIProvider();
    const result = await provider.evaluate(aiRequest);

    // Only save successful evaluations
    // if (result.success) {
    //   const evaluation = result.evaluation;

    //   const { error: insertError } = await supabase
    //     .from('challenge_attempts')
        
    //     .insert({
    //       user_id: user.id,
    //       framework_id: framework.id,
    //       framework_name: framework.name,
    //       topic_text: topicText as string,
    //       overall_score: evaluation.overallScore,
    //       category_scores: evaluation.categoryScores,
    //       strengths: evaluation.strengths,
    //       weaknesses: evaluation.weaknesses,
    //       suggestions: evaluation.suggestions,
    //       framework_feedback: evaluation.frameworkFeedback,
    //       example_response: evaluation.exampleResponse,
    //     });

    //   if (insertError) {
    //     console.error(
    //       '[evaluate] database insert error:',
    //       insertError.code,
    //       insertError.message,
    //     );

    //     return NextResponse.json(
    //       { error: 'Evaluation completed but could not be saved.' },
    //       { status: 500 },
    //     );
    //   }
    // }

if (result.success) {
  const evaluation = result.evaluation;

  const attempt = {
    user_id: user.id,
    framework_id: framework.id,
    framework_name: framework.name,
    topic_text: topicText as string,
    overall_score: evaluation.overallScore,
    category_scores: evaluation.categoryScores,
    strengths: evaluation.strengths,
    weaknesses: evaluation.weaknesses,
    suggestions: evaluation.suggestions,
    framework_feedback: evaluation.frameworkFeedback,
    example_response: evaluation.exampleResponse,
  };

  const { error: insertError } = await supabase
    .from('challenge_attempts')
    .insert(attempt);

  if (insertError) {
    console.error(
      '[evaluate] database insert error:',
      insertError.code,
      insertError.message,
    );

    return NextResponse.json(
      { error: 'Evaluation completed but could not be saved.' },
      { status: 500 },
    );
  }
}

    // Return the evaluation to the client
    return NextResponse.json(result, { status: 200 });
  } catch {
    // Unexpected exception
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 },
    );
  }
}