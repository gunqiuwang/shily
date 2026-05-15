import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import GlassCard from '../../components/GlassCard'
import ShilyAvatar from '../../components/ShilyAvatar'
import BottomTabBar from '../../components/BottomTabBar'
import CustomNavBar from '../../components/CustomNavBar'
import AppIcon, { AppIconName } from '../../components/AppIcon'
import { DEFAULT_SHILY_PLAN, ShilyPlanId } from '../../shily/plans'
import { ShilyDailyState, readShilyDailyState } from '../../shily/dailyState'
import { defaultProfile, readShilyProfile } from '../../shily/profile'
import { readShilyStrategy } from '../../shily/strategy'
import './index.scss'

const suggestions: Array<{ icon: AppIconName; label: string; value: string }> = [
  { icon: 'shirt', label: '穿衣', value: '舒适' },
  { icon: 'activity', label: '活动', value: '适宜' },
  { icon: 'moon', label: '睡眠', value: '中等' },
  { icon: 'droplet', label: '饮水', value: '多喝水' },
]

export default function Weather() {
  const [dailyState, setDailyState] = useState<ShilyDailyState | null>(null)

  useDidShow(() => {
    const profile = readShilyProfile() || defaultProfile
    const strategy = readShilyStrategy()
    const planId = (Taro.getStorageSync('shilyPlan') as ShilyPlanId) || DEFAULT_SHILY_PLAN
    setDailyState(readShilyDailyState(profile, planId, strategy))
  })

  return (
    <View className='page weather-page'>
      <CustomNavBar />

      <View className='page-content'>
        <View className='weather-header'>
          <View className='weather-location'>
            <Text className='weather-city'>{dailyState?.weatherCity || '当前位置'}</Text>
          </View>
          <View className='weather-temp'>
            <Text className='weather-degree'>{dailyState?.weatherDegree || '--'}°</Text>
            <Text className='weather-condition'>{dailyState?.weatherCondition || '天气待同步'}</Text>
          </View>
        </View>

        <View className='weather-scene'>
          <View className='weather-sun'>
            <AppIcon name='sun' size={44} tone='active' strokeWidth={2} />
          </View>
          <View className='weather-hills' />
          <ShilyAvatar status='happy' size='medium' />
        </View>

        <GlassCard className='advice-card'>
          <Text className='card-title'>Shily 小建议</Text>
          <Text className='card-text'>
            天气不错，饭后可以出门走走。记得补充水分，让身体舒服一点。
          </Text>
        </GlassCard>

        <View className='suggestion-grid'>
          {suggestions.map((item) => (
            <GlassCard key={item.label} className='suggestion-item' variant='soft'>
              <View className='suggestion-icon'>
                <AppIcon name={item.icon} size={34} tone='muted' strokeWidth={2} />
              </View>
              <Text className='suggestion-label'>{item.label}</Text>
              <Text className='suggestion-value'>{item.value}</Text>
            </GlassCard>
          ))}
        </View>
      </View>

      <BottomTabBar />
    </View>
  )
}
