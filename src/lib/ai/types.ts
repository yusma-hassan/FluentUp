import type { EvaluationCriterion, EvaluationResult } from '../../types/index';

export interface AIEvaluationRequest {
  audioBlob: Buffer;
  audioMimeType: string;
  frameworkId: string;
  frameworkName: string;
  evaluationCriteria: EvaluationCriterion[];
  topicText: string;
}

export interface AIProvider {
  readonly id: string;
  evaluate(request: AIEvaluationRequest): Promise<EvaluationResult>;
}
