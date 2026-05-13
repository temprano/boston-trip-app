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
  style,
}) => {
  return (
    <div
      className={`glass-card bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-shadow ${className}`}
      onClick={onClick}
      style={{
        padding: '16px',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
