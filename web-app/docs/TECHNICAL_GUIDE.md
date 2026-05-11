# Royal Rentals Technical Guide

## Overview
Royal Rentals is a premium car rental marketplace built for Mauritius. It features a fully dynamic architecture powered by Next.js and Supabase.

## Tech Stack
- **Framework**: Next.js 14.2.5 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database & Auth**: Supabase
- **State Management**: React Hooks (useState, useEffect)

## Project Structure
- `app/`: Contains all pages and route logic.
- `components/`: Reusable UI components (Navbar, Footer, etc.).
- `lib/`: Core service logic and database clients.
- `public/assets/`: High-fidelity branding and vehicle assets.
- `supabase/`: Database schema and migration scripts.
- `docs/`: Technical and project documentation.

## Dynamic Data Layer
The application fetches content from the following Supabase tables:
1. `public.cars`: Vehicle listings, pricing, and specifications.
2. `public.site_content`: Master key-value store for site copy and contact info.
3. `public.services`: Descriptions and icons for additional offerings.

## Development Principles
- **Aesthetics First**: Every component must maintain a premium, high-fidelity look.
- **Dynamic Content**: No hardcoded copy or images; everything must come from Supabase or local assets.
- **Clean Code**: No legacy comments, AI placeholders, or redundant code blocks.
