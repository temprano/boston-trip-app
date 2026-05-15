import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(
      (registration) => {
        console.log('✓ Service Worker registered:', registration)
      },
      (error) => {
        console.log('✗ Service Worker registration failed:', error)
      }
    )
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
  // Make install button visible if needed
  const installBtn = document.getElementById('install-app-btn')
  if (installBtn) {
    installBtn.style.display = 'block'
  }
})

window.addEventListener('appinstalled', () => {
  console.log('✓ PWA was installed')
  deferredPrompt = null
  const installBtn = document.getElementById('install-app-btn')
  if (installBtn) {
    installBtn.style.display = 'none'
  }
})

// Make deferredPrompt globally available
;(window as any).deferredPrompt = deferredPrompt

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
