import { View, Text } from '@tarojs/components'
import { colors, radius, shadow } from '../../styles/tokens'
import './index.scss'

interface PrimaryButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export default function PrimaryButton({ children, onClick, disabled, className = '' }: PrimaryButtonProps) {
  return (
    <View
      className={`primary-button ${disabled ? 'primary-button--disabled' : ''} ${className}`}
      onClick={onClick}
    >
      <Text>{children}</Text>
    </View>
  )
}
