
export type BlockType = 'Universal' | 'Domain' | 'Intervention' | 'Recipient' | 'Site' | 'Appendix' | 'Consent' | 'Signature';

export type LogicOperator = 'EQUAL TO' | 'NOT EQUAL TO' | 'CONTAINS' | 'ANY';

export type LogicAction = 'Include block' | 'Exclude block';

export type LogicParameter = 'All Parameters' | 'Domain' | 'Intervention' | 'Recipient' | 'Site' | 'Jurisdiction' | 'Situation';

export interface LogicRule {
  id: string;
  parameter: LogicParameter;
  operator: LogicOperator;
  values: string[];
  action: LogicAction;
  conditionDescription?: string; // Pre-computed readable string for UI if needed
  isSystem?: boolean; // Applied by system logic, read-only for users
  systemReason?: string; // Explanation for why this rule is enforced
}

export interface BlockHistoryEntry {
  version: string;
  templateVersion?: string; // The version of the template when this block change occurred
  updatedAt: string;
  editedBy: string; 
  changeDescription: string;
  contentSnapshot: string; // Snapshot of the content at this version
}

export interface Block {
  id: string;
  type: BlockType;
  subLabel?: string; // e.g., "Mandatory"
  contentName: string; // e.g., "Generic", "Guardian", "Add content"
  content?: string; // The actual text content
  notes?: string; // Notes for the block
  version: string;
  previousVersion?: string; // For "1.2 -> 1.3"
  lastUpdated: string;
  hasEditHistory: boolean; // Shows the pencil icon
  history: BlockHistoryEntry[]; // Full log of versions
  isSyncing: boolean; // Shows the sync/refresh icon
  rules: LogicRule[];
  isExpanded?: boolean; // UI state for showing logic
  isCloned?: boolean; // Used for "Generic 1.1 -> Victoria" style
  clonedFrom?: string;
  derivedFromVersion?: string; // The version of the parent block at the time of cloning
  versionAtSessionStart?: string; // The version of the block when the editing session started.
  isDraftCopy?: boolean; // Internal flag: true if block is a fresh copy and hasn't been saved yet
  editedInDraft?: boolean; // UI flag: true if block has been edited in the current draft session
  isDisabled?: boolean; // If true, block is excluded regardless of rules.
  associatedDomainIds?: string[]; // IDs of Domain blocks this block belongs to (inherits system rules)
}

export interface Template {
  id: string;
  name: string;
  skeleton?: string; // Added for table view
  version: string;
  previousVersion: string;
  lastUpdated: string;
  updatedBy?: string; // Added for table view
  status: 'Draft' | 'Active' | 'Published' | 'Archived' | 'Rolling Out';
  blocks: Block[];
  history?: {
    version: string;
    lastUpdated: string;
    updatedBy: string;
    blocksSnapshot: Block[];
  }[];
}

export interface Site {
  id: string;
  name: string;
  version: string;
  lastUpdated: string;
  user: string;
  updateStatus?: 'None' | 'Under Review';
}

export interface Skeleton {
  id: string;
  name: string;
  description: string;
  blocks: Omit<Block, 'id'>[];
  status?: 'Active' | 'Archived';
}
