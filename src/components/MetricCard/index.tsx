import { View, Text } from '@tarojs/components'
import './index.scss'

interface MetricCardProps {
  icon: string
  label: string
  value: string | number
  unit?: string
  progress?: number
}

export default function MetricCard({ icon, label, value, unit, progress }: MetricCardProps) {
  const progressWidth = progress !== undefined ? Math.min(progress * 100, 100) : 0

  return (
    <View className='metric-card'>
      <View className='metric-card__icon'>{icon}</View>
      <View className='metric-card__label'>{label}</View>
      <View className='metric-card__value'>
        <Text className='metric-card__number'>{value}</Text>
        {unit && <Text className='metric-card__unit'>{unit}</Text>}
      </View>
      {progress !== undefined && (
        <View className='metric-card__progress'>
          <View className='metric-card__progress-bar' style={{ width: `${progressWidth}%` }} />
        </View>
      )}
    </View>
  )
}
