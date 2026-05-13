import LiquidGlass from 'liquid-glass-react'
import React from 'react'

interface GlassButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  displacementScale?: number
  blurAmount?: number
  elasticity?: number
  style?: React.CSSProperties
}

const variantClasses = {
  primary: 'bg-blue-500 hover:bg-blue-600 text-white',
  secondary: 'bg-gray-400 hover:bg-gray-500 text-gray-900',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-6 py-2.5 text-base',
  lg: 'px-8 py-3.5 text-lg',
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  onClick,
  className = '',
  disabled = false,
  variant = 'primary',
  size = 'md',
  displacementScale = 64,
  blurAmount = 0.1,
  elasticity = 0.35,
  style,
}) => {
  return (
    <LiquidGlass
      displacementScale={displacementScale}
      blurAmount={blurAmount}
      elasticity={elasticity}
      cornerRadius={8}
      saturation={130}
      aberrationIntensity={2}
      onClick={() => {
        if (!disabled && onClick) {
          onClick()
        }
      }}
      className={`glass-button ${variantClasses[variant]} ${sizeClasses[size]} font-medium cursor-pointer transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      style={{
        ...style,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </LiquidGlass>
  )
}
