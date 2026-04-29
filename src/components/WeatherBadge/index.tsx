import { View, Text } from '@tarojs/components'
import { colors } from '../../styles/tokens'
import './index.scss'

interface WeatherBadgeProps {
  city: string
  temperature: number
  weather: string
}

const weatherIcons: Record<string, string> = {
  '晴': '☀',
  '多云': '⛅',
  '阴': '☁',
  '雨': '🌧',
  '雪': '❄',
}

export default function WeatherBadge({ city, temperature, weather }: WeatherBadgeProps) {
  return (
    <View className='weather-badge'>
      <View className='weather-badge__location'>
        <Text className='weather-badge__icon'>📍</Text>
        <Text className='weather-badge__city'>{city}</Text>
      </View>
      <View className='weather-badge__info'>
        <Text className='weather-badge__icon-small'>{weatherIcons[weather] || '☀'}</Text>
        <Text className='weather-badge__temp'>{temperature}°</Text>
        <Text className='weather-badge__weather'>{weather}</Text>
      </View>
    </View>
  )
}
