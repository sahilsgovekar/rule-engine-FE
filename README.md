# Rule Engine UI

A React TypeScript application for managing business rules, policies, and documents with interactive tree visualization and real-time evaluation capabilities.

## Overview

This UI provides business teams with an intuitive interface to:
- **Manage Policies**: Create, edit, and organize business policies
- **Define Rules**: Build complex rule logic with visual tree structure
- **Manage Documents**: Handle reference values and constants
- **Test & Evaluate**: Real-time testing of policies and rules
- **Visualize Relationships**: Interactive tree view of rule dependencies

## Features

- 🎯 **Complete CRUD Operations** for policies, rules, and documents
- 🌳 **Interactive Tree Visualization** showing rule relationships
- 🧪 **Real-time Evaluation** with execution traces
- 📱 **Responsive Design** works on all devices
- 🔍 **Advanced Search & Filtering** capabilities
- ⚡ **Professional UI** with Material-UI components

## Quick Start

### Prerequisites
- Node.js 16+
- Rule Engine Backend Service (Spring Boot) - [Backend Repository](https://github.com/sahilsgovekar/rule-engine-BE.git)

### Installation
```bash
npm install
npm start
```

## Documentation

📖 **[Local Setup Guide](./runningLocally.md)** - Complete setup instructions including backend configuration

🎮 **[UI Usage Guide](./ui-usage.md)** - Step-by-step guide with screenshots on how to use the interface

## Technology Stack
- React 18 + TypeScript
- Material-UI (MUI) v5
- React Query
- React Router v6
- React Hook Form

## Project Structure
```
src/
├── components/     # React components
├── services/       # API service layer
├── types/          # TypeScript definitions
└── App.tsx         # Main application
```

## Support

For setup issues, see [Local Setup Guide](./runningLocally.md)  
For usage help, see [UI Usage Guide](./ui-usage.md)
