import React, { useState, useMemo } from 'react';
import {
  TreeView,
  TreeItem,
} from '@mui/x-tree-view';
import {
  ExpandMore,
  ChevronRight,
  Policy as PolicyIcon,
  Rule as RuleIcon,
  Description as DocumentIcon,
} from '@mui/icons-material';
import {
  Box,
  Typography,
  Chip,
  Tooltip,
} from '@mui/material';
import { Policy, Rule, Document } from '../types';

interface PolicyTreeViewProps {
  policies: Policy[];
  rules: Rule[];
  documents?: Document[];
  onSelectPolicy?: (policy: Policy) => void;
  onSelectRule?: (rule: Rule) => void;
}

interface TreeNodeData {
  id: string;
  name: string;
  type: 'policy' | 'rule' | 'document';
  data: Policy | Rule | Document;
  children?: TreeNodeData[];
}

const PolicyTreeView: React.FC<PolicyTreeViewProps> = ({
  policies,
  rules,
  documents = [],
  onSelectPolicy,
  onSelectRule,
}) => {
  const [expanded, setExpanded] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  const buildRuleTree = (ruleId: string, visitedRules = new Set<string>()): TreeNodeData | null => {
    if (visitedRules.has(ruleId)) {
      return null; // Prevent circular dependencies
    }

    const rule = rules.find(r => r.ruleId === ruleId);
    if (!rule) return null;

    visitedRules.add(ruleId);
    const children: TreeNodeData[] = [];

    // Add child rules based on onTrue and onFalse outcomes
    if (rule.onTrueType === 'RULE') {
      const childRule = buildRuleTree(rule.onTrueValue, new Set(visitedRules));
      if (childRule) {
        children.push(childRule);
      }
    }

    if (rule.onFalseType === 'RULE' && rule.onFalseValue !== rule.onTrueValue) {
      const childRule = buildRuleTree(rule.onFalseValue, new Set(visitedRules));
      if (childRule) {
        children.push(childRule);
      }
    }

    return {
      id: `rule-${ruleId}`,
      name: ruleId,
      type: 'rule',
      data: rule,
      children: children.length > 0 ? children : undefined,
    };
  };

  const treeData = useMemo(() => {
    return policies.map(policy => {
      const rootRuleTree = buildRuleTree(policy.rootRuleId);
      return {
        id: `policy-${policy.policyId}`,
        name: policy.policyName,
        type: 'policy' as const,
        data: policy,
        children: rootRuleTree ? [rootRuleTree] : undefined,
      };
    });
  }, [policies, rules]);

  const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  const handleSelect = (event: React.SyntheticEvent, nodeId: string) => {
    setSelected([nodeId]);
    
    if (nodeId) {
      const [type, id] = nodeId.split('-');
      
      if (type === 'policy') {
        const policy = policies.find(p => p.policyId === id);
        if (policy && onSelectPolicy) {
          onSelectPolicy(policy);
        }
      } else if (type === 'rule') {
        const rule = rules.find(r => r.ruleId === id);
        if (rule && onSelectRule) {
          onSelectRule(rule);
        }
      }
    }
  };

  const renderTreeItems = (nodes: TreeNodeData[]): React.ReactNode => {
    return nodes.map((node) => (
      <TreeItem
        key={node.id}
        nodeId={node.id}
        label={
          <Box display="flex" alignItems="center" gap={1} py={0.5}>
            {node.type === 'policy' ? (
              <PolicyIcon sx={{ fontSize: 16, color: 'primary.main' }} />
            ) : node.type === 'rule' ? (
              <RuleIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
            ) : (
              <DocumentIcon sx={{ fontSize: 16, color: 'success.main' }} />
            )}
            
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              {node.name}
            </Typography>
            
            {node.type === 'policy' && (
              <Chip
                label={(node.data as Policy).isActive ? 'Active' : 'Inactive'}
                color={(node.data as Policy).isActive ? 'success' : 'default'}
                size="small"
                sx={{ height: 16, fontSize: '0.6rem' }}
              />
            )}
            
            {node.type === 'rule' && (
              <Tooltip title={(node.data as Rule).expression}>
                <Chip
                  label={(node.data as Rule).isActive ? 'Active' : 'Inactive'}
                  color={(node.data as Rule).isActive ? 'success' : 'default'}
                  size="small"
                  sx={{ height: 16, fontSize: '0.6rem' }}
                />
              </Tooltip>
            )}
          </Box>
        }
      >
        {node.children && renderTreeItems(node.children)}
      </TreeItem>
    ));
  };

  const renderRuleDetails = (rule: Rule) => (
    <Box sx={{ mt: 1, pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
      <Typography variant="caption" color="text.secondary">
        Expression: {rule.expression}
      </Typography>
      <br />
      <Typography variant="caption" color="text.secondary">
        On True: {rule.onTrueType === 'VALUE' ? `Return ${rule.onTrueValue}` : `Go to ${rule.onTrueValue}`}
      </Typography>
      <br />
      <Typography variant="caption" color="text.secondary">
        On False: {rule.onFalseType === 'VALUE' ? `Return ${rule.onFalseValue}` : `Go to ${rule.onFalseValue}`}
      </Typography>
    </Box>
  );

  if (treeData.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body2" color="text.secondary">
          No policies to display
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 500, overflowY: 'auto' }}>
      <TreeView
        defaultCollapseIcon={<ExpandMore />}
        defaultExpandIcon={<ChevronRight />}
        expanded={expanded}
        selected={selected[0]}
        onNodeToggle={handleToggle}
        onNodeSelect={handleSelect}
        sx={{
          flexGrow: 1,
          maxWidth: 400,
          overflowY: 'auto',
        }}
      >
        {renderTreeItems(treeData)}
      </TreeView>
      
      {/* Show details for selected rule */}
      {selected.length > 0 && selected[0].startsWith('rule-') && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Rule Details
          </Typography>
          {(() => {
            const ruleId = selected[0].split('-')[1];
            const rule = rules.find(r => r.ruleId === ruleId);
            return rule ? renderRuleDetails(rule) : null;
          })()}
        </Box>
      )}
    </Box>
  );
};

export default PolicyTreeView;
