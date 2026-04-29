import { View, Text } from '@tarojs/components'
import { colors, radius } from '../../styles/tokens'
import './index.scss'

interface SecondaryButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export default function SecondaryButton({ children, onClick, className = '' }: SecondaryButtonProps) {
  return (
    <View
      className={`secondary-button ${className}`}
      onClick={onClick}
    >
      <Text>{children}</Text>
    </View>
  )
}
