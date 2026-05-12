# Car Rental Marketplace: End-to-End Scenarios & Handling

This document outlines 7 core business scenarios implemented to ensure seamless synchronization between the Frontend (Web App) and Backend (Admin Dashboard).

---

## 1. Comprehensive Vehicle Onboarding
**Scenario:** Admin introduces a new premium vehicle model to the fleet.
- **Action:** Add a record to `vehicle_templates` with specs (HiFi, Airbags, etc.) and tags (Family, Luxury).
- **Handling:** The model instantly appears in the **Featured Fleet** (if tagged appropriately) and the **Fleet Marketplace**.

## 2. Dynamic Booking Conversion
**Scenario:** A user submits a rental request for a specific car model.
- **Action:** User fills the contact/booking form on the web app.
- **Handling:** 
  1. System checks if `customer` exists by email (creates if not).
  2. Creates a `rental` record with `pending` status.
  3. Logs a `contact_message` for history.
- **Verification:** Booking appears in **Admin -> Rentals** as "Pending".

## 3. Administrative Status Workflow
**Scenario:** Concierge confirms the booking and communicates with the client.
- **Action:** Admin clicks "Confirm" in the Rentals dashboard.
- **Handling:** `rentals.status` updates to `confirmed`.
- **Verification:** User (if logged in, or via email) sees the status change.

## 4. Intelligent Inventory Locking
**Scenario:** A specific vehicle unit is assigned to a confirmed booking.
- **Action:** Admin assigns a `vehicle_unit` (plate number) to a rental.
- **Handling:** The specific unit's `availability_status` changes to `rented` or `reserved`.
- **Verification:** The `available_count` for that model decreases on the marketplace grid.

## 5. Maintenance & Service Mode
**Scenario:** A car unit requires mechanical attention.
- **Action:** Admin updates `vehicle_units.availability_status` to `maintenance`.
- **Handling:** The unit is automatically excluded from "Available" counts. If all units of a model are in maintenance, the model shows "Sold Out" or is hidden.
- **Verification:** Frontend CarCard shows "Sold Out" badge.

## 6. Advanced Discovery & Search
**Scenario:** User needs a 7-seater SUV for a family trip.
- **Action:** User applies filters: Category="SUV", Tags="Family".
- **Handling:** SQL query filters `vehicle_templates` based on `category` and the `tags` array.
- **Verification:** Only matching vehicles (e.g., Mitsubishi Pajero) are displayed.

## 7. Real-time Spec & Price Sync
**Scenario:** Insurance costs or technical features of a model change.
- **Action:** Admin updates `airbag_count` or `min_price` in the dashboard.
- **Handling:** Data revalidation occurs on the frontend via Supabase real-time or page refresh.
- **Verification:** Card specs and pricing labels update instantly on the Homepage and Fleet pages.
