# React Frontend Documentation

## Overview
This is a modern React frontend application built with Vite, designed to work with the Universal CRUD Template backend APIs. It provides a complete user interface for managing products, categories, and users with authentication.

## Tech Stack
- **React 18.2.0** - Modern React with hooks
- **Vite** - Fast development server and build tool
- **React Router DOM** - Client-side routing
- **React Query** - Data fetching and caching
- **React Hook Form** - Form handling and validation
- **Tailwind CSS** - Utility-first CSS framework
- **React Hot Toast** - Toast notifications
- **Lucide React** - Modern icon library

## Project Structure
```
frontend/react/
├── public/                     # Static assets
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── Layout.jsx        # Main application layout
│   │   ├── Navbar.jsx        # Navigation component
│   │   ├── LoadingSpinner.jsx # Loading indicator
│   │   └── Modal.jsx         # Modal dialog component
│   ├── contexts/             # React contexts
│   │   └── AuthContext.jsx   # Authentication state management
│   ├── lib/                  # Utilities and configurations
│   │   └── api.js           # API client and endpoints
│   ├── pages/               # Application pages/routes
│   │   ├── Login.jsx        # Login page
│   │   ├── Register.jsx     # Registration page
│   │   ├── Dashboard.jsx    # Main dashboard
│   │   ├── Products.jsx     # Product listing page
│   │   ├── ProductDetails.jsx # Product detail view
│   │   ├── ProductCreate.jsx  # Create product form
│   │   ├── ProductEdit.jsx    # Edit product form
│   │   ├── Categories.jsx     # Category management
│   │   ├── Users.jsx          # User management (admin only)
│   │   ├── Profile.jsx        # User profile page
│   │   └── NotFound.jsx       # 404 error page
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # Application entry point
│   └── index.css            # Global styles with Tailwind
├── index.html               # HTML template
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
└── vite.config.js          # Vite configuration
```

## Features

### Authentication System
- **JWT-based authentication** with automatic token management
- **Login/Register pages** with form validation
- **Protected routes** that require authentication
- **Role-based access control** (admin/user permissions)
- **Automatic logout** on token expiration

### Product Management
- **Product listing** with pagination, search, and filtering
- **Product details** with full information display
- **Create/Edit products** with form validation
- **Image URL support** with preview functionality
- **Category association** and status management
- **Responsive grid layout** for product cards

### Category Management
- **Category CRUD operations** (admin only)
- **Product count tracking** per category
- **Search and filter capabilities**
- **Modal-based forms** for create/edit operations

### User Management
- **User administration** (admin only)
- **Role assignment** and permission management
- **Password management** with secure handling
- **User profile editing** with password change

### UI/UX Features
- **Responsive design** that works on all devices
- **Modern, clean interface** with Tailwind CSS
- **Loading states** and error handling
- **Toast notifications** for user feedback
- **Consistent design system** with reusable components
- **Accessibility features** with proper ARIA labels

## Installation and Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- Backend API running (Node.js, Python Flask, or PHP)

### Installation Steps
1. Navigate to the React frontend directory:
   ```bash
   cd frontend/react
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the API endpoint:
   ```javascript
   // In src/lib/api.js, update the base URL
   const API_BASE_URL = 'http://localhost:3000/api'; // Adjust as needed
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:5173`

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint (if configured)

## API Integration

### API Client (`src/lib/api.js`)
The application uses a centralized API client that handles:
- **Base URL configuration** for different environments
- **JWT token management** with automatic header injection
- **Request/response interceptors** for error handling
- **Consistent error handling** across all API calls

### Supported Backend APIs
The frontend is designed to work with multiple backend implementations:
- **Node.js + Express** (primary)
- **Python + Flask** (alternative)
- **PHP** (XAMPP compatible)

All backends provide the same API contract for seamless integration.

## Authentication Flow

### Login Process
1. User submits credentials via login form
2. API validates credentials and returns JWT token
3. Token is stored in localStorage and AuthContext
4. User is redirected to dashboard
5. Token is included in all subsequent API requests

### Route Protection
- Public routes: Login, Register
- Protected routes: Dashboard, Products, Categories, Profile
- Admin-only routes: Users, Category management

## State Management

### React Query
Used for server state management:
- **Data fetching** with automatic caching
- **Background updates** and synchronization
- **Optimistic updates** for better UX
- **Error handling** and retry logic

### Context API
Used for global client state:
- **Authentication state** (user, token, login status)
- **User preferences** and settings

## Styling and Theming

### Tailwind CSS
The application uses a custom Tailwind configuration:
- **Custom color palette** with primary/secondary colors
- **Responsive utilities** for mobile-first design
- **Component classes** for consistent styling
- **Dark mode support** (can be enabled)

### Component System
Reusable UI components with consistent styling:
- Form inputs with validation styles
- Buttons with different variants
- Cards and layouts
- Loading and error states

## Form Handling

### React Hook Form
All forms use React Hook Form for:
- **Performance optimization** with uncontrolled components
- **Built-in validation** with custom rules
- **Error handling** and display
- **Form state management**

### Validation Rules
- Required fields with custom messages
- Email format validation
- Password strength requirements
- Custom validation for business logic

## Performance Optimization

### Code Splitting
- Route-based code splitting with React.lazy()
- Component-level splitting for large features

### React Query Optimizations
- Intelligent caching strategies
- Background refetching
- Stale-while-revalidate patterns

### Bundle Optimization
- Vite's built-in optimizations
- Tree shaking for unused code
- Asset optimization and compression

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2017+ features
- CSS Grid and Flexbox support

## Development Guidelines

### Code Structure
- Functional components with hooks
- Custom hooks for reusable logic
- Consistent prop-types or TypeScript
- Modular CSS with Tailwind

### Best Practices
- Separation of concerns
- Error boundaries for error handling
- Accessibility considerations
- Performance monitoring

## Deployment

### Production Build
```bash
npm run build
```

### Static Hosting
The built application can be deployed to:
- Netlify, Vercel, or similar platforms
- Apache/Nginx web servers
- AWS S3 + CloudFront
- Any static hosting service

### Environment Variables
Create a `.env` file for different environments:
```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=CRUD Template
```

## Future Enhancements
- File upload functionality for product images
- Advanced filtering and search
- Export/import capabilities
- Real-time updates with WebSockets
- PWA features for offline support
- Internationalization (i18n)

## Integration with Other Frontends
This React frontend can be used alongside:
- Angular frontend (planned)
- Mobile apps via shared API
- Third-party integrations

## Support and Maintenance
- Regular dependency updates
- Security patch management
- Performance monitoring
- User feedback integration

## Contributing
When adding new features:
1. Follow existing code patterns
2. Add proper error handling
3. Include loading states
4. Write responsive CSS
5. Test on multiple browsers
