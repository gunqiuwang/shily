import { View } from '@tarojs/components'
import './index.scss'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  style?: React.CSSProperties
  variant?: 'default' | 'soft' | 'tint' | 'hero' | 'status' | 'compact'
}

export default function GlassCard({
  children,
  className = '',
  onClick,
  style,
  variant = 'default',
}: GlassCardProps) {
  return (
    <View
      className={`glass-card glass-card--${variant} ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </View>
  )
}
