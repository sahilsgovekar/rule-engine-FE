# Local Setup Guide

This guide will help you set up and run the Rule Engine UI application locally.

## Prerequisites

### System Requirements
- **Node.js 16 or higher** - [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download Git](https://git-scm.com/)

### Backend Service Requirements
- **Rule Engine Backend** (Spring Boot application) running on port 8080
  - **Repository**: [https://github.com/sahilsgovekar/rule-engine-BE.git](https://github.com/sahilsgovekar/rule-engine-BE.git)
- **Java 11 or higher** (for backend)
- **Maven** (for backend)

## Step 1: Clone and Setup Frontend

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ruleengine-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Verify the setup**
   ```bash
   npm run build
   ```

## Step 2: Backend Configuration

### Required Backend Service

The UI expects a Rule Engine backend service running on **port 8080** with the following API endpoints:

#### Core Endpoints Required:
- `GET /api/policies` - List all policies
- `POST /api/policies` - Create policy
- `PUT /api/policies/{id}` - Update policy
- `DELETE /api/policies/{id}` - Delete policy
- `PATCH /api/policies/{id}/activate` - Activate policy
- `PATCH /api/policies/{id}/deactivate` - Deactivate policy

- `GET /api/rules` - List all rules
- `POST /api/rules` - Create rule
- `PUT /api/rules/{id}` - Update rule
- `DELETE /api/rules/{id}` - Delete rule
- `GET /api/rules/search?keyword={keyword}` - Search rules
- `GET /api/rules/count/active` - Get active rule count

- `GET /api/documents` - List all documents
- `POST /api/documents` - Create document
- `PUT /api/documents/{id}` - Update document
- `DELETE /api/documents/{id}` - Delete document

- `POST /api/evaluation/policies/{id}` - Evaluate policy
- `POST /api/evaluation/rules/{id}` - Evaluate rule

### Starting the Backend Service

1. **Navigate to your backend project directory**
   ```bash
   cd /path/to/ruleengine-backend
   ```

2. **Start the Spring Boot application**
   ```bash
   mvn spring-boot:run
   ```
   
   Or if using JAR:
   ```bash
   java -jar target/ruleengine-backend.jar
   ```

3. **Verify backend is running**
   - Open browser: http://localhost:8080
   - Check health endpoint: http://localhost:8080/actuator/health
   - Verify API: http://localhost:8080/api/policies

## Step 3: Frontend Configuration

### API Configuration

The frontend is configured to connect to the backend through a proxy. The configuration is in:

#### `package.json`
```json
{
  "proxy": "http://localhost:8080"
}
```

#### `src/services/api.ts`
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';
```

### Environment Variables (Optional)

Create a `.env` file in the root directory to override default settings:

```env
# Custom backend URL (if not using proxy)
REACT_APP_API_URL=http://localhost:8080/api

# Development settings
REACT_APP_ENV=development
```

## Step 4: Start the Frontend Application

1. **Start the development server**
   ```bash
   npm start
   ```

2. **Application should open automatically at:**
   ```
   http://localhost:3000
   ```

3. **Verify the application is working:**
   - Dashboard loads without errors
   - Navigation works (Policies, Rules, Documents, Evaluation)
   - No CORS errors in browser console
   - Data loads from backend (counts show actual values, not 0)

## Step 5: Verify Full Integration

### Test Backend Connection
1. Open browser developer tools (F12)
2. Go to Network tab
3. Navigate to different sections in the UI
4. Verify API calls are successful (200 status codes)

### Test Basic Functionality
1. **Dashboard**: Should show actual counts from backend
2. **Policies**: Should list existing policies from database
3. **Rules**: Should list existing rules from database
4. **Documents**: Should list existing documents from database
5. **Evaluation**: Should allow testing policies/rules

## Troubleshooting

### Common Issues

#### 1. CORS Errors
**Problem**: `Access to XMLHttpRequest blocked by CORS policy`
**Solution**: 
- Ensure backend has CORS configuration
- Verify proxy setting in package.json
- Check API_BASE_URL configuration

#### 2. Connection Refused
**Problem**: `ERR_CONNECTION_REFUSED`
**Solution**:
- Verify backend is running on port 8080
- Check if port 8080 is available
- Restart both frontend and backend

#### 3. 404 Not Found
**Problem**: API endpoints return 404
**Solution**:
- Verify backend API endpoints are correct
- Check backend application.properties for server.servlet.context-path
- Ensure backend is fully started

#### 4. Empty Data (Showing 0 counts)
**Problem**: UI shows 0 policies, 0 rules, 0 documents
**Solution**:
- Check backend database has sample data
- Verify API endpoints return actual data
- Check browser network tab for API responses

### Backend CORS Configuration

Add to your Spring Boot application:

```java
@CrossOrigin(origins = "http://localhost:3000")
@RestController
public class YourController {
    // ... your endpoints
}
```

Or global CORS configuration:

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:3000")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")
                        .allowCredentials(true);
            }
        };
    }
}
```

## Development Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Type checking
npx tsc --noEmit
```

## Port Configuration

### Default Ports:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080

### Changing Ports:

#### Frontend Port:
```bash
PORT=3001 npm start
```

#### Backend Port:
Update `application.properties`:
```properties
server.port=8081
```

And update frontend proxy in `package.json`:
```json
{
  "proxy": "http://localhost:8081"
}
```

## Production Deployment

For production deployment:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Serve the build folder**
   ```bash
   npm install -g serve
   serve -s build -l 3000
   ```

3. **Configure environment variables**
   ```env
   REACT_APP_API_URL=https://your-backend-domain.com/api
   ```

## Next Steps

Once the application is running locally, see the [UI Usage Guide](./ui-usage.md) for detailed instructions on how to use the interface.