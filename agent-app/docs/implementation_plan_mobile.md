# Royal Agent Mobile App - Implementation Plan

## Objective
Develop a specialized mobile application for Royal Car Rental agents to manage vehicle handovers (delivery) and returns (collection).

## Core Features
- **Secure Authentication**: Agent-only login using Supabase Auth.
- **Task Management**: Real-time list of pending deliveries and collections.
- **Digital Inspection**:
  - Record mileage and fuel levels.
  - Capture condition notes.
  - Upload inspection photos.
  - Digital signature capture (v2).
- **Backend Sync**: Automatic status updates for rentals and vehicle availability.

## Tech Stack
- **Framework**: Expo (React Native) with Expo Router.
- **Database/Auth**: Supabase.
- **Icons**: Lucide React Native.
- **Storage**: Expo SecureStore (Auth persistence) & ImagePicker (Inspections).

## Current Progress
- [x] Initialized Expo project (`agent-app`).
- [x] Configured Supabase client with persistence.
- [x] Implemented Auth routing logic in root layout.
- [x] Created Login screen.
- [x] Created Deliveries and Collections list screens.
- [x] Created Inspection workflow screen.
- [x] Database migration for `rental_inspections` table completed.

## Next Steps
1. **Refine UI/UX**: Add animations and improve form layouts.
2. **Signature Support**: Integrate `react-native-signature-canvas`.
3. **Image Uploads**: Implement direct upload to Supabase Storage buckets.
4. **Offline Mode**: Add local caching for inspection data.
5. **Push Notifications**: Notify agents of new tasks.

## Deployment Plan
- Internal testing via Expo Go.
- Production build using EAS (Expo Application Services).
