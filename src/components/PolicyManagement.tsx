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
  Autocomplete,
  Grid,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
import api from '../services/api';
import { Policy, CreatePolicyForm, Rule } from '../types';
import PolicyTreeView from './PolicyTreeView';

const PolicyManagement: React.FC = () => {
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: policies = [], isLoading, error } = useQuery('policies', () =>
    api.policies.getAllPolicies().then(res => res.data)
  );

  const { data: rules = [] } = useQuery('rules', () =>
    api.rules.getAllRules().then(res => res.data)
  );

  const { control, handleSubmit, reset, formState: { errors } } = useForm<CreatePolicyForm>();

  const createPolicyMutation = useMutation(api.policies.createPolicy, {
    onSuccess: () => {
      queryClient.invalidateQueries('policies');
      handleCloseDialog();
    },
  });

  const updatePolicyMutation = useMutation(
    ({ policyId, data }: { policyId: string; data: CreatePolicyForm }) =>
      api.policies.updatePolicy(policyId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('policies');
        handleCloseDialog();
      },
    }
  );

  const deletePolicyMutation = useMutation(api.policies.deletePolicy, {
    onSuccess: () => queryClient.invalidateQueries('policies'),
  });

  const activatePolicyMutation = useMutation(api.policies.activatePolicy, {
    onSuccess: () => queryClient.invalidateQueries('policies'),
  });

  const deactivatePolicyMutation = useMutation(api.policies.deactivatePolicy, {
    onSuccess: () => queryClient.invalidateQueries('policies'),
  });

  const handleOpenCreateDialog = () => {
    setIsEditing(false);
    setSelectedPolicy(null);
    reset({
      policyId: '',
      policyName: '',
      description: '',
      rootRuleId: '',
      ruleIds: [],
      priority: 1,
    });
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (policy: Policy) => {
    setIsEditing(true);
    setSelectedPolicy(policy);
    reset({
      policyId: policy.policyId,
      policyName: policy.policyName,
      description: policy.description || '',
      rootRuleId: policy.rootRuleId,
      ruleIds: policy.ruleIds,
      priority: policy.priority,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedPolicy(null);
    reset();
  };

  const handleViewPolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
    setViewDialogOpen(true);
  };

  const onSubmit = (data: CreatePolicyForm) => {
    if (isEditing && selectedPolicy) {
      updatePolicyMutation.mutate({ policyId: selectedPolicy.policyId, data });
    } else {
      createPolicyMutation.mutate(data);
    }
  };

  const handleDelete = (policyId: string) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      deletePolicyMutation.mutate(policyId);
    }
  };

  const handleToggleActive = (policy: Policy) => {
    if (policy.isActive) {
      deactivatePolicyMutation.mutate(policy.policyId);
    } else {
      activatePolicyMutation.mutate(policy.policyId);
    }
  };

  if (error) {
    return <Alert severity="error">Error loading policies</Alert>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Policy Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Create Policy
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Policy ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Root Rule</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {policies.map((policy) => (
                  <TableRow key={policy.policyId}>
                    <TableCell>{policy.policyId}</TableCell>
                    <TableCell>{policy.policyName}</TableCell>
                    <TableCell>{policy.rootRuleId}</TableCell>
                    <TableCell>{policy.priority}</TableCell>
                    <TableCell>
                      <Chip
                        label={policy.isActive ? 'Active' : 'Inactive'}
                        color={policy.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleViewPolicy(policy)} size="small">
                        <ViewIcon />
                      </IconButton>
                      <IconButton onClick={() => handleOpenEditDialog(policy)} size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleToggleActive(policy)} 
                        size="small"
                        color={policy.isActive ? 'warning' : 'success'}
                      >
                        {policy.isActive ? <StopIcon /> : <PlayIcon />}
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDelete(policy.policyId)} 
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
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 600 }}>
            <Typography variant="h6" gutterBottom>
              Policy Tree View
            </Typography>
            <PolicyTreeView policies={policies} rules={rules} />
          </Paper>
        </Grid>
      </Grid>

      {/* Create/Edit Policy Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? 'Edit Policy' : 'Create New Policy'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="policyId"
                  control={control}
                  rules={{ required: 'Policy ID is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Policy ID"
                      fullWidth
                      disabled={isEditing}
                      error={!!errors.policyId}
                      helperText={errors.policyId?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="policyName"
                  control={control}
                  rules={{ required: 'Policy name is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Policy Name"
                      fullWidth
                      error={!!errors.policyName}
                      helperText={errors.policyName?.message}
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
                      rows={3}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="rootRuleId"
                  control={control}
                  rules={{ required: 'Root rule is required' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.rootRuleId}>
                      <InputLabel>Root Rule</InputLabel>
                      <Select {...field} label="Root Rule">
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
              <Grid item xs={12} sm={6}>
                <Controller
                  name="priority"
                  control={control}
                  rules={{ required: 'Priority is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Priority"
                      type="number"
                      fullWidth
                      error={!!errors.priority}
                      helperText={errors.priority?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="ruleIds"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      multiple
                      options={rules.map(r => r.ruleId)}
                      getOptionLabel={(option) => {
                        const rule = rules.find(r => r.ruleId === option);
                        return rule ? `${rule.ruleId} - ${rule.expression}` : option;
                      }}
                      onChange={(_, value) => field.onChange(value)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Associated Rules"
                          placeholder="Select rules..."
                        />
                      )}
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

      {/* View Policy Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Policy Details</DialogTitle>
        <DialogContent>
          {selectedPolicy && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedPolicy.policyName}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedPolicy.description}
              </Typography>
              <Box display="flex" gap={2} mb={2}>
                <Chip label={`ID: ${selectedPolicy.policyId}`} />
                <Chip label={`Priority: ${selectedPolicy.priority}`} />
                <Chip 
                  label={selectedPolicy.isActive ? 'Active' : 'Inactive'}
                  color={selectedPolicy.isActive ? 'success' : 'default'}
                />
              </Box>
              <Typography variant="subtitle2" gutterBottom>
                Root Rule: {selectedPolicy.rootRuleId}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Associated Rules ({selectedPolicy.ruleIds.length}):
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {selectedPolicy.ruleIds.map((ruleId) => (
                  <Chip key={ruleId} label={ruleId} size="small" variant="outlined" />
                ))}
              </Box>
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

export default PolicyManagement;