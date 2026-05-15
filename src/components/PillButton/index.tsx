import { View, Text } from '@tarojs/components'
import AppIcon, { AppIconName } from '../AppIcon'
import './index.scss'

interface PillButtonProps {
  children: React.ReactNode
  icon?: AppIconName
  onClick?: () => void
  tone?: 'mint' | 'blue' | 'white'
  className?: string
}

export default function PillButton({
  children,
  icon,
  onClick,
  tone = 'blue',
  className = '',
}: PillButtonProps) {
  return (
    <View className={`pill-button pill-button--${tone} ${className}`} onClick={onClick}>
      {icon && <AppIcon className='pill-button__icon' name={icon} size={28} tone='deep' />}
      <Text className='pill-button__text'>{children}</Text>
    </View>
  )
}
