import { View, Text } from '@tarojs/components'
import { colors } from '../../styles/tokens'
import './index.scss'

interface CircularScoreProps {
  score: number
  label: string
  size?: 'small' | 'medium' | 'large'
}

export default function CircularScore({ score, label, size = 'medium' }: CircularScoreProps) {
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <View className={`circular-score circular-score--${size}`}>
      <View className='circular-score__ring'>
        <View className='circular-score__bg' />
        <View
          className='circular-score__progress'
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
          }}
        />
      </View>
      <View className='circular-score__content'>
        <Text className='circular-score__number'>{score}</Text>
        <Text className='circular-score__label'>{label}</Text>
      </View>
    </View>
  )
}
