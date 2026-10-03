
import { Template, Block, Site, LogicRule, BlockType, Skeleton, BlockHistoryEntry, LogicParameter, LogicOperator, LogicAction } from './types';

export const BLOCK_TYPES = ['Universal', 'Domain', 'Intervention', 'Recipient', 'Site', 'Appendix', 'Consent', 'Signature'] as const;

export const LOGIC_PARAMETERS = ['All Parameters', 'Domain', 'Intervention', 'Recipient', 'Site', 'Jurisdiction', 'Situation'] as const;

export const PARAMETER_OPTIONS: Record<string, string[]> = {
  'Domain': [
    'Oncology', 'Cardiology', 'Pediatrics', 'Dermatology', 'Emergency', 'Neurology', 'Genetics', 'Infectious Disease', 'Critical Care',
    'Antibody Therapy', 'Corticosteroids', 'Antivirals', 'Vitamin C', 'Endothelium Protection'
  ],
  'Intervention': [
    'Drug', 'Device', 'Surgery', 'Observation', 'Placebo', 'High Risk', 
    'Biospecimen Collection', 'Student Research', 'Commercial', 'Grant Funded', 
    'Reimbursement', 'Identifiable Data', 'Results Provided', 'Extended Consent', 
    'Unspecified Consent', 'Banking'
  ],
  'Recipient': ['Participant', 'Guardian', 'Carer', 'Legal Rep', 'Minor > 12', 'Adult'],
  'Site': ['Royal Melbourne Hospital', 'The Alfred', 'Royal Children\'s Hospital', 'St Vincent\'s', 'Austin Health', 'Outpatient Clinic', 'Regional Hub', 'Westmead Hospital', 'Fiona Stanley Hospital'],
  'Jurisdiction': ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'],
  'Situation': ['consent to continue', 'RDM']
};

export const AVAILABLE_VARIABLES = [
  'Patient Name',
  'Patient DOB',
  'Patient ID',
  'Site Name',
  'Site Address',
  'Principal Investigator',
  'Associate Investigators',
  'Study Title',
  'Protocol ID',
  'Sponsor Name',
  'Sponsor Contact',
  'Emergency Phone',
  'Current Date',
  'Condition Name',
  'Biospecimen Type',
  'Project Title',
  'Short Project Title',
  'Protocol Number',
  'Clinical Contact Name',
  'Clinical Contact Position',
  'Clinical Contact Phone',
  'Clinical Contact Email',
  'Complaints Contact Name',
  'Complaints Contact Position',
  'Complaints Contact Phone',
  'Complaints Contact Email'
];

// --- HELPER ---

const createBlock = (
  id: string,
  type: BlockType,
  name: string,
  content: string,
  version: string,
  rules: LogicRule[] = [],
  extras: Partial<Block> = {}
): Block => ({
  id,
  type,
  contentName: name,
  content,
  version,
  lastUpdated: '20.12.2024',
  hasEditHistory: (extras.history && extras.history.length > 0) || false,
  history: [],
  isSyncing: false,
  rules,
  ...extras
});

// --- SKELETON BLOCKS ---

const sk_blocks_remap = [
  { type: 'Universal' as BlockType, contentName: 'Study Header', content: 'REMAP-CAP: COVID-19 Pandemic Infection Study', version: '1.0' },
  { type: 'Universal' as BlockType, contentName: 'Introduction', content: 'You are invited to take part because you have pneumonia caused by COVID-19.', version: '1.0' },
  { 
    type: 'Domain' as BlockType, 
    contentName: 'Antibody Therapy', 
    content: 'Use of antibody therapies (convalescent plasma).', 
    version: '1.0',
    rules: [
      {
        id: 'sys_remap_1',
        parameter: 'Site' as LogicParameter,
        operator: 'ANY' as LogicOperator,
        values: ['Regional Hub', 'Outpatient Clinic'],
        action: 'Exclude block' as LogicAction,
        isSystem: true,
        systemReason: 'Safety: Site lacks infusion capabilities for antibody therapy.'
      }
    ]
  },
  { type: 'Domain' as BlockType, contentName: 'Corticosteroids', content: 'Use of hydrocortisone or dexamethasone.', version: '1.0' },
  { type: 'Domain' as BlockType, contentName: 'Antivirals', content: 'Testing remdesivir or other antiviral agents.', version: '1.0' },
  { type: 'Domain' as BlockType, contentName: 'Vitamin C', content: 'High-dose intravenous vitamin C.', version: '1.0' },
  { type: 'Domain' as BlockType, contentName: 'Endothelium Protection', content: 'Use of Imatinib for endothelium protection.', version: '1.0' },
  { type: 'Universal' as BlockType, contentName: 'Study Funding', content: 'Funded by NHMRC and MRFF.', version: '1.0' },
  { type: 'Intervention' as BlockType, contentName: 'Procedures', content: 'Randomized adaptive platform trial procedures.', version: '1.0' },
  { type: 'Recipient' as BlockType, contentName: 'Consent Form', content: 'Adult providing own consent.', version: '1.0' }
];

export const TEMPLATE_SKELETONS: Skeleton[] = [
  { 
    id: 'sk_7', 
    name: 'REMAP-CAP Platform', 
    description: 'Adaptive platform trial for COVID-19.', 
    status: 'Active', 
    blocks: sk_blocks_remap.map((b, i) => ({ 
        ...b, 
        id: `skb_7_${i}`, 
        lastUpdated: '01.01.2024', 
        hasEditHistory: false, 
        history: [], 
        isSyncing: false, 
        rules: (b as any).rules || [] 
    })) 
  }
];

// --- TEMPLATE 7 BLOCKS (V1.1 DRAFT) ---

const t7_blocks_v1_1: Block[] = [
  // 1. HEADER (V1.1 UPDATED)
  createBlock('t7_b1', 'Universal', 'Header', `# Participant Information Sheet and Consent Form\n\n**(Prior to Enrolment)**\n\n**COVID-19: Pandemic infection is either suspected or proven**\nStudy Type: Interventional Study – Adult providing own consent prior to enrolment`, '1.1', [], {
      history: [{ version: '1.0', templateVersion: '1.0', updatedAt: '20.12.2024', editedBy: 'Prof. Steven Webb', changeDescription: 'Updated phrasing for enrolment clarification', contentSnapshot: `# Participant Information Sheet and Consent Form\n\n**(Prior to Enrolment)**\n\n**COVID-19: Pandemic infection is proven**` }]
  }),

  // 1a. DERIVED HEADER (NSW VARIATION - OUTDATED: linked to 1.0)
  createBlock('t7_b1_nsw', 'Universal', 'Header (NSW)', `# Participant Information Sheet and Consent Form (NSW)\n\n**(Prior to Enrolment)**\n\n**COVID-19: Pandemic infection is proven**\nNote: This version is approved for use in NSW sites only.`, '1.0', [
      { id: 'usr_nsw_header', parameter: 'Site', operator: 'ANY', values: ['Westmead Hospital'], action: 'Include block' }
  ], {
      isCloned: true,
      clonedFrom: 't7_b1',
      derivedFromVersion: '1.0',
      subLabel: 'Derived from Header 1.0'
  }),

  // 1b. DERIVED HEADER (VIC VARIATION - OUTDATED: still linked to 0.9)
  createBlock('t7_b1_vic', 'Universal', 'Header (Victoria)', `# Participant Information Sheet and Consent Form (VIC)\n\n**COVID-19 Study: Victorian Branch**\nThis document complies with Victorian Specific requirements.`, '0.9', [
      { id: 'usr_vic_header', parameter: 'Jurisdiction', operator: 'ANY', values: ['VIC'], action: 'Include block' }
  ], {
      isCloned: true,
      clonedFrom: 't7_b1',
      derivedFromVersion: '0.9',
      subLabel: 'Derived from Header 0.9'
  }),

  // 1c. DERIVED HEADER (QLD VARIATION - UP TO DATE: linked to 1.1)
  createBlock('t7_b1_qld', 'Universal', 'Header (Queensland)', `# Participant Information Sheet and Consent Form (QLD)\n\n**(Prior to Enrolment)**\n\n**COVID-19: Pandemic infection is suspected or proven**\nThis version includes specific Queensland Health regulatory references.`, '1.1', [
      { id: 'usr_qld_header', parameter: 'Jurisdiction', operator: 'ANY', values: ['QLD'], action: 'Include block' }
  ], {
      isCloned: true,
      clonedFrom: 't7_b1',
      derivedFromVersion: '1.1',
      subLabel: 'Derived from Header 1.1'
  }),

  // 2. STUDY DETAILS (V1.0)
  createBlock('t7_b2', 'Universal', 'Study Details', `## Study Details\n\n**Title**\nRandomized, Embedded, Multifactorial Adaptive Platform trial for Community-Acquired Pneumonia\n\n**Short Title**\nREMAP-CAP\n\n**Protocol Number**\nX 17-0199\n\n**Project Sponsor**\nMonash University\n\n**Coordinating Principal Investigator**\nProfessor Steven Webb\n\n**Principal Investigator**\n{{Principal Investigator}}\n\n**Associate Investigator(s)**\n{{Associate Investigators}}\n\n**Location**\n{{Site Name}}`, '1.0'),

  // 3. INTRODUCTION (V1.1 UPDATED)
  createBlock('t7_b3', 'Universal', '1. Introduction', `You are invited to take part in this research project because you have pneumonia, an infection of the lungs caused by COVID-19. This study uses an adaptive design to find the best treatments as quickly as possible.`, '1.1', [], {
      history: [{ version: '1.0', templateVersion: '1.0', updatedAt: '20.12.2024', editedBy: 'Liam Alexander', changeDescription: 'Added mention of adaptive design', contentSnapshot: `You are invited to take part in this research project because you have pneumonia, an infection of the lungs caused by COVID-19.` }]
  }),
  
  // 3a. DERIVED INTRO (VIC) - OUTDATED: linked to 1.0
  createBlock('t7_b3_vic', 'Universal', '1. Introduction (Victoria)', `You are invited to take part in this research project in Victoria because you have pneumonia, an infection of the lungs caused by COVID-19.`, '1.0', [
      { id: 'usr_vic_intro', parameter: 'Site', operator: 'ANY', values: ['Royal Melbourne Hospital', 'The Alfred', 'St Vincent\'s'], action: 'Include block' }
  ], {
      isCloned: true,
      clonedFrom: 't7_b3',
      derivedFromVersion: '1.0',
      subLabel: 'Derived from 1. Introduction 1.0'
  }),

  // 3b. DERIVED INTRO (NT) - UP TO DATE: linked to 1.1
  createBlock('t7_b3_nt', 'Universal', '1. Introduction (Northern Territory)', `You are invited to take part in this research project in the Northern Territory. We are investigating adaptive treatments for COVID-19.`, '1.1', [
      { id: 'usr_nt_intro', parameter: 'Site', operator: 'ANY', values: ['Regional Hub'], action: 'Include block' }
  ], {
      isCloned: true,
      clonedFrom: 't7_b3',
      derivedFromVersion: '1.1',
      subLabel: 'Derived from 1. Introduction 1.1'
  }),

  // 4. RISKS AND BENEFITS (V1.1)
  createBlock('t7_risks', 'Universal', '2. Risks and Benefits', `Participation in this study involves risks common to clinical trials, including potential side effects from experimental medications. Benefits may include faster recovery times if a treatment is found effective.`, '1.1'),

  // 4a. DERIVED RISKS (PEDIATRIC - UP TO DATE: linked to 1.1)
  createBlock('t7_risks_peds', 'Universal', '2. Risks (Pediatric)', `For children participating in this study, risks are carefully monitored. Side effects are reported to guardians immediately.`, '1.1', [
      { id: 'usr_peds_risks', parameter: 'Recipient', operator: 'ANY', values: ['Guardian', 'Minor > 12'], action: 'Include block' }
  ], {
      isCloned: true,
      clonedFrom: 't7_risks',
      derivedFromVersion: '1.1',
      subLabel: 'Derived from 2. Risks 1.1'
  }),

  // 5. DOMAINS (SYSTEM LOGIC)
  createBlock('t7_dom1', 'Domain', 'Antibody Therapy', `### Domain 1: Antibody therapies\n\nIndividuals who recover from COVID-19 develop natural defences (antibodies) in their blood. This domain tests whether giving these antibodies helps you recover faster.`, '1.0', [
    { id: 'usr_remap_ab', parameter: 'Domain', operator: 'ANY', values: ['Antibody Therapy'], action: 'Include block' },
    { id: 'sys_remap_1', parameter: 'Site', operator: 'ANY', values: ['Regional Hub', 'Outpatient Clinic'], action: 'Exclude block', isSystem: true, systemReason: 'Site lacks infusion capabilities.' }
  ]),

  createBlock('t7_dom2', 'Domain', 'Corticosteroids', `### Domain 2: Corticosteroids\n\nThis domain tests whether giving high-dose corticosteroids helps reduce inflammation in the lungs caused by COVID-19.`, '1.0', [
    { id: 'usr_remap_cort', parameter: 'Domain', operator: 'ANY', values: ['Corticosteroids'], action: 'Include block' }
  ]),

  createBlock('t7_dom3', 'Domain', 'Antivirals', `### Domain 3: Antivirals\n\nWe are testing several antiviral medications to see if they can stop the virus from multiplying in your body.`, '1.0', [
    { id: 'usr_remap_anti', parameter: 'Domain', operator: 'ANY', values: ['Antivirals'], action: 'Include block' }
  ]),

  createBlock('t7_dom4', 'Domain', 'Vitamin C', `### Domain 4: Vitamin C\n\nHigh-dose intravenous Vitamin C is being tested for its potential to support the immune system during severe infection.`, '1.0', [
    { id: 'usr_remap_vitc', parameter: 'Domain', operator: 'ANY', values: ['Vitamin C'], action: 'Include block' }
  ]),

  createBlock('t7_dom5', 'Domain', 'Endothelium Protection', `### Domain 5: Endothelium Protection\n\nThis study tests whether Imatinib, a drug used for cancer, can protect the lining of your blood vessels.`, '1.0', [
    { id: 'usr_remap_endo', parameter: 'Domain', operator: 'ANY', values: ['Endothelium Protection'], action: 'Include block' }
  ]),

  // 6. RECIPIENT VARIATIONS
  createBlock('t7_rec1', 'Recipient', 'Guardian Information', `### Information for Guardians\n\nAs you are providing consent on behalf of another person, please ensure you have read the sections regarding legal representation and the criteria for being a Medical Treatment Decision Maker.`, '1.0', [
    { id: 'usr_remap_rec', parameter: 'Recipient', operator: 'ANY', values: ['Guardian', 'Legal Rep'], action: 'Include block' }
  ]),

  // 7. SITUATION LOGIC (RDM / EMERGENCY)
  createBlock('t7_sit1', 'Universal', 'Ongoing Participation (Emergency)', `### Ongoing Participation\n\nBecause you were enrolled during an emergency when you were too unwell to provide consent, we are now seeking your consent to continue in the study.`, '1.0', [
    { id: 'usr_remap_sit', parameter: 'Situation', operator: 'EQUAL TO', values: ['consent to continue'], action: 'Include block' }
  ]),

  // 8. APPENDICES
  createBlock('t7_app1', 'Appendix', 'Appendix A: Biobanking', `## Appendix A: Biobanking\n\nWe would like to store some of your blood and tissue samples for future research. This is optional and will not affect your care in the main study.`, '1.0', [
      { id: 'usr_app_bio', parameter: 'Intervention', operator: 'ANY', values: ['Banking', 'Biospecimen Collection'], action: 'Include block' }
  ]),

  createBlock('t7_app2', 'Appendix', 'Appendix B: Genetic Testing', `## Appendix B: Genetic Testing\n\nThis part of the study looks at how your genes might influence your response to the virus. We will collect one extra blood sample for this.`, '1.0', [
      { id: 'usr_app_gen', parameter: 'Domain', operator: 'ANY', values: ['Genetics'], action: 'Include block' }
  ]),

  // 9. FINAL CONSENT & SIGNATURES
  createBlock('t7_consent_main', 'Consent', 'Consent - Declaration', `## Consent Declaration\n\n{{DYNAMIC_DOMAIN_LIST}}\n\nI freely agree to participate in this research project. I understand I can withdraw at any time.`, '1.0'),
  
  createBlock('t7_sign_part', 'Signature', 'Signature - Participant', `**Name of Participant:** _________________\n**Signature:** _________________\n**Date:** {{Current Date}}`, '1.0'),
  
  createBlock('t7_sign_guard', 'Signature', 'Signature - Guardian', `**Name of Guardian:** _________________\n**Relationship to Participant:** _________________\n**Signature:** _________________\n**Date:** {{Current Date}}`, '1.0', [
      { id: 'usr_sign_guard', parameter: 'Recipient', operator: 'ANY', values: ['Guardian', 'Legal Rep'], action: 'Include block' }
  ])
];

// --- MOCK HISTORY GENERATORS ---

// Generate distinct content for v1.0
const t7_blocks_v1_0 = t7_blocks_v1_1.map(b => {
    // Clone properties
    const copy = { ...b, rules: [...b.rules], history: [...b.history] };
    copy.version = '1.0';
    
    // Explicit changes for v1.0 state to create diffs
    if (b.id === 't7_b1') { // Header
        copy.content = `# Participant Information Sheet and Consent Form\n\n**(Prior to Enrolment)**\n\n**COVID-19: Pandemic infection is proven**\nStudy Type: Interventional Study – Adult providing own consent.`;
        // History array for 1.0 would normally be empty or point to 0.9, clearing it for simplicity of snapshot
        copy.history = []; 
    }
    
    if (b.id === 't7_b3') { // Intro
         copy.content = `You are invited to take part in this research project because you have pneumonia, an infection of the lungs caused by COVID-19.`;
         copy.history = [];
    }
    
    if (b.id === 't7_risks') { // Risks
        copy.content = `Participation in this study involves risks common to clinical trials, including potential side effects from trial medications.`;
        copy.history = [];
    }
    
    return copy;
});

// Generate distinct content for v0.9
const t7_blocks_v0_9 = t7_blocks_v1_0.map(b => {
     const copy = { ...b, rules: [...b.rules] };
     copy.version = '0.9';

     // Further changes for v0.9 state
     if (b.id === 't7_b1') { // Header
        copy.content = `# Patient Information - COVID-19 Study\n\n**Status: Infection Proven**\n\nInterventional Study Protocol.`;
     }
     if (b.id === 't7_b3') { // Intro
         copy.content = `You are being invited to join a study about COVID-19 pneumonia.`;
     }
     if (b.id === 't7_risks') { // Risks
         copy.content = `There are risks associated with taking new drugs. These will be explained to you by the study doctor.`;
     }
     if (b.id === 't7_b2') { // Study Details
         copy.content = `## Study Details\n\n**Title**\nREMAP-CAP\n\n**Sponsor**\nMonash University\n\n**PI**\n{{Principal Investigator}}`;
     }
     
     return copy;
}).filter(b => b.type !== 'Appendix'); // Remove appendices in 0.9 to show block addition in 1.0

// --- MOCK TEMPLATES ---

export const MOCK_TEMPLATES: Template[] = [
    { 
      id: 'tmpl_7', 
      name: 'Consent Template', 
      skeleton: 'REMAP-CAP Platform', 
      version: '1.1', 
      previousVersion: '1.0', 
      lastUpdated: '28.12.2024', 
      updatedBy: 'Liam Alexander', 
      status: 'Draft', 
      blocks: t7_blocks_v1_1,
      history: [
        { 
          version: '1.0', 
          lastUpdated: '24.12.2024', 
          updatedBy: 'Prof. Steven Webb', 
          blocksSnapshot: t7_blocks_v1_0 
        },
        { 
          version: '0.9', 
          lastUpdated: '20.12.2024', 
          updatedBy: 'Prof. Steven Webb', 
          blocksSnapshot: t7_blocks_v0_9 
        },
        { version: '0.8', lastUpdated: '15.12.2024', updatedBy: 'Liam Alexander', blocksSnapshot: t7_blocks_v0_9 },
        { version: '0.7', lastUpdated: '08.12.2024', updatedBy: 'Liam Alexander', blocksSnapshot: t7_blocks_v0_9 },
        { version: '0.6', lastUpdated: '01.12.2024', updatedBy: 'Sarah Jenkins', blocksSnapshot: t7_blocks_v0_9 },
        { version: '0.5', lastUpdated: '22.11.2024', updatedBy: 'Liam Alexander', blocksSnapshot: t7_blocks_v0_9 },
        { version: '0.4', lastUpdated: '15.11.2024', updatedBy: 'Liam Alexander', blocksSnapshot: t7_blocks_v0_9 },
        { version: '0.3', lastUpdated: '05.11.2024', updatedBy: 'Prof. Steven Webb', blocksSnapshot: t7_blocks_v0_9 },
        { version: '0.2', lastUpdated: '25.10.2024', updatedBy: 'Liam Alexander', blocksSnapshot: t7_blocks_v0_9 },
        { version: '0.1', lastUpdated: '10.10.2024', updatedBy: 'Sarah Jenkins', blocksSnapshot: t7_blocks_v0_9 }
      ]
    },
    {
      id: 'tmpl_8',
      name: 'Genetics Research Sub-protocol',
      skeleton: 'REMAP-CAP Platform',
      version: '1.1',
      previousVersion: '1.0',
      lastUpdated: '22.12.2024',
      updatedBy: 'Dr. Sarah Jenkins',
      status: 'Draft',
      blocks: [
        createBlock('t8_b1', 'Universal', 'Introduction', 'This is a sub-protocol focused on the genetic determinants of COVID-19 severity.', '1.1'),
        createBlock('t8_b2', 'Domain', 'Genetics Analysis', 'Analysis of whole genome sequencing data.', '1.1', [
            { id: 'usr_t8_gen', parameter: 'Domain', operator: 'ANY', values: ['Genetics'], action: 'Include block' }
        ])
      ],
      history: [
        { version: '1.0', lastUpdated: '18.12.2024', updatedBy: 'Dr. Sarah Jenkins', blocksSnapshot: [] }
      ]
    }
];

export const getMockSitesForTemplate = (templateId: string, version: string): Site[] => {
    if (templateId === 'tmpl_7') {
        // Version 1.0 is the target stable version in rollout
        return [
            { id: 's1', name: 'Royal Melbourne Hospital', version: '1.0', lastUpdated: '24.12.2024', user: 'Admin' },
            { id: 's2', name: 'The Alfred', version: '0.9', lastUpdated: '15.12.2024', user: 'Admin' },
            { id: 's3', name: 'Royal Children\'s Hospital', version: '0.9', lastUpdated: '15.12.2024', user: 'Admin' },
            { id: 's4', name: 'Fiona Stanley Hospital', version: '1.0', lastUpdated: '24.12.2024', user: 'Admin' },
            { id: 's5', name: 'Westmead Hospital', version: '0.9', lastUpdated: '15.12.2024', user: 'Admin' }
        ];
    }
    
    return [
        { id: 's6', name: 'Austin Health', version: '1.0', lastUpdated: '15.12.2024', user: 'Admin' },
        { id: 's7', name: 'St Vincent\'s', version: '1.0', lastUpdated: '15.12.2024', user: 'Admin' }
    ];
};
