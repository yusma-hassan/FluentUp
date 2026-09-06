import { NextRequest, NextResponse } from 'next/server';
import { ACTIVE_FRAMEWORKS } from '@/lib/challenge-pool';
import { validateFrameworkId } from '@/lib/validation';
import { generateTopics } from '@/lib/ai/topic-generation-service';
import type { TopicGenerationRequest } from '@/types/index';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse the JSON body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    // Validate frameworkId against the active framework pool
    const frameworkId = (body as Record<string, unknown>)?.frameworkId;
    const framework = validateFrameworkId(frameworkId, ACTIVE_FRAMEWORKS);

    if (!framework) {
      return NextResponse.json({ error: 'Framework ID not found.' }, { status: 400 });
    }

    // Build the topic generation request from the matched framework
    const topicRequest: TopicGenerationRequest = {
      frameworkId: framework.id,
      frameworkName: framework.name,
      frameworkDescription: framework.description,
      structuralSteps: framework.structuralSteps,
      evaluationCriteria: framework.evaluationCriteria,
    };

    // Call the topic generation service
    const response = await generateTopics(topicRequest);

    // Return the service response (success or AI error) as HTTP 200
    return NextResponse.json(response, { status: 200 });
  } catch {
    // Unexpected exception — return a generic 500 with no internal details
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 },
    );
  }
}
