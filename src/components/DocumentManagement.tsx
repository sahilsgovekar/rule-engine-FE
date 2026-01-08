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
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Description as DocumentIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
import api from '../services/api';
import { Document, CreateDocumentForm, ValueType } from '../types';

const DocumentManagement: React.FC = () => {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading, error } = useQuery('documents', () =>
    api.documents.getAllDocuments().then(res => res.data)
  );

  const { data: recentDocuments = [] } = useQuery('recentDocuments', () =>
    api.documents.getRecentDocuments().then(res => res.data)
  );

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<CreateDocumentForm>();
  const watchValueType = watch('valueType');

  const createDocumentMutation = useMutation(api.documents.createDocument, {
    onSuccess: () => {
      queryClient.invalidateQueries('documents');
      queryClient.invalidateQueries('recentDocuments');
      handleCloseDialog();
    },
  });

  const updateDocumentMutation = useMutation(
    ({ documentId, data }: { documentId: string; data: CreateDocumentForm }) =>
      api.documents.updateDocument(documentId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('documents');
        queryClient.invalidateQueries('recentDocuments');
        handleCloseDialog();
      },
    }
  );

  const deleteDocumentMutation = useMutation(api.documents.deleteDocument, {
    onSuccess: () => {
      queryClient.invalidateQueries('documents');
      queryClient.invalidateQueries('recentDocuments');
    },
  });

  const handleOpenCreateDialog = () => {
    setIsEditing(false);
    setSelectedDocument(null);
    reset({
      documentId: '',
      documentValue: '',
      valueType: ValueType.STRING,
    });
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (document: Document) => {
    setIsEditing(true);
    setSelectedDocument(document);
    reset({
      documentId: document.documentId,
      documentValue: document.documentValue,
      valueType: document.valueType,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedDocument(null);
    reset();
  };

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
    setViewDialogOpen(true);
  };

  const onSubmit = (data: CreateDocumentForm) => {
    if (isEditing && selectedDocument) {
      updateDocumentMutation.mutate({ documentId: selectedDocument.documentId, data });
    } else {
      createDocumentMutation.mutate(data);
    }
  };

  const handleDelete = (documentId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteDocumentMutation.mutate(documentId);
    }
  };

  const getValueTypeColor = (type: ValueType) => {
    switch (type) {
      case ValueType.STRING: return 'primary';
      case ValueType.INTEGER: return 'success';
      case ValueType.DOUBLE: return 'warning';
      case ValueType.BOOLEAN: return 'secondary';
      default: return 'default';
    }
  };

  const filteredDocuments = selectedType === 'all' 
    ? documents 
    : documents.filter(doc => doc.valueType === selectedType);

  const getPlaceholderForType = (type: ValueType) => {
    switch (type) {
      case ValueType.STRING: return 'e.g., Mumbai, Active, Premium';
      case ValueType.INTEGER: return 'e.g., 25, 100, 1000';
      case ValueType.DOUBLE: return 'e.g., 3.14, 99.99, 750.5';
      case ValueType.BOOLEAN: return 'true or false';
      default: return 'Enter value';
    }
  };

  const validateValue = (value: string, type: ValueType) => {
    switch (type) {
      case ValueType.INTEGER:
        return /^\d+$/.test(value) || 'Must be a valid integer';
      case ValueType.DOUBLE:
        return /^\d+(\.\d+)?$/.test(value) || 'Must be a valid number';
      case ValueType.BOOLEAN:
        return ['true', 'false'].includes(value.toLowerCase()) || 'Must be true or false';
      default:
        return true;
    }
  };

  if (error) {
    return <Alert severity="error">Error loading documents</Alert>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Document Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Create Document
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} md={8}>
          <Box mb={3}>
            <Grid container spacing={2}>
              {Object.values(ValueType).map((type) => {
                const count = documents.filter(doc => doc.valueType === type).length;
                return (
                  <Grid item xs={6} sm={3} key={type}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        borderColor: selectedType === type ? 'primary.main' : 'divider',
                        borderWidth: selectedType === type ? 2 : 1,
                        borderStyle: 'solid'
                      }}
                      onClick={() => setSelectedType(selectedType === type ? 'all' : type)}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 1 }}>
                        <Typography variant="h4" color={`${getValueTypeColor(type)}.main`}>
                          {count}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {type}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          {/* Filter Controls */}
          <Box mb={2}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filter by Type</InputLabel>
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                label="Filter by Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                {Object.values(ValueType).map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Document ID</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDocuments.map((document) => (
                  <TableRow key={document.documentId}>
                    <TableCell>{document.documentId}</TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: document.valueType === ValueType.STRING ? 'inherit' : 'monospace',
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {document.documentValue}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={document.valueType}
                        color={getValueTypeColor(document.valueType)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {document.createdAt ? 
                        new Date(document.createdAt).toLocaleDateString() : 
                        '-'
                      }
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleViewDocument(document)} size="small">
                        <ViewIcon />
                      </IconButton>
                      <IconButton onClick={() => handleOpenEditDialog(document)} size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDelete(document.documentId)} 
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

        {/* Recent Documents Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 600 }}>
            <Typography variant="h6" gutterBottom>
              Recent Documents
            </Typography>
            <Box sx={{ maxHeight: 520, overflowY: 'auto' }}>
              {recentDocuments.map((document) => (
                <Card key={document.documentId} sx={{ mb: 2, cursor: 'pointer' }}
                      onClick={() => handleViewDocument(document)}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <DocumentIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="medium" noWrap>
                        {document.documentId}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        fontFamily: document.valueType === ValueType.STRING ? 'inherit' : 'monospace',
                        mb: 1 
                      }}
                    >
                      {document.documentValue}
                    </Typography>
                    <Chip
                      label={document.valueType}
                      color={getValueTypeColor(document.valueType)}
                      size="small"
                    />
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Create/Edit Document Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEditing ? 'Edit Document' : 'Create New Document'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="documentId"
                  control={control}
                  rules={{ required: 'Document ID is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Document ID"
                      fullWidth
                      disabled={isEditing}
                      error={!!errors.documentId}
                      helperText={errors.documentId?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="valueType"
                  control={control}
                  rules={{ required: 'Value type is required' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.valueType}>
                      <InputLabel>Value Type</InputLabel>
                      <Select {...field} label="Value Type">
                        {Object.values(ValueType).map((type) => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="documentValue"
                  control={control}
                  rules={{ 
                    required: 'Document value is required',
                    validate: (value) => validateValue(value, watchValueType)
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Document Value"
                      fullWidth
                      placeholder={watchValueType ? getPlaceholderForType(watchValueType) : ''}
                      error={!!errors.documentValue}
                      helperText={errors.documentValue?.message}
                      InputProps={{
                        sx: {
                          fontFamily: watchValueType === ValueType.STRING ? 'inherit' : 'monospace'
                        }
                      }}
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

      {/* View Document Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Document Details</DialogTitle>
        <DialogContent>
          {selectedDocument && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedDocument.documentId}
              </Typography>
              
              <Box display="flex" gap={2} mb={3}>
                <Chip label={`ID: ${selectedDocument.documentId}`} />
                <Chip 
                  label={selectedDocument.valueType}
                  color={getValueTypeColor(selectedDocument.valueType)}
                />
              </Box>

              <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Value:
                </Typography>
                <Typography 
                  variant="h6"
                  sx={{ 
                    fontFamily: selectedDocument.valueType === ValueType.STRING ? 'inherit' : 'monospace',
                    color: 'primary.main',
                    wordBreak: 'break-all'
                  }}
                >
                  {selectedDocument.documentValue}
                </Typography>
              </Paper>

              {(selectedDocument.createdAt || selectedDocument.updatedAt) && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Timestamps:
                  </Typography>
                  {selectedDocument.createdAt && (
                    <Typography variant="body2" color="text.secondary">
                      Created: {new Date(selectedDocument.createdAt).toLocaleString()}
                    </Typography>
                  )}
                  {selectedDocument.updatedAt && (
                    <Typography variant="body2" color="text.secondary">
                      Updated: {new Date(selectedDocument.updatedAt).toLocaleString()}
                    </Typography>
                  )}
                </Box>
              )}
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

export default DocumentManagement;