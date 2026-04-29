import { View, Text } from '@tarojs/components'
import { colors, radius, shadow } from '../../styles/tokens'
import './index.scss'

interface ShilyAvatarProps {
  status?: 'happy' | 'encourage' | 'thinking' | 'tired' | 'surprised' | 'cheer'
  size?: 'small' | 'medium' | 'large'
  message?: string
}

const statusEmojis: Record<string, string> = {
  happy: '⋆',
  encourage: '♡',
  thinking: '◡',
  tired: '－',
  surprised: '◯',
  cheer: '☆',
}

export default function ShilyAvatar({ status = 'happy', size = 'medium', message }: ShilyAvatarProps) {
  return (
    <View className={`shily-avatar shily-avatar--${size}`}>
      <View className='shily-body'>
        <View className='shily-highlight' />
        <View className='shily-eye shily-eye--left' />
        <View className='shily-eye shily-eye--right' />
      </View>
      {message && <Text className='shily-message'>{message}</Text>}
    </View>
  )
}
