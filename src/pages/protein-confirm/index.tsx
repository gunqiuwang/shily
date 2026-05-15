import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useMemo, useState } from 'react'
import CustomNavBar from '../../components/CustomNavBar'
import GlassCard from '../../components/GlassCard'
import PrimaryButton from '../../components/PrimaryButton'
import ShilyAvatar from '../../components/ShilyAvatar'
import { shilyMotion } from '../../shily/motion'
import './index.scss'

interface ProteinMeal {
  id: string
  title: string
  desc: string
  protein: string
  foods: string[]
}

const fallbackMeal: ProteinMeal = {
  id: 'egg-milk',
  title: '鸡蛋 + 牛奶',
  desc: '简单补一点蛋白',
  protein: '约 18g 蛋白',
  foods: ['鸡蛋 1个', '牛奶 200ml'],
}

const foodQuantityMap: Record<string, { name: string; quantity: number; unit: string }> = {
  '鸡蛋 1个': { name: '鸡蛋', quantity: 1, unit: '个' },
  '牛奶 200ml': { name: '牛奶', quantity: 200, unit: 'ml' },
  '鸡胸肉 120g': { name: '鸡胸肉', quantity: 120, unit: 'g' },
  '米饭 150g': { name: '米饭', quantity: 150, unit: 'g' },
  '豆腐 150g': { name: '豆腐', quantity: 150, unit: 'g' },
  '蔬菜 100g': { name: '蔬菜', quantity: 100, unit: 'g' },
}

function getStep(unit: string) {
  if (unit === '个') return 1
  if (unit === 'ml') return 50
  return 25
}

function isProteinMeal(value: unknown): value is ProteinMeal {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'id' in value &&
      'foods' in value &&
      Array.isArray((value as ProteinMeal).foods),
  )
}

export default function ProteinConfirm() {
  const router = useRouter()
  const meal = useMemo<ProteinMeal>(() => {
    const stored = Taro.getStorageSync('shilySelectedProteinMeal')
    return isProteinMeal(stored) && stored.id === router.params.id ? stored : fallbackMeal
  }, [router.params.id])
  const [items, setItems] = useState(() =>
    meal.foods.map((food) => foodQuantityMap[food] || { name: food, quantity: 1, unit: '份' }),
  )

  const adjustItem = (index: number, direction: 1 | -1) => {
    setItems((prev) =>
      prev.map((item, itemIndex) => {
        if (itemIndex !== index) return item
        const step = getStep(item.unit)
        const min = item.unit === '个' || item.unit === '份' ? 1 : step
        return { ...item, quantity: Math.max(min, item.quantity + direction * step) }
      }),
    )
  }

  const handleConfirm = () => {
    Taro.setStorageSync('shilyProteinMealRecord', {
      ...meal,
      items,
      mealType: '午餐',
      recordedAt: Date.now(),
    })
    Taro.navigateTo({ url: '/pages/protein-complete/index' })
  }

  return (
    <View className='page protein-confirm-page'>
      <CustomNavBar title='确认这一餐' showBack onBack={() => Taro.navigateBack()} />

      <View className='page-content protein-confirm-content shily-flow-page'>
        <View className='confirm-shily'>
          <ShilyAvatar status='happy' size='medium' motion={shilyMotion.flow.protein_flow.avatarMotion} />
        </View>

        <GlassCard className='confirm-card'>
          <Text className='confirm-kicker'>已经帮你填好了</Text>
          <Text className='confirm-title'>午餐</Text>
          <View className='confirm-foods'>
            {items.map((food, index) => (
              <View
                key={food.name}
                className='confirm-food shily-flow-card'
                style={{ '--flow-card-delay': `${index * shilyMotion.card.stagger}s` } as any}
              >
                <View>
                  <Text className='confirm-food-name'>{food.name}</Text>
                  <Text className='confirm-food-amount'>{food.quantity}{food.unit}</Text>
                </View>
                <View className='confirm-stepper'>
                  <View className='confirm-stepper-btn' onClick={() => adjustItem(index, -1)}>
                    <Text>-</Text>
                  </View>
                  <View className='confirm-stepper-btn' onClick={() => adjustItem(index, 1)}>
                    <Text>+</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
          <Text className='confirm-protein'>{meal.protein}</Text>
        </GlassCard>

        <View className='confirm-primary-wrap'>
          <PrimaryButton onClick={handleConfirm}>确认记录</PrimaryButton>
        </View>
      </View>
    </View>
  )
}
