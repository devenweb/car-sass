# Royal Rentals Mauritius

Mauritius' premier elite car rental marketplace. Experience luxury, freedom, and extraordinary service.

## 🚀 Overview

Royal Rentals is a high-performance web application designed for the Mauritian premium car rental market. Built with Next.js 14 and Supabase, it offers a fully dynamic, data-driven experience with a focus on visual excellence and premium user interaction.

## 🛠 Tech Stack

- **Frontend**: Next.js 14.2.5 (App Router)
- **Styling**: Tailwind CSS (Custom Design System)
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Client**: Supabase JS SDK

## 📁 Project Structure

```
├── app/              # Next.js App Router pages
├── components/       # Reusable UI components
├── lib/              # Core logic, services, and clients
├── public/assets/    # High-fidelity PNG assets
├── supabase/         # Database schema
└── docs/             # Technical documentation
```

## ⚙️ Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env.local` file with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Development**:
   ```bash
   npm run dev
   ```

## 🗄 Database Initialization

To set up the database, execute the SQL script located in `supabase/schema.sql` within your Supabase SQL Editor. This will initialize the following tables:
- `cars`: Vehicle inventory and pricing.
- `site_content`: Dynamic page copy and assets.
- `services`: Premium service offerings.
- `rentals`: Booking and reservation tracking.
- `customers`: Client data management.

---
© 2026 Royal Rentals Mauritius. Developed for premium performance.
