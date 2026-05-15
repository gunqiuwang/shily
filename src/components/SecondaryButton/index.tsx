import { View, Text } from '@tarojs/components'
import AppIcon, { AppIconName } from '../AppIcon'
import './index.scss'

interface SecondaryButtonProps {
  children: React.ReactNode
  onClick?: () => void
  icon?: AppIconName
  disabled?: boolean
  size?: 'medium' | 'large'
  fullWidth?: boolean
  className?: string
}

export default function SecondaryButton({
  children,
  onClick,
  icon,
  disabled = false,
  size = 'large',
  fullWidth = true,
  className = '',
}: SecondaryButtonProps) {
  const handleClick = () => {
    if (!disabled && onClick) onClick()
  }

  return (
    <View
      className={`secondary-button secondary-button--${size} ${fullWidth ? 'secondary-button--full' : ''} ${disabled ? 'secondary-button--disabled' : ''} ${className}`}
      onClick={handleClick}
    >
      {icon && <AppIcon className='secondary-button__icon' name={icon} size={30} tone='deep' />}
      <Text className='secondary-button__text'>{children}</Text>
    </View>
  )
}
