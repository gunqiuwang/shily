import { View, Text } from '@tarojs/components'
import AppIcon, { AppIconName } from '../AppIcon'
import './index.scss'

interface PrimaryButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  icon?: AppIconName
  iconTone?: 'muted' | 'active' | 'deep' | 'white'
  size?: 'medium' | 'large'
  fullWidth?: boolean
  className?: string
}

export default function PrimaryButton({
  children,
  onClick,
  disabled = false,
  icon,
  iconTone = 'white',
  size = 'large',
  fullWidth = true,
  className = '',
}: PrimaryButtonProps) {
  const handleClick = () => {
    if (!disabled && onClick) onClick()
  }

  return (
    <View
      className={`primary-button primary-button--${size} ${fullWidth ? 'primary-button--full' : ''} ${disabled ? 'primary-button--disabled' : ''} ${className}`}
      onClick={handleClick}
    >
      {icon && <AppIcon className='primary-button__icon' name={icon} size={32} tone={iconTone} />}
      <Text className='primary-button__text'>{children}</Text>
    </View>
  )
}
