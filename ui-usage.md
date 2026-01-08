# UI Usage Guide

This guide provides step-by-step instructions on how to use the Rule Engine UI with detailed explanations of each feature.

## Getting Started

After starting the application (see [Local Setup Guide](./runningLocally.md)), open your browser to `http://localhost:3000`.

## Main Interface Overview

The application has a **sidebar navigation** on the left and a **main content area** on the right.

### Sidebar Navigation
- 🏠 **Dashboard** - Overview and statistics
- 📋 **Policies** - Manage business policies  
- ⚖️ **Rules** - Create and edit rules
- 📄 **Documents** - Manage reference values
- 🧪 **Evaluation** - Test policies and rules

---

## 1. Dashboard

**Purpose**: Get an overview of your rule engine system

### What You'll See:
- **Statistics Cards**: Total count of policies, rules, and documents with active/inactive status
- **Recent Policies**: List of recently created/modified policies
- **Recent Rules**: List of recently created/modified rules

### How to Use:
1. **View Statistics**: See total counts at the top
2. **Check Active Status**: Green indicators show active items
3. **Quick Navigation**: Click on any recent item to view details

---

## 2. Policy Management

**Purpose**: Create, organize, and manage business policies

### Main Features:

#### 2.1 Policy List View
**What You'll See**: 
- Table with columns: Policy ID, Name, Root Rule, Priority, Status, Actions
- **Create Policy** button at the top right
- **Policy Tree View** panel on the right side

#### 2.2 Creating a New Policy
**Step-by-Step**:

1. **Click "Create Policy"** button
2. **Fill in the form**:
   - **Policy ID**: Unique identifier (e.g., "loan_approval_policy")
   - **Policy Name**: Human-readable name (e.g., "Loan Approval Policy")
   - **Description**: Optional description of the policy
   - **Root Rule**: Select the starting rule from dropdown
   - **Priority**: Set priority number (higher = more important)
   - **Associated Rules**: Multi-select rules that belong to this policy

3. **Click "Create"** to save

#### 2.3 Viewing Policy Details
**How to View**:
1. **Click the eye icon** (👁️) in the Actions column
2. **View popup shows**:
   - Policy name and description
   - ID, priority, and status chips
   - Root rule information
   - List of all associated rules

#### 2.4 Editing a Policy
**How to Edit**:
1. **Click the edit icon** (✏️) in the Actions column
2. **Modify fields** in the popup form
3. **Click "Update"** to save changes

#### 2.5 Activating/Deactivating Policies
**How to Toggle**:
1. **Click the play/stop icon** (▶️/⏹️) in the Actions column
2. **Status changes immediately** (Active → Inactive or vice versa)

#### 2.6 Policy Tree Visualization
**What You'll See**: 
- Visual tree structure showing policy → rules relationships
- **Expandable nodes** showing rule dependencies
- **Color-coded status** indicators (Active/Inactive)

**How to Use**:
1. **Click on any policy node** to expand and see its rules
2. **Click on rule nodes** to see rule details below the tree
3. **Hover over nodes** to see additional information

---

## 3. Rule Management

**Purpose**: Create and manage individual business rules

### Main Features:

#### 3.1 Rule List View
**What You'll See**:
- Table with columns: Rule ID, Expression, Reference, On True, On False, Status, Actions
- **Search bar** at the top to search by expression
- **Create Rule** button at the top right

#### 3.2 Searching Rules
**How to Search**:
1. **Type in the search box** (e.g., "age > 18")
2. **Results filter automatically** as you type
3. **Clear search** to see all rules

#### 3.3 Creating a New Rule
**Step-by-Step**:

1. **Click "Create Rule"** button
2. **Fill in the Basic Information**:
   - **Rule ID**: Unique identifier (e.g., "age_check_rule")
   - **Reference Document**: Optional - select from dropdown if rule needs a reference value
   - **Expression**: The condition to evaluate (e.g., "age > 18", "city IN ['Mumbai', 'Delhi']")
   - **Description**: Optional description

3. **Configure "When Condition is True"**:
   - **Action Type**: Choose "Return Value" or "Go to Rule"
   - **Value/Rule ID**: Enter the value to return or rule ID to execute next

4. **Configure "When Condition is False"**:
   - **Action Type**: Choose "Return Value" or "Go to Rule"
   - **Value/Rule ID**: Enter the value to return or rule ID to execute next

5. **Click "Create"** to save

#### 3.4 Expression Examples
- **Simple comparison**: `age > 18`
- **String equality**: `status == 'active'`
- **List membership**: `city IN ['Mumbai', 'Delhi', 'Bangalore']`
- **Numeric comparison**: `creditScore >= 750`
- **With reference**: `income > minIncome` (where minIncome is a document)

#### 3.5 Viewing Rule Details
**How to View**:
1. **Click the eye icon** (👁️) in the Actions column
2. **View popup shows**:
   - Rule expression in highlighted box
   - True/False outcome configurations
   - Reference document (if any)
   - Status and timestamps

---

## 4. Document Management

**Purpose**: Manage reference values and constants used in rules

### Main Features:

#### 4.1 Document Overview
**What You'll See**:
- **Statistics cards** at the top showing count by type (STRING, INTEGER, DOUBLE, BOOLEAN)
- **Filter dropdown** to filter by value type
- **Main table** with Document ID, Value, Type, Created date, Actions
- **Recent Documents** sidebar on the right

#### 4.2 Creating a New Document
**Step-by-Step**:

1. **Click "Create Document"** button
2. **Fill in the form**:
   - **Document ID**: Unique identifier (e.g., "min_age", "max_loan_amount")
   - **Value Type**: Select from STRING, INTEGER, DOUBLE, BOOLEAN
   - **Document Value**: Enter the value (validates based on type)

3. **Value Examples by Type**:
   - **STRING**: "Mumbai", "Active", "Premium"
   - **INTEGER**: 18, 1000, 750
   - **DOUBLE**: 3.14, 99.99, 750.5  
   - **BOOLEAN**: true, false

4. **Click "Create"** to save

#### 4.3 Filtering Documents
**How to Filter**:
1. **Click on type statistics cards** at the top to filter by that type
2. **Or use the dropdown** "Filter by Type"
3. **Click "All Types"** to clear filter

#### 4.4 Using Documents in Rules
**Reference Example**:
- Create document: ID = "min_age", Value = "18", Type = INTEGER
- Create rule: Expression = "age > minAge", Reference = "min_age"
- The rule will compare user's age against the document value (18)

---

## 5. Evaluation Interface

**Purpose**: Test policies and rules with real user data

### Main Features:

#### 5.1 Evaluation Setup
**What You'll See**:
- **Evaluation form** on the left side
- **Results and history** on the right side

#### 5.2 Testing a Policy
**Step-by-Step**:

1. **Enter User ID**: Unique identifier for the test (e.g., "user123")
2. **Select "Single Policy"** from Evaluation Type dropdown
3. **Choose Policy**: Select the policy you want to test
4. **Add User Attributes**:
   - **Attribute Name**: Type or select from common attributes (age, income, creditScore, etc.)
   - **Value**: Enter the test value (25, 50000, 750, etc.)
   - **Click "Add Attribute"** to add more fields as needed

5. **Click "Run Evaluation"** button

#### 5.3 Understanding Results
**What You'll See**:
- **Approval Status**: Large APPROVED/REJECTED chip at the top
- **Performance**: Execution time in milliseconds
- **Confidence Score**: Percentage confidence in the decision
- **Reason**: Text explanation of why the decision was made
- **Execution Trace**: Step-by-step breakdown of rule evaluation

#### 5.4 Execution Trace Details
**What It Shows**:
- **Each rule executed** in order
- **Rule expression** that was evaluated  
- **Result** (True/False) for each step
- **Next action** taken based on the result
- **Execution time** for each rule

#### 5.5 Testing Multiple Policies (Bulk Evaluation)
**How to Use**:
1. **Select "Multiple Policies"** from Evaluation Type
2. **Choose multiple policies** from the multi-select dropdown
3. **Add user attributes** (same as single policy)
4. **Click "Run Evaluation"**
5. **Compare results** from different policies side-by-side

#### 5.6 Testing Single Rules
**How to Use**:
1. **Select "Single Rule"** from Evaluation Type
2. **Choose a rule** from the dropdown
3. **Add user attributes** that the rule needs
4. **Click "Run Evaluation"**
5. **See rule-specific results** and execution trace

### 5.7 Evaluation History
**What You'll See**:
- **Recent Evaluations** panel on the right
- **Quick summary** of each evaluation (ID, result, timestamp)
- **Click on any history item** to view full details

---

## Common Workflows

### Workflow 1: Creating a Complete Policy
1. **Go to Documents** → Create reference values (e.g., min_age: 18)
2. **Go to Rules** → Create individual rules using the documents
3. **Go to Policies** → Create policy linking the rules together
4. **Go to Evaluation** → Test the policy with sample user data

### Workflow 2: Debugging a Policy
1. **Go to Evaluation** → Test the policy with failing data
2. **Review Execution Trace** → Identify which rule is failing
3. **Go to Rules** → Edit the problematic rule
4. **Return to Evaluation** → Re-test to verify the fix

### Workflow 3: Managing Rule Dependencies
1. **Go to Policies** → View the policy tree
2. **Expand nodes** to see rule relationships
3. **Click on rules** to view their details in the tree view
4. **Identify circular dependencies** (system prevents these automatically)

---

## Tips for Best Practices

### Rule Creation Tips:
- **Use descriptive Rule IDs**: "age_eligibility_check" instead of "rule1"
- **Write clear expressions**: "age >= 18" instead of "a > 17"
- **Document complex logic**: Use the description field
- **Test immediately**: Use Evaluation interface after creating rules

### Policy Organization Tips:
- **Set clear priorities**: Higher numbers = higher priority
- **Use meaningful names**: "Premium Loan Policy" instead of "Policy A"
- **Organize by business function**: Group related rules together
- **Document the purpose**: Use description fields

### Document Management Tips:
- **Use consistent naming**: "min_age", "max_loan_amount"
- **Choose appropriate types**: Use INTEGER for numbers, not STRING
- **Update centrally**: Change document values instead of hardcoding in rules
- **Group logically**: Use prefixes like "min_", "max_", "default_"

### Testing Tips:
- **Test edge cases**: Boundary values (age = 18, not just 25)
- **Test multiple scenarios**: Both approval and rejection cases
- **Use realistic data**: Actual user-like values
- **Check execution traces**: Understand the decision path
- **Test after changes**: Always re-test after modifying rules

---

## Troubleshooting Common Issues

### Issue: "No data showing"
**Solution**: Check if backend is running and has sample data

### Issue: "Can't create rule"  
**Solution**: Verify all required fields are filled and expression syntax is correct

### Issue: "Evaluation fails"
**Solution**: Check that user attributes match what the rules expect

### Issue: "Tree view not loading"
**Solution**: Ensure policies have valid root rules and associated rules

---

## Keyboard Shortcuts

- **Ctrl/Cmd + Click** on navigation items: Open in background
- **ESC**: Close any open dialog
- **Enter**: Submit forms when in input fields
- **Tab**: Navigate between form fields

---

## Getting Help

- Check [Local Setup Guide](./runningLocally.md) for technical issues
- Review this guide for usage questions
- Use browser developer tools (F12) to check for API errors
- Verify backend is running on port 8080