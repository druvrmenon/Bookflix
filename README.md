# BookFlix

A mobile-first book rental platform built with **Next.js (App Router)** + **Supabase** (auth & database).

## Features
- **Two Roles:** Customer (browse, search, filter, rent) and Admin (CRUD books, manage availability).
- **Design:** Dark brown (`#3b1a1a`) and rose gold (`#c9956c`) theme.
- **Tech Stack:** Next.js, Supabase, Vanilla CSS.

## Getting Started

1. Set up a Supabase project and run `supabase-schema.sql` in the SQL Editor.
2. In Supabase Storage, create a public bucket called `book-covers`.
3. Copy `.env.example` to `.env.local` and add your keys.
4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
