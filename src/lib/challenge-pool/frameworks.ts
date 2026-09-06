import { Framework } from '../../types/index';

export const FRAMEWORKS: Framework[] = [
  {
    id: 'prep',
    name: 'PREP',
    description:
      'A four-step framework: make a Point, give a Reason, provide an Example, restate the Point.',
    structuralSteps: [
      '1. State your Point clearly',
      '2. Give a Reason that supports it',
      '3. Provide an Example to illustrate',
      '4. Restate the Point to close',
    ],
    evaluationCriteria: [
      {
        id: 'prep_point',
        label: 'Clear Point',
        description: 'Opens with a clear, direct statement of position or main idea.',
      },
      {
        id: 'prep_reason',
        label: 'Supporting Reason',
        description: 'Provides a logical reason that directly supports the point.',
      },
      {
        id: 'prep_example',
        label: 'Concrete Example',
        description: 'Gives a specific, relevant example that illustrates the reason.',
      },
      {
        id: 'prep_restate',
        label: 'Point Restatement',
        description: 'Closes by restating or reinforcing the original point.',
      },
      {
        id: 'relevance',
        label: 'Topic Relevance',
        description: 'Response stays on topic throughout.',
      },
      {
        id: 'clarity',
        label: 'Clarity & Structure',
        description: 'Language is clear, sentences are well-formed, delivery feels structured.',
      },
    ],
    preparationTimeSeconds: 30,
    speakingTimeSeconds: 60,
  },
  {
    id: 'what_so_what_now_what',
    name: 'What–So What–Now What',
    description:
      'A three-part reflective framework: describe What happened, explain So What it means, state Now What should be done.',
    structuralSteps: [
      '1. What — describe the situation or event',
      '2. So What — explain its significance or impact',
      '3. Now What — state the next action or takeaway',
    ],
    evaluationCriteria: [
      {
        id: 'wsnw_what',
        label: 'What (Situation)',
        description: 'Clearly describes the situation, event, or observation.',
      },
      {
        id: 'wsnw_sowhat',
        label: 'So What (Meaning)',
        description: 'Explains why it matters or what impact it has.',
      },
      {
        id: 'wsnw_nowwhat',
        label: 'Now What (Action)',
        description: 'States a concrete next step, recommendation, or takeaway.',
      },
      {
        id: 'relevance',
        label: 'Topic Relevance',
        description: 'Response stays on topic throughout.',
      },
      {
        id: 'clarity',
        label: 'Clarity & Structure',
        description: 'Language is clear and the three parts are distinguishable.',
      },
    ],
    preparationTimeSeconds: 30,
    speakingTimeSeconds: 60,
  },
];
