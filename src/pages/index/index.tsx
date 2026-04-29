import { View, Text, ScrollView } from '@tarojs/components'
import { useState } from 'react'
import WeatherBadge from '../../components/WeatherBadge'
import StatusCard from '../../components/StatusCard'
import MetricCard from '../../components/MetricCard'
import GlassCard from '../../components/GlassCard'
import PrimaryButton from '../../components/PrimaryButton'
import ShilyAvatar from '../../components/ShilyAvatar'
import BottomTabBar from '../../components/BottomTabBar'
import './index.scss'

const metrics = [
  { icon: '💧', label: '饮水', value: 6, unit: '/8杯', progress: 0.75 },
  { icon: '🍳', label: '蛋白质', value: 68, unit: '/90g', progress: 0.76 },
  { icon: '👟', label: '步数', value: 6320, unit: '步', progress: 0.63 },
  { icon: '⏰', label: '进食窗口', value: 12, unit: '/16h', progress: 0.75 },
]

export default function Index() {
  const [greeting] = useState(() => {
    const hour = new Date().getHours()
    if (hour < 6) return '凌晨好'
    if (hour < 9) return '早上好'
    if (hour < 12) return '上午好'
    if (hour < 14) return '中午好'
    if (hour < 18) return '下午好'
    if (hour < 22) return '晚上好'
    return '夜深了'
  })

  return (
    <View className='index-page'>
      {/* 顶部区域 */}
      <View className='index-page__header'>
        <WeatherBadge city='北京' temperature={26} weather='晴' />
        <View className='index-page__header-right'>
          <Text className='index-page__icon'>🔔</Text>
          <Text className='index-page__icon'>➕</Text>
        </View>
      </View>

      {/* 问候语 */}
      <View className='index-page__greeting'>
        <Text className='index-page__greeting-text'>{greeting}，郭瑶</Text>
        <Text className='index-page__greeting-sub'>今天也慢慢变好就好</Text>
      </View>

      <ScrollView
        className='index-page__content'
        scrollY
        showsVerticalScrollIndicator={false}
      >
        {/* Shily 状态卡片 */}
        <StatusCard
          score={85}
          status='良好'
          message='整体状态良好，继续保持节奏'
        />

        {/* 指标卡片 */}
        <View className='index-page__metrics'>
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </View>

        {/* 今日建议 */}
        <GlassCard className='index-page__advice'>
          <View className='index-page__advice-header'>
            <Text className='index-page__advice-title'>今日小建议</Text>
            <ShilyAvatar status='thinking' size='small' />
          </View>
          <Text className='index-page__advice-content'>
            午餐可以选择高蛋白食物，搭配蔬菜，会更稳一些。
          </Text>
        </GlassCard>

        <View className='index-page__spacer' />
      </ScrollView>

      {/* 底部按钮 */}
      <View className='index-page__footer'>
        <PrimaryButton onClick={() => wx.navigateTo({ url: '/pages/camera/index' })}>
          + 记录饮食
        </PrimaryButton>
      </View>

      <BottomTabBar />
    </View>
  )
}
