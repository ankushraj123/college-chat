# Overview

SecretChatBox is a modern, mobile-friendly anonymous confession and chat platform designed specifically for college students. The application provides a safe space for students to share confessions, secrets, and connect with peers through anonymous interactions. Built as a full-stack web application, it features real-time confession feeds, anonymous chat rooms, comprehensive moderation tools, and a vibrant, youth-focused design optimized for mobile devices.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client-side is built using React with TypeScript and follows a component-based architecture:

- **Framework**: React 18 with TypeScript for type safety and modern React patterns
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible design
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **State Management**: React Query (TanStack Query) for server state management and caching
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Build Tool**: Vite for fast development and optimized production builds

The application uses a modern component structure with reusable UI components, custom hooks for business logic, and a theme provider for dark/light mode support.

## Backend Architecture

The server follows a REST API architecture built on Node.js:

- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Management**: Anonymous session tokens stored in database for user tracking
- **API Design**: RESTful endpoints with consistent error handling and request logging

The backend implements a session-based approach for anonymous users, allowing features like daily confession limits and moderation while maintaining anonymity.

## Data Storage Solutions

The application uses PostgreSQL as the primary database with the following schema design:

- **Users Table**: Admin accounts with role-based permissions
- **Sessions Table**: Anonymous user sessions with daily limits and college associations
- **Confessions Table**: User-generated content with approval workflow and engagement metrics
- **Comments Table**: Threaded discussions on confessions with moderation
- **Colleges Table**: Institution management for content organization
- **Chat Messages**: Real-time messaging with room-based organization
- **Direct Messages**: Private anonymous messaging between users

Database migrations are managed through Drizzle Kit with schema validation using Zod.

## Authentication and Authorization

The system implements a dual authentication approach:

- **Anonymous Users**: Session token-based identification without personal data collection
- **Admin Users**: Traditional username/password authentication with role-based access control
- **Session Management**: Daily limits, college code association, and nickname preferences stored per session
- **Content Moderation**: Admin approval workflow for user-generated content

## External Dependencies

### Core Dependencies

- **@neondatabase/serverless**: PostgreSQL database driver optimized for serverless environments
- **drizzle-orm & drizzle-kit**: Type-safe ORM and migration toolkit for database operations
- **@tanstack/react-query**: Powerful data synchronization and caching for React applications
- **@radix-ui/***: Collection of unstyled, accessible UI primitives
- **wouter**: Lightweight routing library for React applications
- **react-hook-form**: Performant forms library with minimal re-renders
- **zod**: TypeScript-first schema validation
- **tailwindcss**: Utility-first CSS framework
- **date-fns**: Modern JavaScript date utility library

### Development Tools

- **vite**: Fast build tool and development server
- **typescript**: Static type checking and enhanced developer experience
- **esbuild**: Fast JavaScript bundler for production builds
- **tsx**: TypeScript execution environment for Node.js

### UI and Styling

- **class-variance-authority**: Type-safe variant generation for component styling
- **clsx & tailwind-merge**: Utility functions for conditional CSS classes
- **lucide-react**: Modern icon library
- **embla-carousel-react**: Touch-friendly carousel component

The application is designed to be deployed on platforms supporting Node.js with PostgreSQL database connectivity, with specific optimizations for Replit's development environment including error overlays and cartographer integration.