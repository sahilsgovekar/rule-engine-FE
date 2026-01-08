import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Autocomplete,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  PlayArrow as EvaluateIcon,
  Person as UserIcon,
  Policy as PolicyIcon,
  Rule as RuleIcon,
  CheckCircle as SuccessIcon,
  Cancel as ErrorIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Timeline as TraceIcon,
  Speed as PerformanceIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useQuery, useMutation } from 'react-query';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import api from '../services/api';
import { Policy, Rule, EvaluationRequest, EvaluationResponse, ExecutionTrace } from '../types';

interface EvaluationFormData {
  userId: string;
  policyId?: string;
  ruleId?: string;
  evaluationType: 'policy' | 'rule' | 'bulk';
  policyIds?: string[];
  userAttributes: Array<{ key: string; value: string }>;
}

interface EvaluationHistory {
  timestamp: Date;
  request: EvaluationRequest;
  response: EvaluationResponse;
  type: 'policy' | 'rule' | 'bulk';
}

const EvaluationInterface: React.FC = () => {
  const [evaluationHistory, setEvaluationHistory] = useState<EvaluationHistory[]>([]);
  const [expandedTrace, setExpandedTrace] = useState<string | null>(null);
  const [bulkResults, setBulkResults] = useState<EvaluationResponse[]>([]);

  const { data: policies = [] } = useQuery('policies', () =>
    api.policies.getAllPolicies().then(res => res.data)
  );

  const { data: rules = [] } = useQuery('rules', () =>
    api.rules.getAllRules().then(res => res.data)
  );

  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm<EvaluationFormData>({
    defaultValues: {
      userId: '',
      evaluationType: 'policy',
      userAttributes: [{ key: 'age', value: '' }],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'userAttributes',
  });

  const evaluationType = watch('evaluationType');

  const policyEvaluationMutation = useMutation(
    ({ policyId, request }: { policyId: string; request: EvaluationRequest }) =>
      api.evaluation.evaluatePolicy(policyId, request),
    {
      onSuccess: (response, variables) => {
        const historyEntry: EvaluationHistory = {
          timestamp: new Date(),
          request: variables.request,
          response: response.data,
          type: 'policy',
        };
        setEvaluationHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
      },
    }
  );

  const ruleEvaluationMutation = useMutation(
    ({ ruleId, request }: { ruleId: string; request: EvaluationRequest }) =>
      api.evaluation.evaluateRule(ruleId, request),
    {
      onSuccess: (response, variables) => {
        const historyEntry: EvaluationHistory = {
          timestamp: new Date(),
          request: variables.request,
          response: response.data,
          type: 'rule',
        };
        setEvaluationHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
      },
    }
  );

  const bulkEvaluationMutation = useMutation(
    ({ policyIds, request }: { policyIds: string[]; request: EvaluationRequest }) =>
      api.evaluation.bulkEvaluatePolicies(policyIds, request),
    {
      onSuccess: (response) => {
        setBulkResults(response.data);
      },
    }
  );

  const onSubmit = (data: EvaluationFormData) => {
    const userAttributes = data.userAttributes.reduce((acc, attr) => {
      if (attr.key && attr.value) {
        // Try to parse as number or boolean
        let value: any = attr.value;
        if (!isNaN(Number(attr.value))) {
          value = Number(attr.value);
        } else if (attr.value.toLowerCase() === 'true') {
          value = true;
        } else if (attr.value.toLowerCase() === 'false') {
          value = false;
        }
        acc[attr.key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    const request: EvaluationRequest = {
      userId: data.userId,
      userAttributes,
    };

    if (data.evaluationType === 'policy' && data.policyId) {
      policyEvaluationMutation.mutate({ policyId: data.policyId, request });
    } else if (data.evaluationType === 'rule' && data.ruleId) {
      ruleEvaluationMutation.mutate({ ruleId: data.ruleId, request });
    } else if (data.evaluationType === 'bulk' && data.policyIds) {
      bulkEvaluationMutation.mutate({ policyIds: data.policyIds, request });
    }
  };

  const addUserAttribute = () => {
    append({ key: '', value: '' });
  };

  const renderExecutionTrace = (trace: ExecutionTrace[], evaluationId: string) => (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <TraceIcon sx={{ fontSize: 16 }} />
        <Typography variant="subtitle2">
          Execution Trace ({trace.length} steps)
        </Typography>
        <IconButton
          size="small"
          onClick={() => setExpandedTrace(expandedTrace === evaluationId ? null : evaluationId)}
        >
          {expandedTrace === evaluationId ? <CollapseIcon /> : <ExpandIcon />}
        </IconButton>
      </Box>
      <Collapse in={expandedTrace === evaluationId}>
        <List dense>
          {trace.map((step, index) => (
            <ListItem key={index} sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                {step.result ? 
                  <SuccessIcon color="success" sx={{ fontSize: 16 }} /> :
                  <ErrorIcon color="error" sx={{ fontSize: 16 }} />
                }
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" component="div">
                    <strong>{step.ruleId}</strong>: {step.expression}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    Result: {step.result ? 'True' : 'False'} 
                    {step.executionTime && ` (${step.executionTime}ms)`}
                    {step.nextAction && ` → ${step.nextAction}`}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Box>
  );

  const renderEvaluationResult = (result: EvaluationResponse, type: string, index?: number) => {
    const evaluationId = `${type}-${result.policyId || result.ruleId}-${index || 0}`;
    
    return (
      <Card key={evaluationId} sx={{ mb: 2 }}>
        <CardHeader
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                label={result.approved ? 'APPROVED' : 'REJECTED'}
                color={result.approved ? 'success' : 'error'}
                icon={result.approved ? <SuccessIcon /> : <ErrorIcon />}
              />
              <Typography variant="h6">
                {result.policyId || result.ruleId}
              </Typography>
            </Box>
          }
          subheader={
            <Box display="flex" alignItems="center" gap={2} mt={1}>
              <Chip
                label={`${result.executionTimeMs}ms`}
                size="small"
                icon={<PerformanceIcon />}
                variant="outlined"
              />
              <Chip
                label={`Confidence: ${(result.confidence || 0) * 100}%`}
                size="small"
                variant="outlined"
              />
            </Box>
          }
        />
        <CardContent>
          {result.reason && (
            <Alert severity={result.approved ? 'success' : 'warning'} sx={{ mb: 2 }}>
              {result.reason}
            </Alert>
          )}
          
          {result.executionTrace && result.executionTrace.length > 0 && 
            renderExecutionTrace(result.executionTrace, evaluationId)}
          
          <Typography variant="caption" color="text.secondary" display="block" mt={2}>
            Evaluated at: {new Date(result.evaluatedAt).toLocaleString()}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  const commonUserAttributes = [
    'age', 'income', 'creditScore', 'city', 'employmentStatus', 
    'loanAmount', 'existingLoans', 'monthsEmployed', 'education'
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Rule Evaluation Interface
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Test your policies and rules with real user data to see how they perform
      </Typography>

      <Grid container spacing={3}>
        {/* Evaluation Form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Evaluation Setup
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Controller
                    name="userId"
                    control={control}
                    rules={{ required: 'User ID is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="User ID"
                        fullWidth
                        placeholder="e.g., user123, loan_app_456"
                        error={!!errors.userId}
                        helperText={errors.userId?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="evaluationType"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Evaluation Type</InputLabel>
                        <Select {...field} label="Evaluation Type">
                          <MenuItem value="policy">Single Policy</MenuItem>
                          <MenuItem value="rule">Single Rule</MenuItem>
                          <MenuItem value="bulk">Multiple Policies</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>

                {evaluationType === 'policy' && (
                  <Grid item xs={12}>
                    <Controller
                      name="policyId"
                      control={control}
                      rules={{ required: 'Policy is required' }}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.policyId}>
                          <InputLabel>Policy</InputLabel>
                          <Select {...field} label="Policy">
                            {policies.map((policy) => (
                              <MenuItem key={policy.policyId} value={policy.policyId}>
                                {policy.policyName} ({policy.policyId})
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                )}

                {evaluationType === 'rule' && (
                  <Grid item xs={12}>
                    <Controller
                      name="ruleId"
                      control={control}
                      rules={{ required: 'Rule is required' }}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.ruleId}>
                          <InputLabel>Rule</InputLabel>
                          <Select {...field} label="Rule">
                            {rules.map((rule) => (
                              <MenuItem key={rule.ruleId} value={rule.ruleId}>
                                {rule.ruleId} - {rule.expression}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                )}

                {evaluationType === 'bulk' && (
                  <Grid item xs={12}>
                    <Controller
                      name="policyIds"
                      control={control}
                      rules={{ required: 'At least one policy is required' }}
                      render={({ field }) => (
                        <Autocomplete
                          {...field}
                          multiple
                          options={policies.map(p => p.policyId)}
                          getOptionLabel={(option) => {
                            const policy = policies.find(p => p.policyId === option);
                            return policy ? `${policy.policyName} (${policy.policyId})` : option;
                          }}
                          onChange={(_, value) => field.onChange(value)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Policies to Compare"
                              placeholder="Select policies..."
                              error={!!errors.policyIds}
                              helperText={errors.policyIds?.message}
                            />
                          )}
                        />
                      )}
                    />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    User Attributes
                  </Typography>
                  {fields.map((field, index) => (
                    <Grid container spacing={1} key={field.id} sx={{ mb: 1 }}>
                      <Grid item xs={5}>
                        <Controller
                          name={`userAttributes.${index}.key`}
                          control={control}
                          render={({ field }) => (
                            <Autocomplete
                              {...field}
                              freeSolo
                              options={commonUserAttributes}
                              onChange={(_, value) => field.onChange(value || '')}
                              renderInput={(params) => (
                                <TextField {...params} label="Attribute" size="small" />
                              )}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={5}>
                        <Controller
                          name={`userAttributes.${index}.value`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Value"
                              size="small"
                              fullWidth
                              placeholder="Enter value..."
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                          ×
                        </Button>
                      </Grid>
                    </Grid>
                  ))}
                  <Button variant="outlined" size="small" onClick={addUserAttribute}>
                    Add Attribute
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<EvaluateIcon />}
                    disabled={
                      policyEvaluationMutation.isLoading ||
                      ruleEvaluationMutation.isLoading ||
                      bulkEvaluationMutation.isLoading
                    }
                  >
                    {policyEvaluationMutation.isLoading ||
                     ruleEvaluationMutation.isLoading ||
                     bulkEvaluationMutation.isLoading
                      ? 'Evaluating...'
                      : 'Run Evaluation'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Results and History */}
        <Grid item xs={12} md={6}>
          {/* Current Results */}
          {(policyEvaluationMutation.data || ruleEvaluationMutation.data) && (
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Current Result
              </Typography>
              {policyEvaluationMutation.data && 
                renderEvaluationResult(policyEvaluationMutation.data.data, 'policy')}
              {ruleEvaluationMutation.data && 
                renderEvaluationResult(ruleEvaluationMutation.data.data, 'rule')}
            </Box>
          )}

          {/* Bulk Results */}
          {bulkResults.length > 0 && (
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Bulk Evaluation Results ({bulkResults.length})
              </Typography>
              {bulkResults.map((result, index) => 
                renderEvaluationResult(result, 'bulk', index)
              )}
            </Box>
          )}

          {/* Evaluation History */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
              <HistoryIcon />
              Recent Evaluations
            </Typography>
            {evaluationHistory.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                No evaluations yet. Run an evaluation to see results here.
              </Typography>
            ) : (
              <List>
                {evaluationHistory.map((history, index) => (
                  <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                      <Box display="flex" alignItems="center" gap={1}>
                        {history.type === 'policy' ? <PolicyIcon /> : <RuleIcon />}
                        <Typography variant="body2">
                          {history.response.policyId || history.response.ruleId}
                        </Typography>
                        <Chip
                          label={history.response.approved ? 'APPROVED' : 'REJECTED'}
                          color={history.response.approved ? 'success' : 'error'}
                          size="small"
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {history.timestamp.toLocaleTimeString()}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EvaluationInterface;