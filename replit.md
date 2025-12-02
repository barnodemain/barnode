# BARnode - Bar Inventory Management

## Overview

BARnode is a mobile-first web application for cocktail bars to manage their inventory. It allows staff to track missing items (things to buy) and maintain a catalog of all drink products. Multiple staff members can use it simultaneously with shared data.

## Current State

The app is fully functional with the following pages:
- **Home** (`/`): Missing items list with search/autocomplete to add items
- **Archivio** (`/archivio`): Complete catalog of articles with CRUD operations
- **Settings** (`/settings`): Settings page with import functionality
- **Import Text** (`/settings/import/text`): Bulk import articles from text

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Routing**: React Router 6
- **Database**: Supabase (PostgreSQL)
- **Styling**: CSS with custom variables (mobile-first design)
- **Icons**: react-icons (Ionicons)

## Project Architecture

```
src/
├── components/        # Reusable UI components
│   ├── BottomNav.tsx     # Bottom navigation bar
│   ├── FloatingActionButton.tsx
│   └── Modal.tsx         # Reusable modal component
├── hooks/             # Custom React hooks for data management
│   ├── useArticoli.ts    # CRUD operations for articles
│   └── useMissingItems.ts # CRUD for missing items
├── lib/
│   └── supabase.ts       # Supabase client configuration
├── pages/             # Route pages
│   ├── Home.tsx          # Missing items list
│   ├── Archivio.tsx      # Article catalog
│   ├── Settings.tsx      # Settings menu
│   └── ImportText.tsx    # Text import wizard
├── types/
│   └── index.ts          # TypeScript type definitions
├── App.tsx            # Main app with routing
├── main.tsx           # Entry point
└── index.css          # Global styles
```

## Database Schema

### articoli (catalog items)
- `id`: UUID (primary key)
- `nome`: TEXT (article name)
- `created_at`: TIMESTAMP

### missing_items (shopping list)
- `id`: UUID (primary key)
- `articolo_id`: UUID (foreign key to articoli)
- `articolo_nome`: TEXT (denormalized name for display)
- `created_at`: TIMESTAMP

## Environment Variables

Required environment variables:
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key

## User Preferences

- Language: Italian (all UI text in Italian)
- Design: Mobile-first, cream background, green accents
- No authentication required (shared access)

## Recent Changes

- Initial project setup with Vite + React + TypeScript
- Implemented all core features: missing items, catalog, import
- Mobile-optimized UI matching provided design references
- Supabase integration with full CRUD operations
