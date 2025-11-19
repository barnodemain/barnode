# BARNODE Design Guidelines

## Application Overview
**Purpose**: Internal mobile application for cocktail bar staff to manage inventory, missing items, database of products, and orders.

**Platform**: Mobile-only (iOS/Android via Expo)

**User Persona**: Bar staff working on-site, needing quick access to inventory and ordering functions.

---

## Architecture Decisions

### Authentication
**No Authentication Required** - This is an internal tool for single-user/team use on-site devices.
- Include a basic settings screen accessible from Database section
- Store user preferences locally
- No login/signup flow needed

### Navigation
**Bottom Tab Navigation** (3 tabs):
1. **Home** - Missing items view (primary function)
2. **Database** - Product/supplier/category management
3. **Orders** - Create and manage orders

**Rationale**: Three distinct feature areas with equal hierarchy, no dominant "create" action that warrants center positioning.

---

## Screen Specifications

### 1. Home Screen (Articoli Mancanti)
**Purpose**: Quick view of items running low or out of stock

**Layout**:
- **Header**: Title "Articoli Mancanti", transparent background
  - Top inset: `headerHeight + Spacing.xl`
- **Main Content**: Scrollable list
  - Search bar at top (sticky)
  - Filtered list of missing items below
  - Empty state with helpful message when no missing items
  - Bottom inset: `tabBarHeight + Spacing.xl`

**Components**:
- Search input with icon
- Item cards showing: product name, category, current quantity, reorder threshold
- Visual indicator (light green accent) for items needing attention

---

### 2. Database Screen
**Purpose**: Manage all product data, categories, and suppliers

**Layout**:
- **Header**: Title "Database", transparent background
  - Top inset: `headerHeight + Spacing.xl`
- **Main Content**: Scrollable view with three management sections
  - Bottom inset: `tabBarHeight + Spacing.xl`

**Three Management Sections** (cards/panels):
1. **Tipologie** (Categories)
   - Add/edit/delete product categories
   - Shows count of products per category
2. **Fornitori** (Suppliers)
   - Add/edit/delete suppliers
   - Shows contact info and product count
3. **Articoli** (Products)
   - Complete product list
   - Each item shows: name, category, supplier, quantity

**Components**:
- Section cards with header and action buttons
- Expandable lists within each section
- Floating action buttons for "Add new" (per section)
- Full product list at bottom with search/filter capabilities

---

### 3. Orders Screen (Ordini)
**Purpose**: Create new orders and manage existing ones

**Layout**:
- **Header**: Title "Ordini", transparent background
  - Top inset: `headerHeight + Spacing.xl`
- **Main Content**: Two primary action panels
  - Bottom inset: `tabBarHeight + Spacing.xl`

**Two Primary Actions** (large buttons/cards):
1. **Crea Ordine** (Create Order)
   - Launches order creation flow
   - Shows quick stats (items to reorder count)
2. **Gestisci Ordini** (Manage Orders)
   - View active and archived orders
   - Order status indicators

**Subcomponents** (revealed on action):
- `CreateOrderPanel`: Multi-step form for order creation
- `ManageOrdersPanel`: List view with filters (active/archived)

---

## Design System

### Color Palette
**Primary Colors**:
- **Cream White** (`#F8F6F0`): Main background, content areas
- **Light Green** (`#B8D4B8`): Accents, highlights for missing items, positive actions
- **Dark Green** (`#2D5A3D`): Bottom navigation, primary buttons, key UI elements
- **Black** (`#1A1A1A`): Primary text, headings

**Usage Guidelines**:
- Background: Cream white for all main screens
- Navigation: Dark green for bottom tab bar with cream white icons
- Highlights: Light green for items needing attention, success states
- Text hierarchy: Black for headings, `rgba(26,26,26,0.7)` for body text

### Typography
**System Font**: Sans-serif (iOS: SF Pro, Android: Roboto)

**Hierarchy**:
- **H1** (Screen Titles): 28pt, Bold, Black
- **H2** (Section Headers): 20pt, Semibold, Black
- **Body**: 16pt, Regular, Black/70% opacity
- **Labels**: 14pt, Medium, Black/60% opacity
- **Caption**: 12pt, Regular, Black/50% opacity

### Layout Principles
**Mobile-First Container**:
- Max width: 100vw (full width on mobile)
- Horizontal padding: `Spacing.lg` (16px)
- Vertical spacing between sections: `Spacing.xl` (24px)

**Scrolling**:
- Disable horizontal scroll globally
- All main content areas vertically scrollable
- Sticky headers for search/filter bars

### Component Specifications

**Bottom Navigation Bar**:
- Height: 60px + safe area bottom inset
- Background: Dark green
- Icons: Feather icons, cream white color
- Active state: Icon with light green underline (2px, 40% width)
- Labels: Always visible, 12pt

**Item Cards** (for products, orders):
- Background: White
- Border radius: 12px
- Padding: `Spacing.md` (12px)
- Shadow: subtle (shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 2)
- Margin bottom: `Spacing.sm` (8px)

**Action Buttons**:
- Primary (Create, Save): Dark green background, cream white text, 48px height
- Secondary (Cancel, Edit): Light green background, dark green text, 48px height
- Border radius: 8px
- Pressed state: Opacity 0.8

**Floating Action Buttons** (for "Add New"):
- Size: 56x56px
- Background: Dark green
- Icon: Feather "plus" in cream white
- Position: Fixed bottom right, 16px from edges
- Shadow: shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2

**Search Bar**:
- Height: 44px
- Background: White
- Border: 1px solid `rgba(45,90,61,0.2)`
- Border radius: 22px (pill shape)
- Icon: Feather "search" in dark green, left aligned
- Placeholder: 60% black opacity

### Visual Feedback
- All touchable elements: Opacity 0.7 on press
- Form inputs: Light green border on focus
- Buttons: Scale 0.98 on press (subtle)
- List items: Light green background (10% opacity) on press

### Iconography
**Icon Library**: Feather icons from `@expo/vector-icons`

**Key Icons**:
- Home tab: "home"
- Database tab: "database"
- Orders tab: "file-text"
- Search: "search"
- Add: "plus"
- Edit: "edit-2"
- Delete: "trash-2"
- Missing item indicator: "alert-circle" (light green)

**Icon Sizing**:
- Tab bar icons: 24px
- Action buttons: 20px
- List item icons: 18px

---

## Accessibility Requirements
- Minimum touch target: 44x44px
- Color contrast: Minimum 4.5:1 for body text, 3:1 for large text
- All icons paired with text labels in critical actions
- Form inputs with clear labels above fields
- Error messages in text, not color alone

---

## Data Display Patterns

**Empty States**:
- Centered icon (48px, light green)
- Heading: "No [items] yet"
- Subtext with helpful context
- Primary action button if applicable

**Loading States**:
- Skeleton screens matching final layout
- Shimmer effect in light green/cream white

**Lists**:
- Swipe actions for edit/delete on list items (iOS pattern)
- Pull-to-refresh on all scrollable lists
- Infinite scroll or pagination for long lists (>50 items)