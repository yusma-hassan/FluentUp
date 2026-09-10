// import { Framework } from '../../types/index';

// export const FRAMEWORKS: Framework[] = [
//   {
//     id: 'prep',
//     name: 'PREP',
//     description:
//       'A four-step framework: make a Point, give a Reason, provide an Example, restate the Point.',
//     structuralSteps: [
//       '1. State your Point clearly',
//       '2. Give a Reason that supports it',
//       '3. Provide an Example to illustrate',
//       '4. Restate the Point to close',
//     ],
//     evaluationCriteria: [
//       {
//         id: 'prep_point',
//         label: 'Clear Point',
//         description: 'Opens with a clear, direct statement of position or main idea.',
//       },
//       {
//         id: 'prep_reason',
//         label: 'Supporting Reason',
//         description: 'Provides a logical reason that directly supports the point.',
//       },
//       {
//         id: 'prep_example',
//         label: 'Concrete Example',
//         description: 'Gives a specific, relevant example that illustrates the reason.',
//       },
//       {
//         id: 'prep_restate',
//         label: 'Point Restatement',
//         description: 'Closes by restating or reinforcing the original point.',
//       },
//       {
//         id: 'relevance',
//         label: 'Topic Relevance',
//         description: 'Response stays on topic throughout.',
//       },
//       {
//         id: 'clarity',
//         label: 'Clarity & Structure',
//         description: 'Language is clear, sentences are well-formed, delivery feels structured.',
//       },
//     ],
//     preparationTimeSeconds: 30,
//     speakingTimeSeconds: 60,
//   },
//   {
//     id: 'what_so_what_now_what',
//     name: 'What–So What–Now What',
//     description:
//       'A three-part reflective framework: describe What happened, explain So What it means, state Now What should be done.',
//     structuralSteps: [
//       '1. What — describe the situation or event',
//       '2. So What — explain its significance or impact',
//       '3. Now What — state the next action or takeaway',
//     ],
//     evaluationCriteria: [
//       {
//         id: 'wsnw_what',
//         label: 'What (Situation)',
//         description: 'Clearly describes the situation, event, or observation.',
//       },
//       {
//         id: 'wsnw_sowhat',
//         label: 'So What (Meaning)',
//         description: 'Explains why it matters or what impact it has.',
//       },
//       {
//         id: 'wsnw_nowwhat',
//         label: 'Now What (Action)',
//         description: 'States a concrete next step, recommendation, or takeaway.',
//       },
//       {
//         id: 'relevance',
//         label: 'Topic Relevance',
//         description: 'Response stays on topic throughout.',
//       },
//       {
//         id: 'clarity',
//         label: 'Clarity & Structure',
//         description: 'Language is clear and the three parts are distinguishable.',
//       },
//     ],
//     preparationTimeSeconds: 30,
//     speakingTimeSeconds: 60,
//   },
// ];




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

  {

    id: 'star',

    name: 'STAR',

    description:

      'A four-step framework for structured storytelling: describe the Situation, explain the Task, describe the Action taken, and state the Result.',

    structuralSteps: [

      '1. Describe the Situation and provide relevant context',

      '2. Explain the Task or responsibility you faced',

      '3. Describe the specific Action you took',

      '4. State the Result or outcome of your actions',

    ],

    evaluationCriteria: [

      {

        id: 'star_situation',

        label: 'Clear Situation',

        description: 'Clearly establishes the situation and provides enough relevant context.',

      },

      {

        id: 'star_task',

        label: 'Defined Task',

        description: 'Clearly explains the task, responsibility, challenge, or objective involved.',

      },

      {

        id: 'star_action',

        label: 'Specific Action',

        description: 'Describes specific actions taken and focuses on the speaker’s contribution.',

      },

      {

        id: 'star_result',

        label: 'Clear Result',

        description: 'Clearly explains the outcome, result, lesson, or impact of the actions taken.',

      },

      {

        id: 'relevance',

        label: 'Topic Relevance',

        description: 'Response stays on topic throughout.',

      },

      {

        id: 'clarity',

        label: 'Clarity & Structure',

        description: 'Language is clear and the four STAR parts are distinguishable.',

      },

    ],

    preparationTimeSeconds: 30,

    speakingTimeSeconds: 60,

  },

  {

    id: 'scqa',

    name: 'SCQA',

    description:

      'A four-step communication framework: establish the Situation, explain the Complication, identify the Question, and provide the Answer.',

    structuralSteps: [

      '1. Describe the Situation and establish the context',

      '2. Explain the Complication or problem that needs attention',

      '3. State the Question or key issue that needs to be addressed',

      '4. Provide a clear Answer or recommended response',

    ],

    evaluationCriteria: [

      {

        id: 'scqa_situation',

        label: 'Clear Situation',

        description: 'Establishes the relevant context and gives the audience a clear understanding of the situation.',

      },

      {

        id: 'scqa_complication',

        label: 'Clear Complication',

        description: 'Clearly identifies the problem, change, obstacle, or tension that requires attention.',

      },

      {

        id: 'scqa_question',

        label: 'Focused Question',

        description: 'Clearly identifies the key question or issue that needs to be addressed.',

      },

      {

        id: 'scqa_answer',

        label: 'Direct Answer',

        description: 'Provides a clear and relevant answer, recommendation, or resolution to the question.',

      },

      {

        id: 'relevance',

        label: 'Topic Relevance',

        description: 'Response stays on topic throughout.',

      },

      {

        id: 'clarity',

        label: 'Clarity & Structure',

        description: 'Language is clear and the four SCQA parts are distinguishable.',

      },

    ],

    preparationTimeSeconds: 30,

    speakingTimeSeconds: 60,

  },

];