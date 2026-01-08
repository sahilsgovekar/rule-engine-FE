import axios, { AxiosResponse } from 'axios';
import {
  Rule,
  Policy,
  Document,
  CreateRuleForm,
  CreatePolicyForm,
  CreateDocumentForm,
  EvaluationRequest,
  EvaluationResponse
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('API Timeout:', error.config?.url);
    } else if (error.response) {
      console.error('API Error Response:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('API Network Error:', error.message);
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Rule API Service
export const ruleService = {
  // Get all rules
  getAllRules: (): Promise<AxiosResponse<Rule[]>> => 
    apiClient.get('/rules'),

  // Get active rules only
  getActiveRules: (): Promise<AxiosResponse<Rule[]>> => 
    apiClient.get('/rules/active'),

  // Get rule by ID
  getRuleById: (ruleId: string): Promise<AxiosResponse<Rule>> => 
    apiClient.get(`/rules/${ruleId}`),

  // Create new rule
  createRule: (rule: CreateRuleForm): Promise<AxiosResponse<Rule>> => 
    apiClient.post('/rules', rule),

  // Update existing rule
  updateRule: (ruleId: string, rule: CreateRuleForm): Promise<AxiosResponse<Rule>> => 
    apiClient.put(`/rules/${ruleId}`, rule),

  // Delete rule
  deleteRule: (ruleId: string): Promise<AxiosResponse<void>> => 
    apiClient.delete(`/rules/${ruleId}`),

  // Activate rule
  activateRule: (ruleId: string): Promise<AxiosResponse<void>> => 
    apiClient.patch(`/rules/${ruleId}/activate`),

  // Deactivate rule
  deactivateRule: (ruleId: string): Promise<AxiosResponse<void>> => 
    apiClient.patch(`/rules/${ruleId}/deactivate`),

  // Evaluate single rule
  evaluateRule: (ruleId: string, request: EvaluationRequest): Promise<AxiosResponse<EvaluationResponse>> => 
    apiClient.post(`/rules/${ruleId}/evaluate`, request),

  // Search rules by keyword
  searchRules: (keyword: string): Promise<AxiosResponse<Rule[]>> => 
    apiClient.get(`/rules/search?keyword=${encodeURIComponent(keyword)}`),

  // Get active rule count
  getActiveRuleCount: (): Promise<AxiosResponse<number>> => 
    apiClient.get('/rules/count/active'),
};

// Policy API Service
export const policyService = {
  // Get all policies
  getAllPolicies: (): Promise<AxiosResponse<Policy[]>> => 
    apiClient.get('/policies'),

  // Get active policies only
  getActivePolicies: (): Promise<AxiosResponse<Policy[]>> => 
    apiClient.get('/policies/active'),

  // Get policy by ID
  getPolicyById: (policyId: string): Promise<AxiosResponse<Policy>> => 
    apiClient.get(`/policies/${policyId}`),

  // Create new policy
  createPolicy: (policy: CreatePolicyForm): Promise<AxiosResponse<Policy>> => 
    apiClient.post('/policies', policy),

  // Update existing policy
  updatePolicy: (policyId: string, policy: CreatePolicyForm): Promise<AxiosResponse<Policy>> => 
    apiClient.put(`/policies/${policyId}`, policy),

  // Delete policy
  deletePolicy: (policyId: string): Promise<AxiosResponse<void>> => 
    apiClient.delete(`/policies/${policyId}`),

  // Activate policy
  activatePolicy: (policyId: string): Promise<AxiosResponse<void>> => 
    apiClient.patch(`/policies/${policyId}/activate`),

  // Deactivate policy
  deactivatePolicy: (policyId: string): Promise<AxiosResponse<void>> => 
    apiClient.patch(`/policies/${policyId}/deactivate`),
};

// Document API Service
export const documentService = {
  // Get all documents
  getAllDocuments: (): Promise<AxiosResponse<Document[]>> => 
    apiClient.get('/documents'),

  // Get document by ID
  getDocumentById: (documentId: string): Promise<AxiosResponse<Document>> => 
    apiClient.get(`/documents/${documentId}`),

  // Get documents by type
  getDocumentsByType: (valueType: string): Promise<AxiosResponse<Document[]>> => 
    apiClient.get(`/documents/type/${valueType}`),

  // Create new document
  createDocument: (document: CreateDocumentForm): Promise<AxiosResponse<Document>> => 
    apiClient.post('/documents', document),

  // Update existing document
  updateDocument: (documentId: string, document: CreateDocumentForm): Promise<AxiosResponse<Document>> => 
    apiClient.put(`/documents/${documentId}`, document),

  // Delete document
  deleteDocument: (documentId: string): Promise<AxiosResponse<void>> => 
    apiClient.delete(`/documents/${documentId}`),

  // Get recent documents
  getRecentDocuments: (): Promise<AxiosResponse<Document[]>> => 
    apiClient.get('/documents/recent'),
};

// Evaluation API Service
export const evaluationService = {
  // Evaluate policy (Primary endpoint)
  evaluatePolicy: (policyId: string, request: EvaluationRequest): Promise<AxiosResponse<EvaluationResponse>> => 
    apiClient.post(`/evaluation/policies/${policyId}`, request),

  // Evaluate single rule
  evaluateRule: (ruleId: string, request: EvaluationRequest): Promise<AxiosResponse<EvaluationResponse>> => 
    apiClient.post(`/evaluation/rules/${ruleId}`, request),

  // Bulk policy evaluation
  bulkEvaluatePolicies: (policyIds: string[], request: EvaluationRequest): Promise<AxiosResponse<EvaluationResponse[]>> => {
    const policyParams = policyIds.map(id => `policyIds=${id}`).join('&');
    return apiClient.post(`/evaluation/policies/bulk?${policyParams}`, request);
  },
};

// Combined API service for easy import
export const api = {
  rules: ruleService,
  policies: policyService,
  documents: documentService,
  evaluation: evaluationService,
};

export default api;