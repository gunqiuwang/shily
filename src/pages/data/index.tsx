import { View, Text } from '@tarojs/components'
import { useState } from 'react'
import { colors } from '../../styles/tokens'
import GlassCard from '../../components/GlassCard'
import CircularScore from '../../components/CircularScore'
import BottomTabBar from '../../components/BottomTabBar'
import './index.scss'

type TimeRange = 'day' | 'week' | 'month'

const nutritionData = [
  { label: '蛋白质', value: 68, unit: 'g', target: 90, color: '#7BC89C' },
  { label: '碳水', value: 180, unit: 'g', target: 250, color: '#BFDCEB' },
  { label: '脂肪', value: 45, unit: 'g', target: 60, color: '#D9D7FF' },
  { label: '热量', value: 1650, unit: 'kcal', target: 2000, color: '#F7B7B2' },
]

const lifestyleData = [
  { icon: '💧', label: '饮水', value: '6/8杯', status: 'good' },
  { icon: '👟', label: '运动', value: '4次', status: 'good' },
  { icon: '😴', label: '睡眠', value: '7.5h', status: 'warning' },
  { icon: '🧘', label: '放松', value: '2次', status: 'good' },
]

export default function Data() {
  const [timeRange, setTimeRange] = useState<TimeRange>('day')

  return (
    <View className='data-page'>
      {/* 顶部切换 */}
      <View className='data-page__header'>
        <View className='data-page__tabs'>
          {(['day', 'week', 'month'] as TimeRange[]).map((tab) => (
            <View
              key={tab}
              className={`data-page__tab ${timeRange === tab ? 'data-page__tab--active' : ''}`}
              onClick={() => setTimeRange(tab)}
            >
              <Text>{tab === 'day' ? '日' : tab === 'week' ? '周' : '月'}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 核心分数 */}
      <GlassCard className='data-page__score-card'>
        <View className='data-page__score-content'>
          <CircularScore score={86} label='很棒！' size='large' />
          <View className='data-page__score-info'>
            <Text className='data-page__score-title'>今日状态分</Text>
            <Text className='data-page__score-desc'>整体表现良好，继续保持</Text>
          </View>
        </View>
      </GlassCard>

      {/* 营养摄入 */}
      <View className='data-page__section'>
        <Text className='data-page__section-title'>营养摄入</Text>
        <GlassCard className='nutrition-card'>
          {nutritionData.map((item) => (
            <View key={item.label} className='nutrition-card__item'>
              <View className='nutrition-card__header'>
                <Text className='nutrition-card__label'>{item.label}</Text>
                <Text className='nutrition-card__value'>{item.value}{item.unit}</Text>
              </View>
              <View className='nutrition-card__bar'>
                <View
                  className='nutrition-card__bar-fill'
                  style={{
                    width: `${(item.value / item.target) * 100}%`,
                    background: item.color,
                  }}
                />
              </View>
              <Text className='nutrition-card__target'>目标 {item.target}{item.unit}</Text>
            </View>
          ))}
        </GlassCard>
      </View>

      {/* 生活习惯 */}
      <View className='data-page__section'>
        <Text className='data-page__section-title'>生活习惯</Text>
        <View className='data-page__lifestyle'>
          {lifestyleData.map((item) => (
            <GlassCard key={item.label} className='lifestyle-card'>
              <Text className='lifestyle-card__icon'>{item.icon}</Text>
              <Text className='lifestyle-card__label'>{item.label}</Text>
              <Text className={`lifestyle-card__value lifestyle-card__value--${item.status}`}>
                {item.value}
              </Text>
            </GlassCard>
          ))}
        </View>
      </View>

      <BottomTabBar />
    </View>
  )
}
