import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Initialize MSW BEFORE rendering React
async function init() {
  if (import.meta.env.DEV) {
    try {
      const { worker } = await import('./mocks/browser')
      // Use 'bypass' to allow Google Maps internal RPC calls through
      // MSW will intercept our mocked APIs (Geocoding, Places) 
      // and let unhandled requests (like Google Maps RPC) through to the real API
      await worker.start({
        onUnhandledRequest: 'bypass',
      })
    } catch (err) {
      console.error('MSW startup error:', err)
    }
  }

  // Now render the app
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

init()
