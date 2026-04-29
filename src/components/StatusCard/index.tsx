import { View, Text } from '@tarojs/components'
import ShilyAvatar from '../ShilyAvatar'
import './index.scss'

interface StatusCardProps {
  score: number
  status: string
  message: string
}

export default function StatusCard({ score, status, message }: StatusCardProps) {
  return (
    <View className='status-card'>
      <View className='status-card__header'>
        <Text className='status-card__title'>今日状态</Text>
        <View className='status-card__badge'>
          <Text className='status-card__status-text'>{status}</Text>
        </View>
      </View>

      <View className='status-card__content'>
        <View className='status-card__shily'>
          <ShilyAvatar status='happy' size='large' />
        </View>
        <View className='status-card__score'>
          <Text className='status-card__score-number'>{score}</Text>
          <Text className='status-card__score-label'>状态分</Text>
        </View>
      </View>

      <View className='status-card__message'>
        <Text>{message}</Text>
      </View>
    </View>
  )
}
