import { View, Text, Image } from '@tarojs/components'
import { useState } from 'react'
import GlassCard from '../../components/GlassCard'
import PrimaryButton from '../../components/PrimaryButton'
import './index.scss'

const mockRecognition = {
  name: '鸡胸肉沙拉',
  confidence: 92,
  nutrition: {
    protein: 35,
    carbs: 12,
    fat: 8,
    calories: 248,
  },
  ingredients: ['鸡胸肉 120g', '生菜 50g', '番茄 30g', '橄榄油 5g'],
}

export default function Camera() {
  const [captured, setCaptured] = useState(false)
  const [recognized, setRecognized] = useState(false)

  const handleCapture = () => {
    setCaptured(true)
    setTimeout(() => setRecognized(true), 1500)
  }

  return (
    <View className='camera-page'>
      {/* 顶部 */}
      <View className='camera-page__header'>
        <Text className='camera-page__close'>✕</Text>
        <Text className='camera-page__title'>拍照记录</Text>
        <View />
      </View>

      {!captured ? (
        <>
          {/* 相机区域 */}
          <View className='camera-page__viewfinder'>
            <View className='camera-page__frame'>
              <Text className='camera-page__guide'>将食物放入框内</Text>
            </View>
          </View>

          {/* 底部控制 */}
          <View className='camera-page__controls'>
            <View className='camera-page__album'>📷</View>
            <View className='camera-page__capture' onClick={handleCapture}>
              <View className='camera-page__capture-inner' />
            </View>
            <View className='camera-page__flash'>⚡</View>
          </View>
        </>
      ) : !recognized ? (
        <View className='camera-page__loading'>
          <Text className='camera-page__loading-text'>正在识别...</Text>
        </View>
      ) : (
        <View className='camera-page__result'>
          <View className='camera-page__image-placeholder'>
            <Text>🍽️</Text>
          </View>

          <GlassCard className='camera-page__recognition'>
            <Text className='camera-page__recognition-title'>识别结果</Text>
            <Text className='camera-page__recognition-name'>{mockRecognition.name}</Text>
            <Text className='camera-page__recognition-confidence}>
              置信度 {mockRecognition.confidence}%
            </Text>

            <View className='camera-page__nutrition">
              <Text className='camera-page__nutrition-title'>营养估算</Text>
              <View className='camera-page__nutrition-grid'>
                <View className='camera-page__nutrition-item'>
                  <Text className='camera-page__nutrition-value'>{mockRecognition.nutrition.protein}g</Text>
                  <Text className='camera-page__nutrition-label'>蛋白质</Text>
                </View>
                <View className='camera-page__nutrition-item'>
                  <Text className='camera-page__nutrition-value'>{mockRecognition.nutrition.carbs}g</Text>
                  <Text className='camera-page__nutrition-label'>碳水</Text>
                </View>
                <View className='camera-page__nutrition-item'>
                  <Text className='camera-page__nutrition-value'>{mockRecognition.nutrition.fat}g</Text>
                  <Text className='camera-page__nutrition-label'>脂肪</Text>
                </View>
                <View className='camera-page__nutrition-item'>
                  <Text className='camera-page__nutrition-value'>{mockRecognition.nutrition.calories}</Text>
                  <Text className='camera-page__nutrition-label'>热量(kcal)</Text>
                </View>
              </View>
            </View>

            <View className='camera-page__ingredients'>
              <Text className='camera-page__ingredients-title'>食材详情</Text>
              {mockRecognition.ingredients.map((item, idx) => (
                <Text key={idx} className='camera-page__ingredient'>{item}</Text>
              ))}
            </View>

            <PrimaryButton onClick={() => wx.navigateBack()}>确认并保存</PrimaryButton>
          </GlassCard>
        </View>
      )}
    </View>
  )
}
