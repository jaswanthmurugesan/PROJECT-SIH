# Phase 5 Dashboard Frontend

## Overview
This is the frontend application for the Phase 5 Dashboard, built with React, Vite, and Tailwind CSS. It provides different dashboard views for learners, trainers, and policymakers.

## Features
- **Learner Dashboard**: Track learning progress, skills, and course enrollment
- **Trainer Dashboard**: Manage courses, view student feedback, and schedule classes
- **Policymaker Dashboard**: Monitor program analytics and manage educational policies
- Responsive design with Tailwind CSS
- Modern React with hooks
- Fast development with Vite

## Technology Stack
- **React 18** - UI framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **ESLint** - Code linting

## Setup Instructions

### Prerequisites
- Node.js 16 or higher
- npm or yarn package manager

### Installation
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The application will be available at http://localhost:3000

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure
```
frontend/
├── src/
│   ├── components/           # React components
│   │   ├── LearnerDashboard.jsx
│   │   ├── TrainerDashboard.jsx
│   │   └── PolicymakerDashboard.jsx
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # Application entry point
│   ├── index.css            # Global styles with Tailwind
│   └── api.js               # API client configuration
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
├── tailwind.config.cjs      # Tailwind CSS configuration
├── postcss.config.cjs       # PostCSS configuration
└── README.md               # This file
```

## API Integration
The application is configured to connect to the backend API running on `http://localhost:8000`. Make sure the backend server is running before starting the frontend.

## Component Overview

### LearnerDashboard
- Personal profile display
- Learning progress tracking
- Skills and course enrollment overview
- Recent activity timeline

### TrainerDashboard
- Trainer profile and specializations
- Course management
- Upcoming class schedule
- Student feedback display

### PolicymakerDashboard
- System-wide analytics and metrics
- Policy management interface
- Growth trends visualization
- Recent policy updates

## Styling
The application uses Tailwind CSS for styling with a custom color palette. The primary color scheme uses blue tones, and the design follows modern UI principles with clean layouts and proper spacing.

## Development Notes
- The application uses React hooks for state management
- API calls are handled through a centralized API client
- Components are designed to be responsive and accessible
- Loading states and error handling are implemented throughout