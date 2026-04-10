# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Smart Campus Management System - Frontend

A modern React 18 frontend application for managing campus resources, bookings, and maintenance tickets with Google OAuth integration and AI-powered suggestions.

## Overview

The Smart Campus Management System frontend provides an intuitive interface for university students, staff, and administrators to manage campus operations. The application features role-based dashboards, real-time booking management, and intelligent resource recommendations powered by rule-based AI suggestions.

## Tech Stack

- **React 18** - Modern UI framework with hooks and concurrent features
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **React Router DOM** - Client-side routing and navigation
- **Axios** - HTTP client for API communication
- **React Hot Toast** - Elegant notification system
- **JWT Authentication** - Secure token-based authentication
- **Google OAuth2** - Third-party authentication integration

## Features

### User Experience
- **Landing Page** - Home, about, and contact sections
- **Authentication** - JWT login/register with Google OAuth support
- **User Dashboard** - Personal stats, recent bookings, and tickets
- **Resource Browser** - Search, filter, and book campus resources
- **Booking Management** - View, create, and cancel bookings
- **Ticket System** - Create, view, and comment on maintenance tickets

### Administrative Features
- **Admin Dashboard** - Comprehensive management interface
- **Technician Dashboard** - Assigned tickets and status updates
- **AI Smart Suggestions** - Rule-based recommendations from localStorage
- **AI Learning Dashboard** - Track and improve AI suggestion feedback

## Prerequisites

- **Node.js 18** or higher
- **npm 9** or higher or **yarn 1.22** or higher
- **Git** for version control

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/PAF-Group-Project.git
PAF-Group-Project
```

### 2. Install Dependencies
```bash
# Using npm
npm install

# Or using yarn
yarn install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_URL=http://localhost:8080/api

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id_here

# Application Configuration
VITE_APP_NAME=Smart Campus Management System
VITE_APP_VERSION=1.0.0
```

### 4. Start Development Server
```bash
# Using npm
npm start

# Or using yarn
yarn start
```

The application will start on `http://localhost:5173`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API base URL | Yes |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth2 client ID | Yes |
| `VITE_APP_NAME` | Application name | No |
| `VITE_APP_VERSION` | Application version | No |

## Folder Structure

```bash
smart-campus-client/
src/
  components/          # Reusable UI components
    layout/            # Layout components (Navbar, Footer)
    common/            # Common components (Buttons, Forms)
  pages/               # Page components
    user/              # User-facing pages
    admin/             # Admin pages
    auth/              # Authentication pages
  context/             # React context providers
  api/                 # API service layer
    axiosInstance.js   # Axios configuration
  services/            # Business logic services
  hooks/               # Custom React hooks
  utils/               # Utility functions
  assets/              # Static assets (images, icons)
public/
  index.html           # HTML template
.env                   # Environment variables
package.json           # Dependencies and scripts
```

## Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint

# Run tests (if configured)
npm test
```

## Features Implementation Status

### Authentication & Authorization
- **JWT Login/Logout** - `JWT authentication with token management` - `status: completed`
- **User Registration** - `Email/password registration with validation` - `status: completed`
- **Google OAuth2** - `Google sign-in integration` - `status: completed`
- **Role-based Access** - `USER, ADMIN, TECHNICIAN role management` - `status: completed`

### Core Features
- **Resource Management** - `Browse, search, and filter campus resources` - `status: completed`
- **Booking System** - `Create, view, and cancel resource bookings` - `status: completed`
- **Ticket System** - `Create, view, comment on maintenance tickets` - `status: completed`
- **User Dashboard** - `Personal stats and activity overview` - `status: completed`

### Administrative Features
- **Admin Dashboard** - `Comprehensive admin management interface` - `status: completed`
- **Technician Dashboard** - `Assigned tickets and status management` - `status: completed`
- **Technician Management** - `Create and manage technician accounts` - `status: completed`

### AI Features
- **Smart Suggestions** - `Rule-based recommendations from localStorage` - `status: partial`
- **Learning Dashboard** - `Track AI suggestion feedback and improvements` - `status: partial`
- **Resource Recommendations** - `Personalized resource suggestions` - `status: partial`

## Screenshots

*Note: Screenshots will be added here as the application develops*

### Landing Page
![Landing Page](./docs/screenshots/landing-page.png)

### User Dashboard
![User Dashboard](./docs/screenshots/user-dashboard.png)

### Admin Dashboard
![Admin Dashboard](./docs/screenshots/admin-dashboard.png)

## Known Limitations

### AI Features
- **LocalStorage-based AI**: AI suggestions are stored and processed in localStorage, not using machine learning algorithms
- **Rule-based Recommendations**: Suggestions follow predefined rules rather than adaptive learning
- **No Backend AI Integration**: AI features don't communicate with backend ML services

### Authentication
- **OAuth Username Assignment**: Google OAuth users rely on backend to automatically assign usernames
- **Session Management**: JWT tokens are stored in localStorage (consider httpOnly cookies for production)

### Booking System
- **Frontend Availability Checks**: Resource availability validation is performed on frontend only
- **No Real-time Sync**: Booking status updates require manual refresh
- **Conflict Detection**: Limited real-time conflict detection between simultaneous bookings

### Data Management
- **Demo Data Support**: Can load demo data for testing purposes
- **No Offline Support**: Application requires active internet connection
- **Limited Caching**: Minimal data caching implemented

### Missing Features
- **Email Notifications**: No email notification system implemented
- **Payment Integration**: No payment processing for bookings
- **Mobile App**: No native mobile application
- **Real-time Updates**: No WebSocket implementation for live updates

## Development Guidelines

### Component Structure
- Use functional components with React hooks
- Implement proper TypeScript prop types (if using TypeScript)
- Follow consistent naming conventions
- Keep components focused and reusable

### State Management
- Use React Context for global state
- Prefer local state for component-specific data
- Implement proper error boundaries

### API Integration
- Use the centralized axiosInstance for all API calls
- Implement proper error handling and loading states
- Cache responses where appropriate

### Styling
- Use Tailwind CSS utility classes
- Follow responsive design principles
- Maintain consistent design system

## Testing

### Unit Tests
```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage
```

### E2E Tests
```bash
# Run end-to-end tests (if configured)
npm run test:e2e
```

## Build and Deployment

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment
The build output in `dist/` can be deployed to any static hosting service:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages
- Add tests for new features

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section below
- Review the API documentation for backend integration

## Troubleshooting

### Common Issues

#### 1. OAuth Login Not Working
**Problem**: Google OAuth login fails or redirects incorrectly
**Solution**: 
- Verify Google Client ID is correct in `.env`
- Ensure redirect URI is configured in Google Console
- Check that backend OAuth endpoints are accessible

#### 2. API Connection Errors
**Problem**: Cannot connect to backend API
**Solution**:
- Verify `VITE_API_URL` is correct in `.env`
- Check that backend server is running on expected port
- Ensure CORS is configured on backend

#### 3. Build Errors
**Problem**: Production build fails
**Solution**:
- Check for missing environment variables
- Verify all dependencies are installed
- Review build logs for specific error messages

#### 4. Styling Issues
**Problem**: Tailwind CSS classes not applying
**Solution**:
- Verify Tailwind CSS is properly configured
- Check that PostCSS configuration is correct
- Ensure CSS imports are in main entry point

#### 5. Routing Issues
**Problem**: Page navigation not working
**Solution**:
- Verify React Router configuration
- Check that route paths match component imports
- Ensure BrowserRouter is wrapping the application

