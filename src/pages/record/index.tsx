import { View, Text } from '@tarojs/components'
import { useState } from 'react'
import GlassCard from '../../components/GlassCard'
import PrimaryButton from '../../components/PrimaryButton'
import BottomTabBar from '../../components/BottomTabBar'
import './index.scss'

const mealTypes = ['早餐', '午餐', '加餐', '晚餐']

const mockRecords = [
  {
    id: 1,
    type: '早餐',
    time: '08:30',
    foods: ['全麦面包 2片', '鸡蛋 1个', '牛奶 200ml'],
    calories: 380,
  },
  {
    id: 2,
    type: '午餐',
    time: '12:45',
    foods: ['糙米饭 150g', '鸡胸肉 120g', '西兰花 100g'],
    calories: 520,
  },
]

const mealIcons: Record<string, string> = {
  '早餐': '🌅',
  '午餐': '☀️',
  '加餐': '🍎',
  '晚餐': '🌙',
}

export default function Record() {
  const [selectedDate] = useState(new Date())

  const formatDate = (date: Date) => {
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    return `${month}月${day}日 周${weekdays[date.getDay()]}`
  }

  return (
    <View className='record-page'>
      <View className='record-page__header'>
        <View className='record-page__date'>
          <Text className='record-page__date-text'>{formatDate(selectedDate)}</Text>
          <Text className='record-page__calendar'>📅</Text>
        </View>
      </View>

      <View className='record-page__list'>
        {mealTypes.map((mealType) => {
          const record = mockRecords.find((r) => r.type === mealType)
          return (
            <GlassCard key={mealType} className='record-card'>
              <View className='record-card__header'>
                <View className='record-card__type'>
                  <Text className='record-card__icon'>{mealIcons[mealType]}</Text>
                  <Text className='record-card__type-text'>{mealType}</Text>
                </View>
                {record && (
                  <Text className='record-card__time'>{record.time}</Text>
                )}
              </View>

              {record ? (
                <View>
                  <View className='record-card__foods'>
                    {record.foods.map((food, idx) => (
                      <Text key={idx} className='record-card__food'>{food}</Text>
                    ))}
                  </View>
                  <View className='record-card__footer'>
                    <Text className='record-card__calories'>约 {record.calories} kcal</Text>
                  </View>
                </View>
              ) : (
                <View className='record-card__empty'>
                  <Text className='record-card__empty-text'>点击添加记录</Text>
                </View>
              )}
            </GlassCard>
          )
        })}
      </View>

      <View className='record-page__footer'>
        <PrimaryButton onClick={() => wx.navigateTo({ url: '/pages/camera/index' })}>
          + 记录饮食
        </PrimaryButton>
      </View>

      <BottomTabBar />
    </View>
  )
}
