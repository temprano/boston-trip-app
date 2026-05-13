import React from 'react'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  displacementScale?: number
  blurAmount?: number
  saturation?: number
  elasticity?: number
  cornerRadius?: number
  padding?: string
  mode?: 'standard' | 'polar' | 'prominent' | 'shader'
  style?: React.CSSProperties
  overLight?: boolean
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  onClick,
  displacementScale = 50,
  blurAmount = 0.08,
  saturation = 130,
  elasticity = 0.2,
  cornerRadius = 16,
  padding = '16px',
  mode = 'standard',
  style,
  overLight = false,
}) => {
  return (
    <div
      className={`glass-card bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-shadow ${className}`}
      onClick={onClick}
      style={{
        padding: padding || '16px',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
