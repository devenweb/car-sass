# Royal Rentals Admin Application

A high-fidelity administrative dashboard for managing the Royal Car Rental agency backend.

## Features

- **Dashboard**: Real-time overview of business metrics and fleet status.
- **Fleet Management**: CRUD operations for cars, availability tracking, and image management.
- **Rentals Management**: Track bookings, update statuses, and monitor revenue.
- **Customer Registry**: Centralized database of customer profiles and rental history.
- **Inquiry Management**: Handle customer messages and contact requests.
- **Newsletter**: Manage and export marketing subscribers.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS (Premium Admin Theme)
- **Database/Auth**: Supabase
- **Icons**: Lucide React

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   Create a `.env.local` file with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

## Design System

The application uses a "Premium Admin" design system:
- **Primary Color**: #0D9488 (Teal)
- **Secondary Color**: #021214 (Deep Navy)
- **Background**: #F8FAFC (Slate 50)
- **Typography**: Inter (Sans-serif)
