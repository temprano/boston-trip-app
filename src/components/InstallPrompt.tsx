import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('✓ User accepted install prompt')
      setShowPrompt(false)
      setDeferredPrompt(null)
    } else {
      console.log('✗ User dismissed install prompt')
    }
  }

  const handleClose = () => {
    setShowPrompt(false)
  }

  if (!showPrompt || !deferredPrompt) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '20px',
        right: '20px',
        backgroundColor: '#1a1a2e',
        border: '2px solid #4CAF50',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
        zIndex: 9998,
        maxWidth: '400px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          marginBottom: '12px',
        }}
      >
        <Download
          size={24}
          style={{ color: '#4CAF50', flexShrink: 0, marginTop: '2px' }}
        />
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 4px 0', color: '#ffffff', fontSize: '16px' }}>
            Install App
          </h3>
          <p style={{ margin: 0, color: '#cccccc', fontSize: '14px' }}>
            Get quick access and use offline
          </p>
        </div>
        <button
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#cccccc',
            padding: 0,
          }}
          title="Close"
        >
          <X size={20} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleInstall}
          style={{
            flex: 1,
            padding: '10px 16px',
            backgroundColor: '#4CAF50',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = '#45a049')
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = '#4CAF50')
          }
        >
          Install
        </button>
        <button
          onClick={handleClose}
          style={{
            flex: 1,
            padding: '10px 16px',
            backgroundColor: 'transparent',
            color: '#cccccc',
            border: '1px solid #666',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'border-color 0.3s',
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.borderColor = '#aaa')
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.borderColor = '#666')
          }
        >
          Later
        </button>
      </div>
    </div>
  )
}
