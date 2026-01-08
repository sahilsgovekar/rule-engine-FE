import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Chip,
} from '@mui/material';
import {
  Policy as PolicyIcon,
  Rule as RuleIcon,
  Description as DocumentIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import api from '../services/api';

const Dashboard: React.FC = () => {
  const { data: policies = [] } = useQuery('policies', () => 
    api.policies.getAllPolicies().then(res => res.data)
  );

  const { data: rules = [] } = useQuery('rules', () => 
    api.rules.getAllRules().then(res => res.data)
  );

  const { data: documents = [] } = useQuery('documents', () => 
    api.documents.getAllDocuments().then(res => res.data)
  );

  const { data: activeRuleCount = 0 } = useQuery('activeRuleCount', () => 
    api.rules.getActiveRuleCount().then(res => res.data)
  );

  const activePolicies = policies.filter(p => p.isActive).length;
  const activeRules = activeRuleCount;
  const totalDocuments = documents.length;

  const stats = [
    {
      title: 'Total Policies',
      value: policies.length,
      active: activePolicies,
      icon: <PolicyIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary.main',
    },
    {
      title: 'Total Rules',
      value: rules.length,
      active: activeRules,
      icon: <RuleIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      color: 'secondary.main',
    },
    {
      title: 'Total Documents',
      value: totalDocuments,
      active: totalDocuments,
      icon: <DocumentIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success.main',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Rule Engine Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Overview of your business rules, policies, and documents
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h3" component="div" color={stat.color}>
                      {stat.value}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <ActiveIcon sx={{ color: 'success.main', fontSize: 16 }} />
                      <Typography variant="body2" color="text.secondary">
                        {stat.active} Active
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Recent Policies
            </Typography>
            <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
              {policies.slice(0, 10).map((policy) => (
                <Box
                  key={policy.policyId}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {policy.policyName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {policy.policyId}
                    </Typography>
                  </Box>
                  <Chip
                    label={policy.isActive ? 'Active' : 'Inactive'}
                    color={policy.isActive ? 'success' : 'default'}
                    size="small"
                    icon={policy.isActive ? <ActiveIcon /> : <InactiveIcon />}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Recent Rules
            </Typography>
            <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
              {rules.slice(0, 10).map((rule) => (
                <Box
                  key={rule.ruleId}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {rule.ruleId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {rule.expression}
                    </Typography>
                  </Box>
                  <Chip
                    label={rule.isActive ? 'Active' : 'Inactive'}
                    color={rule.isActive ? 'success' : 'default'}
                    size="small"
                    icon={rule.isActive ? <ActiveIcon /> : <InactiveIcon />}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;