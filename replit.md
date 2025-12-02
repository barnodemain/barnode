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
│   └── useMissingItems.ts # CRUD for missing items (with join)
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
└── index.css          # Global styles (600+ lines)
```

## Database Schema (Supabase)

### articoli (catalog items)
- `id`: UUID (primary key)
- `nome`: TEXT (article name)
- `created_at`: TIMESTAMPTZ

### missing_items (shopping list)
- `id`: UUID (primary key)
- `articolo_id`: UUID (foreign key to articoli.id)
- `created_at`: TIMESTAMPTZ

Note: The `missing_items` table does not have an `articolo_nome` column. The article name is fetched via a join with the `articoli` table.

## Environment Variables

Required environment variables:
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key

## User Preferences

- Language: Italian (all UI text in Italian)
- Design: Mobile-first, cream background, green accents, white rounded cards
- No authentication required (shared access)

## Layout & Scrolling

All pages follow a consistent mobile layout pattern:
- **Fixed Header**: Logo, page title, and search bar stay at top
- **Scrollable Content**: Lists, forms, and content scroll independently in middle area
- **Fixed Bottom Nav**: Navigation bar fixed at bottom of viewport

Layout implemented via:
- `.page-wrapper`: Flex column container filling entire viewport
- `.page-header-fixed`: Flex-shrink-0 header (no padding-bottom on content needed)
- `.page-content-scrollable`: Flex: 1 with overflow-y: auto for independent scrolling
- `.bottom-nav`: Position fixed at bottom (z-index: 100)

This ensures no double scrollbars, no horizontal scrolling, and proper mobile UX.

## Recent Changes (Dec 2, 2025)

### Analysis with Fuzzy Matching & Name Normalization
- Added `src/lib/normalize.ts` with `normalizeArticleName()` and `isFuzzySimilar()` helpers
- Enhanced Analysis algorithm: Now detects similar articles via Levenshtein edit distance ≤ 1
  - Example: "Birra Ipa" and "birra tipa" now grouped together in Analysis
  - Fuzzy matching only for tokens ≥ 3 chars (conservative approach)
- Implemented Title Case normalization for all article names:
  - Applied on create/edit in Archivio, Home, ImportText pages
  - Applied on consolidation in Analysis page
  - Names stored and displayed as "Vodka Grey Goose" format
- Analysis still uses only `articoli` table (never `missing_items` for grouping)
- Groups disappear after consolidation when only 1 article remains

### Previous Changes (Dec 2, 2025)

### Layout & UX Refactor
- Restructured all pages to use fixed header + scrollable content pattern
- Fixed header sections now contain logo, title, and search elements
- Content areas scroll independently between fixed header and bottom nav
- Eliminated whole-page scrolling and layout shift issues
- Consistent mobile app experience across all four pages

### CSS Improvements
- Cleaned up and consolidated stylesheet (now 576 lines)
- Added `.page-wrapper`, `.page-header-fixed`, `.page-content-scrollable` classes
- Improved spacing, padding, and sizing for mobile screens
- Better visual hierarchy with adjusted font sizes and spacing

### Code Quality
- Removed redundant old page-content structure
- All pages now use consistent layout wrapper pattern
- Cleaner separation of concerns (header, content, nav)
