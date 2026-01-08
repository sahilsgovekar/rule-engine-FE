import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
import api from '../services/api';
import { Rule, CreateRuleForm, OutcomeType, Document } from '../types';

const RuleManagement: React.FC = () => {
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  
  const queryClient = useQueryClient();

  const { data: rules = [], isLoading, error } = useQuery('rules', () =>
    api.rules.getAllRules().then(res => res.data)
  );

  const { data: documents = [] } = useQuery('documents', () =>
    api.documents.getAllDocuments().then(res => res.data)
  );

  const { data: searchResults = [] } = useQuery(
    ['searchRules', searchKeyword],
    () => api.rules.searchRules(searchKeyword).then(res => res.data),
    { enabled: searchKeyword.length > 2 }
  );

  const { control, handleSubmit, reset, formState: { errors } } = useForm<CreateRuleForm>();

  const createRuleMutation = useMutation(api.rules.createRule, {
    onSuccess: () => {
      queryClient.invalidateQueries('rules');
      handleCloseDialog();
    },
  });

  const updateRuleMutation = useMutation(
    ({ ruleId, data }: { ruleId: string; data: CreateRuleForm }) =>
      api.rules.updateRule(ruleId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('rules');
        handleCloseDialog();
      },
    }
  );

  const deleteRuleMutation = useMutation(api.rules.deleteRule, {
    onSuccess: () => queryClient.invalidateQueries('rules'),
  });

  const activateRuleMutation = useMutation(api.rules.activateRule, {
    onSuccess: () => queryClient.invalidateQueries('rules'),
  });

  const deactivateRuleMutation = useMutation(api.rules.deactivateRule, {
    onSuccess: () => queryClient.invalidateQueries('rules'),
  });

  const handleOpenCreateDialog = () => {
    setIsEditing(false);
    setSelectedRule(null);
    reset({
      ruleId: '',
      expression: '',
      referenceId: '',
      onTrueType: OutcomeType.VALUE,
      onTrueValue: '',
      onFalseType: OutcomeType.VALUE,
      onFalseValue: '',
      description: '',
    });
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (rule: Rule) => {
    setIsEditing(true);
    setSelectedRule(rule);
    reset({
      ruleId: rule.ruleId,
      expression: rule.expression,
      referenceId: rule.referenceId || '',
      onTrueType: rule.onTrueType,
      onTrueValue: rule.onTrueValue,
      onFalseType: rule.onFalseType,
      onFalseValue: rule.onFalseValue,
      description: rule.description || '',
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRule(null);
    reset();
  };

  const handleViewRule = (rule: Rule) => {
    setSelectedRule(rule);
    setViewDialogOpen(true);
  };

  const onSubmit = (data: CreateRuleForm) => {
    if (isEditing && selectedRule) {
      updateRuleMutation.mutate({ ruleId: selectedRule.ruleId, data });
    } else {
      createRuleMutation.mutate(data);
    }
  };

  const handleDelete = (ruleId: string) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      deleteRuleMutation.mutate(ruleId);
    }
  };

  const handleToggleActive = (rule: Rule) => {
    if (rule.isActive) {
      deactivateRuleMutation.mutate(rule.ruleId);
    } else {
      activateRuleMutation.mutate(rule.ruleId);
    }
  };

  const displayRules = searchKeyword.length > 2 ? searchResults : rules;

  if (error) {
    return <Alert severity="error">Error loading rules</Alert>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Rule Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Create Rule
        </Button>
      </Box>

      {/* Search Bar */}
      <Box mb={3}>
        <TextField
          fullWidth
          placeholder="Search rules by expression..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rule ID</TableCell>
              <TableCell>Expression</TableCell>
              <TableCell>Reference</TableCell>
              <TableCell>On True</TableCell>
              <TableCell>On False</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayRules.map((rule) => (
              <TableRow key={rule.ruleId}>
                <TableCell>{rule.ruleId}</TableCell>
                <TableCell>
                  <Tooltip title={rule.expression}>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                      {rule.expression}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>{rule.referenceId || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={`${rule.onTrueType}: ${rule.onTrueValue}`}
                    size="small"
                    color={rule.onTrueType === 'VALUE' ? 'success' : 'primary'}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${rule.onFalseType}: ${rule.onFalseValue}`}
                    size="small"
                    color={rule.onFalseType === 'VALUE' ? 'error' : 'primary'}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={rule.isActive ? 'Active' : 'Inactive'}
                    color={rule.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleViewRule(rule)} size="small">
                    <ViewIcon />
                  </IconButton>
                  <IconButton onClick={() => handleOpenEditDialog(rule)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleToggleActive(rule)} 
                    size="small"
                    color={rule.isActive ? 'warning' : 'success'}
                  >
                    {rule.isActive ? <StopIcon /> : <PlayIcon />}
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDelete(rule.ruleId)} 
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Rule Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? 'Edit Rule' : 'Create New Rule'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="ruleId"
                  control={control}
                  rules={{ required: 'Rule ID is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Rule ID"
                      fullWidth
                      disabled={isEditing}
                      error={!!errors.ruleId}
                      helperText={errors.ruleId?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="referenceId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Reference Document</InputLabel>
                      <Select {...field} label="Reference Document">
                        <MenuItem value="">None</MenuItem>
                        {documents.map((doc) => (
                          <MenuItem key={doc.documentId} value={doc.documentId}>
                            {doc.documentId} ({doc.valueType}: {doc.documentValue})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="expression"
                  control={control}
                  rules={{ required: 'Expression is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Expression"
                      fullWidth
                      placeholder="e.g., age > 18, city IN ['Mumbai', 'Delhi']"
                      error={!!errors.expression}
                      helperText={errors.expression?.message || "Enter condition expression"}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description"
                      fullWidth
                      multiline
                      rows={2}
                    />
                  )}
                />
              </Grid>
              
              {/* On True Section */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  When Condition is True:
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="onTrueType"
                  control={control}
                  rules={{ required: 'On True type is required' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.onTrueType}>
                      <InputLabel>Action Type</InputLabel>
                      <Select {...field} label="Action Type">
                        <MenuItem value={OutcomeType.VALUE}>Return Value</MenuItem>
                        <MenuItem value={OutcomeType.RULE}>Go to Rule</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="onTrueValue"
                  control={control}
                  rules={{ required: 'On True value is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Value/Rule ID"
                      fullWidth
                      error={!!errors.onTrueValue}
                      helperText={errors.onTrueValue?.message}
                    />
                  )}
                />
              </Grid>
              
              {/* On False Section */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  When Condition is False:
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="onFalseType"
                  control={control}
                  rules={{ required: 'On False type is required' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.onFalseType}>
                      <InputLabel>Action Type</InputLabel>
                      <Select {...field} label="Action Type">
                        <MenuItem value={OutcomeType.VALUE}>Return Value</MenuItem>
                        <MenuItem value={OutcomeType.RULE}>Go to Rule</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="onFalseValue"
                  control={control}
                  rules={{ required: 'On False value is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Value/Rule ID"
                      fullWidth
                      error={!!errors.onFalseValue}
                      helperText={errors.onFalseValue?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} variant="contained">
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Rule Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Rule Details</DialogTitle>
        <DialogContent>
          {selectedRule && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedRule.ruleId}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedRule.description}
              </Typography>
              
              <Box display="flex" gap={2} mb={3}>
                <Chip label={`ID: ${selectedRule.ruleId}`} />
                <Chip 
                  label={selectedRule.isActive ? 'Active' : 'Inactive'}
                  color={selectedRule.isActive ? 'success' : 'default'}
                />
                {selectedRule.referenceId && (
                  <Chip label={`Ref: ${selectedRule.referenceId}`} variant="outlined" />
                )}
              </Box>

              <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Expression:
                </Typography>
                <Typography variant="body1" fontFamily="monospace">
                  {selectedRule.expression}
                </Typography>
              </Paper>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: 'success.50' }}>
                    <Typography variant="subtitle2" color="success.main" gutterBottom>
                      When True:
                    </Typography>
                    <Typography variant="body2">
                      {selectedRule.onTrueType === 'VALUE' 
                        ? `Return: ${selectedRule.onTrueValue}`
                        : `Go to Rule: ${selectedRule.onTrueValue}`}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: 'error.50' }}>
                    <Typography variant="subtitle2" color="error.main" gutterBottom>
                      When False:
                    </Typography>
                    <Typography variant="body2">
                      {selectedRule.onFalseType === 'VALUE'
                        ? `Return: ${selectedRule.onFalseValue}`
                        : `Go to Rule: ${selectedRule.onFalseValue}`}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RuleManagement;