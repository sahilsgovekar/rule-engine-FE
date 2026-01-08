// Core Entity Types
export interface Rule {
  ruleId: string;
  expression: string;
  referenceId?: string;
  onTrueType: OutcomeType;
  onTrueValue: string;
  onFalseType: OutcomeType;
  onFalseValue: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  version?: number;
}

export interface Policy {
  policyId: string;
  policyName: string;
  description?: string;
  rootRuleId: string;
  ruleIds: string[];
  priority: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Document {
  documentId: string;
  documentValue: string;
  valueType: ValueType;
  createdAt?: string;
  updatedAt?: string;
}

// Enums
export enum OutcomeType {
  VALUE = 'VALUE',
  RULE = 'RULE'
}

export enum ValueType {
  STRING = 'STRING',
  INTEGER = 'INTEGER',
  DOUBLE = 'DOUBLE',
  BOOLEAN = 'BOOLEAN'
}

// Request/Response Types
export interface EvaluationRequest {
  userId: string;
  userAttributes: Record<string, any>;
}

export interface ExecutionTrace {
  ruleId: string;
  expression: string;
  result: boolean;
  executionTime?: number;
  nextAction?: string;
}

export interface EvaluationResponse {
  userId: string;
  policyId?: string;
  ruleId?: string;
  approved: boolean;
  finalDecision: boolean;
  confidence?: number;
  reason?: string;
  error?: boolean;
  executionTrace: ExecutionTrace[];
  evaluatedAt: string;
  executionTimeMs: number;
}

// Form Types
export interface CreateRuleForm {
  ruleId: string;
  expression: string;
  referenceId?: string;
  onTrueType: OutcomeType;
  onTrueValue: string;
  onFalseType: OutcomeType;
  onFalseValue: string;
  description?: string;
}

export interface CreatePolicyForm {
  policyId: string;
  policyName: string;
  description?: string;
  rootRuleId: string;
  ruleIds: string[];
  priority: number;
}

export interface CreateDocumentForm {
  documentId: string;
  documentValue: string;
  valueType: ValueType;
}

// Tree Visualization Types
export interface TreeNode {
  id: string;
  label: string;
  type: 'policy' | 'rule' | 'document';
  children?: TreeNode[];
  data?: Rule | Policy | Document;
  expanded?: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// UI State Types
export interface UIState {
  loading: boolean;
  error?: string;
  selectedPolicy?: Policy;
  selectedRule?: Rule;
  selectedDocument?: Document;
}

// Component Props Types
export interface PolicyTreeProps {
  policies: Policy[];
  rules: Rule[];
  documents: Document[];
  onSelectPolicy?: (policy: Policy) => void;
  onSelectRule?: (rule: Rule) => void;
  onSelectDocument?: (document: Document) => void;
}

export interface RuleFormProps {
  rule?: Rule;
  onSubmit: (rule: CreateRuleForm) => void;
  onCancel: () => void;
  availableDocuments: Document[];
  availableRules: Rule[];
}

export interface PolicyFormProps {
  policy?: Policy;
  onSubmit: (policy: CreatePolicyForm) => void;
  onCancel: () => void;
  availableRules: Rule[];
}

export interface DocumentFormProps {
  document?: Document;
  onSubmit: (document: CreateDocumentForm) => void;
  onCancel: () => void;
}

export interface EvaluationFormProps {
  onEvaluate: (request: EvaluationRequest) => void;
  loading?: boolean;
  result?: EvaluationResponse;
}