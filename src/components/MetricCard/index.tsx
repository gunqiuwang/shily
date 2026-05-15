import { View, Text } from '@tarojs/components'
import GlassCard from '../GlassCard'
import AppIcon, { AppIconName } from '../AppIcon'
import './index.scss'

interface MetricCardProps {
  label: string
  value: string | number
  unit?: string
  progress?: number
  tone?: 'primary' | 'blue' | 'shily' | 'coral'
  icon?: 'water' | 'protein' | 'steps' | 'window' | 'sleep' | 'record'
  note?: string
  className?: string
  onClick?: () => void
}

const iconMap: Record<NonNullable<MetricCardProps['icon']>, AppIconName> = {
  water: 'droplet',
  protein: 'egg',
  steps: 'activity',
  window: 'clock',
  sleep: 'moon',
  record: 'notebook',
}

export default function MetricCard({
  label,
  value,
  unit,
  progress,
  tone = 'primary',
  icon,
  note,
  className = '',
  onClick,
}: MetricCardProps) {
  const progressWidth = progress !== undefined ? `${Math.min(progress * 100, 100)}%` : undefined

  return (
    <GlassCard className={`metric-card ${onClick ? 'metric-card--tap' : ''} ${className}`} variant='soft' onClick={onClick}>
      <View className='metric-card__head'>
        {icon && (
          <AppIcon
            className='metric-card__icon'
            name={iconMap[icon]}
            size={40}
            tone='active'
          />
        )}
        <Text className='metric-card__label'>{label}</Text>
      </View>
      <View className='metric-card__value'>
        <Text className='metric-card__number'>{value}</Text>
        {unit && <Text className='metric-card__unit'>{unit}</Text>}
      </View>
      {note && <Text className={`metric-card__note metric-card__note--${tone}`}>{note}</Text>}
      {progressWidth && (
        <View className='metric-card__progress'>
          <View
            className={`metric-card__progress-bar metric-card__progress-bar--${tone}`}
            style={{ width: progressWidth }}
          />
        </View>
      )}
    </GlassCard>
  )
}
