# SDK & Integration Summary

## 1. Core Framework
- **Vite:** Build tool for fast HMR and optimized builds.
- **React 18:** Functional components with Hooks.
- **TypeScript:** 5.0+ (Strict mode enabled).
- **Tailwind CSS:** Utility-first CSS for rapid mobile-first styling.

## 2. Testing Infrastructure
- **Vitest:** Unit and integration test runner (replaces Jest, native Vite integration).
- **React Testing Library (RTL):** DOM testing utilities to test component rendering and user interaction.
- **MSW (Mock Service Worker):**
  - *Usage:* Intercepts HTTP requests in the browser during tests.
  - *Goal:* Mock Google Maps and Weather API responses so we can test success/error states without hitting real APIs.

## 3. PWA & Routing
- **vite-plugin-pwa:** For Service Worker generation, manifest.json, and offline caching strategy.
- **React Router v6:** For client-side routing (Tabs: Itinerary, Travelers, Settings).
- **Lucide React:** The standard icon set for the UI (Lightweight, customizable).

## 4. External API Integrations

### Google Maps Platform
*Requires Google Cloud Console API Key with Billing Enabled.*
- **Library:** `@react-google-maps/api` (React wrappers for Google Maps JS API).
- **Components:**
  - `MapComponent`: The main viewport.
  - `DirectionsRenderer`: To visualize transit routes.
  - `MarkerClusterer`: To group nearby places.
- **APIs:**
  - **Places API:** For autocomplete search (e.g., "Restaurant in Paris").
  - **Directions API:** For calculating walking/transit routes between itinerary stops.

### OpenWeatherMap
*Requires OpenWeatherMap API Key (Free Tier sufficient for MVP).*
- **Endpoints:**
  - `Current Weather`: `/data/2.5/weather` (Temperature, Icon, Humidity).
  - `5-Day Forecast`: `/data/2.5/forecast` (Hourly breakdowns for trip days).
- **Implementation:** `src/services/weatherService.ts` will handle fetch logic and caching.

## 5. State Management
- **Zustand:** Lightweight global state management for storing:
  - Selected Itinerary
  - Traveler Details
  - App Theme (Dark/Light mode)
  - Offline Status

## 6. File Structure Convention
- `src/components/`: Reusable UI atoms (Buttons, Cards).
- `src/sections/`: Large UI blocks (TravelerSection, WeatherWidget).
- `__tests__/`: Co-located with source files (e.g., `App.test.tsx`).
- `src/mocks/`: MSW handlers and Mock Data factories.
