import { View, Text } from '@tarojs/components'
import GlassCard from '../../components/GlassCard'
import ShilyAvatar from '../../components/ShilyAvatar'
import './index.scss'

const suggestions = [
  { icon: '👔', label: '穿衣', value: '舒适' },
  { icon: '🏃', label: '运动', value: '适宜' },
  { icon: '😴', label: '睡眠', value: '中等' },
  { icon: '💧', label: '饮水', value: '多喝水' },
]

export default function Weather() {
  return (
    <View className='weather-page'>
      {/* 顶部天气信息 */}
      <View className='weather-page__header'>
        <View className='weather-page__location'>
          <Text className='weather-page__city'>北京</Text>
        </View>
        <View className='weather-page__temp'>
          <Text className='weather-page__degree'>26°</Text>
          <Text className='weather-page__condition'>晴</Text>
        </View>
      </View>

      {/* 背景装饰 */}
      <View className='weather-page__scene'>
        <View className='weather-page__sun-light' />
        <View className='weather-page__hills' />
        <ShilyAvatar status='happy' size='medium' />
      </View>

      {/* 建议卡片 */}
      <View className='weather-page__content'>
        <GlassCard className='weather-page__advice-card'>
          <View className='weather-page__advice-header'>
            <Text className='weather-page__advice-title'>Shily 小建议</Text>
          </View>
          <Text className='weather-page__advice-text'>
            天气不错，饭后可以出门走走。记得补充水分，保持身体舒服一点。
          </Text>
        </GlassCard>

        <View className='weather-page__suggestions'>
          {suggestions.map((item) => (
            <View key={item.label} className='weather-page__suggestion-item'>
              <Text className='weather-page__suggestion-icon'>{item.icon}</Text>
              <Text className='weather-page__suggestion-label'>{item.label}</Text>
              <Text className='weather-page__suggestion-value'>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}
