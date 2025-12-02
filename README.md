# BARnode

BARnode is an internal tool for cocktail bars to manage missing items (things to buy) and maintain a catalog of all drink products.

## Features

- **Missing Items List**: Track items that need to be purchased
- **Article Catalog**: Maintain a complete list of all drink products
- **Text Import**: Bulk import articles from a plain text list
- **Mobile-First Design**: Optimized for phones and tablets

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- React Router 6 (navigation)
- Supabase (PostgreSQL database)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

Create a `.env` file in the project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under "API".

### 3. Create Database Tables

Run the following SQL in your Supabase SQL editor:

```sql
-- Create articoli table (catalog of articles)
CREATE TABLE articoli (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create missing_items table (list of items to buy)
CREATE TABLE missing_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  articolo_id UUID NOT NULL REFERENCES articoli(id) ON DELETE CASCADE,
  articolo_nome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_articoli_nome ON articoli(nome);
CREATE INDEX idx_missing_items_articolo_id ON missing_items(articolo_id);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE articoli ENABLE ROW LEVEL SECURITY;
ALTER TABLE missing_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since there's no auth)
CREATE POLICY "Allow all operations on articoli" ON articoli FOR ALL USING (true);
CREATE POLICY "Allow all operations on missing_items" ON missing_items FOR ALL USING (true);
```

### 4. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5000`.

### 5. Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder, ready to deploy as a static site.

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── BottomNav.tsx
│   ├── FloatingActionButton.tsx
│   └── Modal.tsx
├── hooks/            # Custom React hooks
│   ├── useArticoli.ts
│   └── useMissingItems.ts
├── lib/              # External service clients
│   └── supabase.ts
├── pages/            # Route pages
│   ├── Home.tsx
│   ├── Archivio.tsx
│   ├── Settings.tsx
│   └── ImportText.tsx
├── types/            # TypeScript type definitions
│   └── index.ts
├── App.tsx           # Main app component with routing
├── main.tsx          # Application entry point
└── index.css         # Global styles
```

## Routes

- `/` - Home: Missing items list
- `/archivio` - Archive: Full catalog of articles
- `/settings` - Settings page
- `/settings/import/text` - Import articles from text

## License

Private - Internal use only
