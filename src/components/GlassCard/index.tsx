import { View } from '@tarojs/components'
import { colors, radius, shadow } from '../../styles/tokens'
import './index.scss'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export default function GlassCard({ children, className = '', onClick }: GlassCardProps) {
  return (
    <View
      className={`glass-card ${className}`}
      onClick={onClick}
    >
      {children}
    </View>
  )
}
