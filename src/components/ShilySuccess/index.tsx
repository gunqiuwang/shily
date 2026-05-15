import { Text, View } from '@tarojs/components'
import ShilyAvatar, { ShilyAvatarMood } from '../ShilyAvatar'
import './index.scss'

interface ShilySuccessProps {
  title: string
  message: string
  mood?: ShilyAvatarMood
}

export default function ShilySuccess({
  title,
  message,
  mood = 'happy',
}: ShilySuccessProps) {
  return (
    <View className='shily-success'>
      <View className='shily-success__avatar'>
        <ShilyAvatar mood={mood} size='large' motion='success' />
      </View>
      <View className='shily-success__copy'>
        <Text className='shily-success__title'>{title}</Text>
        <Text className='shily-success__message'>{message}</Text>
      </View>
    </View>
  )
}
