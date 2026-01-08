# Rule Engine UI

A comprehensive React TypeScript application for managing business rules, policies, and documents with interactive tree visualization and real-time evaluation capabilities.

## Features

### 🏗️ Complete Rule Management System
- **Dashboard**: Overview of policies, rules, and documents with statistics
- **Policy Management**: Create, edit, delete, and manage business policies
- **Rule Management**: Full CRUD operations for business rules with search functionality
- **Document Management**: Manage reference documents with type validation
- **Evaluation Interface**: Test policies and rules with real user data

### 🌳 Interactive Tree Visualization
- Visual representation of policy-rule relationships
- Expandable tree structure showing rule dependencies
- Real-time rule details and execution paths
- Circular dependency detection

### 🔧 Advanced Features
- **Real-time Evaluation**: Test policies and rules instantly
- **Bulk Evaluation**: Compare multiple policies simultaneously  
- **Execution Tracing**: Detailed step-by-step rule execution
- **Search & Filter**: Advanced search across rules and policies
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Type Safety**: Full TypeScript implementation

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **UI Framework**: Material-UI (MUI) v5
- **State Management**: React Query for server state
- **Form Handling**: React Hook Form with validation
- **Tree Visualization**: MUI X Tree View
- **HTTP Client**: Axios
- **Routing**: React Router v6

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Rule Engine Backend Service running on port 8080

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ruleengine-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

### Backend Configuration

The application expects the Rule Engine backend service to be running on `http://localhost:8080`. Make sure the backend APIs are available at:

- Policies: `/api/policies/*`
- Rules: `/api/rules/*` 
- Documents: `/api/documents/*`
- Evaluation: `/api/evaluation/*`

## Project Structure

```
src/
├── components/           # React components
│   ├── Dashboard.tsx           # Main dashboard
│   ├── PolicyManagement.tsx   # Policy CRUD operations
│   ├── RuleManagement.tsx     # Rule CRUD operations  
│   ├── DocumentManagement.tsx # Document CRUD operations
│   ├── EvaluationInterface.tsx # Rule/policy testing
│   └── PolicyTreeView.tsx     # Interactive tree visualization
├── services/
│   └── api.ts           # API service layer
├── types/
│   └── index.ts         # TypeScript type definitions
├── App.tsx              # Main application component
└── index.tsx            # Application entry point
```

## Component Features

### Dashboard
- Statistics overview of policies, rules, and documents
- Recent policies and rules display
- Active/inactive status indicators
- Quick navigation to management sections

### Policy Management
- Create, edit, delete policies
- Associate rules with policies
- Set policy priorities
- Interactive tree view of policy structure
- Activate/deactivate policies

### Rule Management  
- Full CRUD operations for rules
- Expression editor with validation
- Reference document selection
- Outcome configuration (VALUE/RULE)
- Search rules by expression
- Visual rule details with execution paths

### Document Management
- Type-safe document creation (STRING, INTEGER, DOUBLE, BOOLEAN)
- Value validation based on type
- Filter documents by type
- Recent documents sidebar
- Visual type indicators

### Evaluation Interface
- Test single policies or rules
- Bulk policy comparison
- Dynamic user attribute input
- Execution trace visualization
- Performance metrics display
- Evaluation history tracking

### Tree Visualization
- Hierarchical policy-rule relationships
- Interactive node selection
- Rule dependency visualization
- Circular dependency prevention
- Detailed rule information on hover

## API Integration

The application integrates with a Rule Engine backend service providing:

### Policy APIs
- `GET /api/policies` - Get all policies
- `POST /api/policies` - Create policy
- `PUT /api/policies/{id}` - Update policy
- `DELETE /api/policies/{id}` - Delete policy
- `PATCH /api/policies/{id}/activate` - Activate policy

### Rule APIs  
- `GET /api/rules` - Get all rules
- `POST /api/rules` - Create rule
- `PUT /api/rules/{id}` - Update rule
- `DELETE /api/rules/{id}` - Delete rule
- `GET /api/rules/search?keyword={keyword}` - Search rules

### Document APIs
- `GET /api/documents` - Get all documents
- `POST /api/documents` - Create document
- `PUT /api/documents/{id}` - Update document
- `DELETE /api/documents/{id}` - Delete document

### Evaluation APIs
- `POST /api/evaluation/policies/{id}` - Evaluate policy
- `POST /api/evaluation/rules/{id}` - Evaluate rule  
- `POST /api/evaluation/policies/bulk` - Bulk policy evaluation

## Usage Examples

### Creating a Rule
1. Navigate to Rules page
2. Click "Create Rule" 
3. Enter rule ID and expression (e.g., `age > 18`)
4. Select reference document if needed
5. Configure outcomes for true/false conditions
6. Save the rule

### Creating a Policy
1. Navigate to Policies page
2. Click "Create Policy"
3. Enter policy details
4. Select root rule (entry point)
5. Associate additional rules
6. Set priority and save

### Testing a Policy
1. Navigate to Evaluation page  
2. Select "Single Policy" evaluation type
3. Choose policy to test
4. Add user attributes (age: 25, income: 50000)
5. Click "Run Evaluation"
6. View results with execution trace

## Development

### Available Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Code Style
- TypeScript strict mode enabled
- ESLint configuration for React
- Consistent Material-UI component usage
- React Hook Form for form handling
- React Query for data fetching

## Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
Create `.env` file for custom configuration:
```env
REACT_APP_API_URL=http://your-backend-url/api
```

## Contributing

1. Follow TypeScript best practices
2. Use Material-UI components consistently  
3. Implement proper error handling
4. Add loading states for async operations
5. Maintain responsive design patterns

## Browser Support

- Chrome 90+
- Firefox 88+  
- Safari 14+
- Edge 90+

## License

This project is part of the Rule Engine system for loan processing and business rule management.