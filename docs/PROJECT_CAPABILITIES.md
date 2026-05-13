# Royal Car Rental - System Capabilities & Features
**Last Updated: 2026-05-13**

## 1. Fleet & Content Management (The Studio)
- **Comprehensive Vehicle Studio**: Full-page editor for managing car models, technical specs (seats, transmission, fuel), and marketing descriptions.
- **Gallery Asset Manager**: Multi-image gallery uploader with drag-and-drop sorting and default thumbnail control.
- **Dynamic Feature Editor**: Manage marketing bullet points (e.g., "Apple CarPlay", "Free Delivery") directly from the dashboard without code changes.
- **SEO & Slug Control**: Custom URL/slug management for every vehicle model to optimize search engine ranking.
- **Inventory Tracking**: Manage individual physical units (License Plates) with specific maintenance statuses and mileage tracking.

## 2. Advanced Pricing & Marketing Engine
- **Hierarchical Pricing**:
  - **Template Rate**: Global base price for a model.
  - **Unit Override**: Specific daily rates for premium individual cars.
  - **Date Overrides**: Seasonal surge or promotional pricing for specific date ranges.
- **Discount Logic**:
  - **Strikethrough Pricing**: Visual marketing "Sale" prices on the marketplace.
  - **Fixed & Percentage Discounts**: Stackable marketing discounts.
  - **Long-Term Rewards**: Automatic percentage discounts applied based on rental duration (e.g., > 5 days).
- **Tax Automation**: Automatic 15% TVA (VAT) calculation across all subtotals and extras.

## 3. High-Density Marketplace (Frontend)
- **Dual View Layout**: Toggle between high-impact Grid view and data-dense List view.
- **Precision Booking**: Integrated Date + Time pickers with strict validation to prevent backdating.
- **Live Invoicing**: Real-time price breakdown table showing Daily Rate, Extras, Taxes, and Total TTC as the user selects dates.
- **Logistics Management**: Dedicated fields for Pickup/Return addresses (Airport, Hotel, Agency) with integrated concierge feedback.

## 4. Administrative Command Center
- **Extras Manager**: Full CRUD for booking add-ons (GPS, Insurance, Child Seats) with active/hidden toggles.
- **Rental Controller**: Centralized dashboard for tracking "Pending", "Active", and "Completed" reservations.
- **Customer CRM**: Registry of all past renters with unified contact history.
- **Inquiry Management**: High-density message center for managing website leads and customer requests.

## 5. Security & Infrastructure
- **Supabase Integration**: Real-time database synchronization with strict Row-Level Security (RLS).
- **Environment Driven**: Fully configurable via `.env` files for seamless deployment across Vercel and local environments.
- **Mobile-First Design**: Fully responsive architecture ensuring professional usability on desktop, tablet, and mobile.
