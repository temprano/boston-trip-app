import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Register service worker for PWA with proper update handling
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(
      (registration) => {
        console.log('✓ Service Worker registered:', registration)

        // ── Check for updates on every page load ──────────────────────────
        registration.update()

        // ── New SW installed and waiting → activate it immediately ────────
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // A new SW is waiting. Tell it to skip waiting and take over.
              newWorker.postMessage({ type: 'SKIP_WAITING' })
            }
          })
        })
      },
      (error) => {
        console.log('✗ Service Worker registration failed:', error)
      }
    )

    // ── When SW controller changes (new SW took over) → reload the page ──
    // This is what actually delivers the new assets to the user.
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return
      refreshing = true
      window.location.reload()
    })
  })
}

// Handle install prompt
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferredPrompt: BeforeInstallPromptEvent | null = null

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e as BeforeInstallPromptEvent
  const installBtn = document.getElementById('install-app-btn')
  if (installBtn) installBtn.style.display = 'block'
})

window.addEventListener('appinstalled', () => {
  console.log('✓ PWA was installed')
  deferredPrompt = null
  const installBtn = document.getElementById('install-app-btn')
  if (installBtn) installBtn.style.display = 'none'
})

;(window as any).deferredPrompt = deferredPrompt

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)