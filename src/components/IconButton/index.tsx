import { View } from '@tarojs/components'
import AppIcon, { AppIconName } from '../AppIcon'
import './index.scss'

interface IconButtonProps {
  icon: AppIconName
  onClick?: () => void
  size?: 'small' | 'medium' | 'large'
  tone?: 'plain' | 'soft' | 'primary' | 'dark'
  className?: string
}

const iconColor = {
  plain: '#6B7C76',
  soft: '#2F6B4F',
  primary: '#F8FAF7',
  dark: '#F8FAF7',
}

const iconSize = {
  small: 28,
  medium: 34,
  large: 42,
}

export default function IconButton({
  icon,
  onClick,
  size = 'medium',
  tone = 'soft',
  className = '',
}: IconButtonProps) {
  return (
    <View className={`icon-button icon-button--${size} icon-button--${tone} ${className}`} onClick={onClick}>
      <AppIcon name={icon} size={iconSize[size]} color={iconColor[tone]} />
    </View>
  )
}
