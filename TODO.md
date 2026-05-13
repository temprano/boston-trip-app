# Development Checklist

## Phase 1: Project Setup & Configuration
- [ ] Initialize Vite project with React + TypeScript
- [ ] Configure Tailwind CSS
- [ ] Install and configure Vitest + React Testing Library
- [ ] Install `vite-plugin-pwa` for PWA support
- [ ] Create `.env` structure for API keys
- [ ] Verify basic test runner works (Hello World test)

## Phase 2: Data Models & Mocking
- [ ] Define TypeScript interfaces for:
  - [ ] `Itinerary` (Days, Activities, Location)
  - [ ] `Traveler` (Bio, Contact, FlightInfo)
  - [ ] `WeatherData`
- [ ] Create `src/data/mockData.ts` with rich sample data
- [ ] Create `src/services/mockDataService.ts` to provide data to components

## Phase 3: Core UI Components (Mock Data Only)
*Goal: Build the visual layout without real APIs.*
- [ ] **TravelersSection:** 
  - [ ] Test: Renders traveler list with bios
  - [ ] Test: Accordion expands/collapses
- [ ] **DayView Component:**
  - [ ] Test: Renders correct date header
  - [ ] Test: Shows "No Activities" state
- [ ] **ActivityItem Component:**
  - [ ] Test: Displays time, title, and location
  - [ ] Test: Toggles map preview visibility

## Phase 4: External Integrations (TDD with MSW)
*Goal: Wire up real APIs.*
- [ ] **Weather Service:**
  - [ ] Mock OpenWeatherMap API responses with MSW
  - [ ] Test: Service fetches and parses weather for a lat/lng
  - [ ] Test: Weather widget displays correct icon/temp
- [ ] **Map Service:**
  - [ ] Mock Google Maps Loader
  - [ ] Test: Map initializes with correct center coords
  - [ ] Test: "Nearby Places" search triggers marker creation
  - [ ] Test: Transit info panel populates from Directions API

## Phase 5: PWA & Offline Features
- [ ] Configure `vite-plugin-pwa` manifest (icons, theme colors)
- [ ] Test: App installs to home screen
- [ ] Test: Service Worker caches the App Shell
- [ ] Test: Itinerary loads from cache when offline
