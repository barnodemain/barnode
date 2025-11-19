# Barnode - Cocktail Bar Inventory & Order Management

## Overview

Barnode is an internal mobile application designed for cocktail bar staff to manage inventory, track missing items, maintain a database of products/suppliers/categories, and create orders. Built with React Native and Expo, it provides a streamlined mobile-first experience for on-site bar operations.

**Key Features:**
- Missing items tracking with search functionality
- Product, supplier, and category database management
- Order creation and management system
- No authentication required (internal single-user/team tool)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** React Native with Expo SDK 54
- **TypeScript** for type safety with strict mode enabled
- **React 19.1** with new architecture enabled
- **React Navigation** for tab-based navigation (3 main sections: Home, Database, Orders)

**UI Components:**
- Custom themed components (`ThemedText`, `ThemedView`) that adapt to light/dark mode
- Reusable UI primitives: `Button`, `Card`, `SearchBar`, `ItemCard`, `SectionCard`
- Screen wrapper components for consistent layouts (`ScreenScrollView`, `ScreenKeyboardAwareScrollView`, `ScreenFlatList`)
- Error boundary implementation for graceful error handling

**Navigation Structure:**
- Bottom tab navigation with 3 tabs: Home (Missing Items), Database, Orders
- Tab bar styled with brand colors (dark green `#2D5A3D` background)
- Blur effects on iOS for transparent headers

**Design System:**
- Centralized theme in `constants/theme.ts` with light/dark color schemes
- Brand colors: Primary `#2D5A3D` (dark green), Accent `#B8D4B8` (light green), Background `#F8F6F0` (warm off-white)
- Consistent spacing, border radius, and typography tokens
- Material-like elevation system for cards (3 levels)

**Animation:**
- `react-native-reanimated` for performant animations
- Spring-based interactions on buttons and cards
- Consistent spring configuration across components

**State Management:**
- Currently using React hooks and local state
- No global state management library yet (prepared for future integration)

### Data Layer

**Current Implementation:**
- Mock data in `src/shared/utils/mockData.ts` for development
- Data client interface defined in `src/shared/services/dataClient.ts` with placeholder methods
- TypeScript interfaces in `src/shared/types/index.ts` for type safety

**Data Models:**
- `Articolo` (Product): id, nome, tipologiaId, fornitoreId
- `Tipologia` (Category): id, nome, descrizione
- `Fornitore` (Supplier): id, nome, contatto, email, telefono, indirizzo
- `Ordine` (Order): id, fornitoreId, dataCreazione, dataConsegna, stato, articoli, note
- `OrdineArticolo` (Order Item): articoloId

**Planned Backend:**
- Supabase integration prepared but not yet implemented
- Data client structure ready to connect to Supabase tables
- CRUD operations defined for all entities

### Build & Development

**Module Resolution:**
- Path alias `@/` configured via babel-plugin-module-resolver
- Simplifies imports across the codebase

**Code Quality:**
- ESLint with Expo config and Prettier integration
- TypeScript strict mode for maximum type safety
- Format checking and auto-formatting scripts

**Development Environment:**
- Configured for Replit deployment with custom environment variables
- Expo dev server with proxy URL configuration for Replit
- Cross-platform support: iOS, Android, Web

**Platform-Specific Adaptations:**
- Conditional rendering for web vs native (e.g., KeyboardAwareScrollView)
- Platform-specific header blur effects
- Edge-to-edge display on Android

### File Organization

**Feature-Based Structure:**
- `/src/features/` for domain-specific modules (ordini, home, database)
- `/src/shared/` for reusable components, services, types, and utils
- `/screens/` for main screen components
- `/components/` for base UI components
- `/navigation/` for navigation configuration
- `/constants/` for theme and design tokens

**Design Decisions:**
- Separation of shared vs feature-specific code for maintainability
- Mock data isolated for easy replacement with real backend
- Modular component architecture for reusability

## External Dependencies

### Core Framework
- **Expo SDK 54** - Mobile app framework
- **React Native 0.81.5** - Cross-platform mobile development
- **React Navigation 7** - Navigation library with bottom tabs

### UI & Interaction
- **react-native-reanimated 4.1** - High-performance animations
- **react-native-gesture-handler 2.28** - Touch gesture handling
- **react-native-keyboard-controller 1.18** - Keyboard management
- **react-native-safe-area-context 5.6** - Safe area insets
- **react-native-screens 4.16** - Native screen primitives
- **expo-blur** - Native blur effects for headers
- **expo-haptics** - Tactile feedback

### Icons & Assets
- **@expo/vector-icons 15** - Icon library (Feather icons used throughout)
- **expo-image** - Optimized image component

### Development Tools
- **TypeScript 5.9** - Type system
- **ESLint 9** with Expo config - Code linting
- **Prettier 3.6** - Code formatting
- **babel-plugin-module-resolver** - Path alias support

### Planned Integrations
- **Supabase** (not yet configured) - Backend database and authentication
  - PostgreSQL database expected for production data
  - Real-time subscriptions for inventory updates
  - Row-level security for data access control