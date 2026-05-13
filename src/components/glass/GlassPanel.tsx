import React, { useRef } from 'react'

interface GlassPanelProps {
  children: React.ReactNode
  className?: string
  title?: string
  mouseTracking?: boolean
  displacementScale?: number
  blurAmount?: number
  saturation?: number
  elasticity?: number
  cornerRadius?: number
  padding?: string
  mode?: 'standard' | 'polar' | 'prominent' | 'shader'
  style?: React.CSSProperties
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className = '',
  title,
  style,
}) => {
  const panelRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={panelRef} className={`glass-panel-wrapper ${className}`}>
      {title && <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{title}</h2>}
      <div
        className="glass-panel w-full bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg relative z-10"
        style={{
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  )
}
