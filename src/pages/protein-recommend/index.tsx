import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import CustomNavBar from '../../components/CustomNavBar'
import GlassCard from '../../components/GlassCard'
import PrimaryButton from '../../components/PrimaryButton'
import ShilyAvatar from '../../components/ShilyAvatar'
import { shilyMotion } from '../../shily/motion'
import './index.scss'

const proteinOptions = [
  {
    id: 'egg-milk',
    title: '鸡蛋 + 牛奶',
    desc: '简单补一点蛋白',
    protein: '约 18g 蛋白',
    foods: ['鸡蛋 1个', '牛奶 200ml'],
  },
  {
    id: 'chicken-rice',
    title: '鸡胸肉 + 米饭',
    desc: '更有饱腹感',
    protein: '约 30g 蛋白',
    foods: ['鸡胸肉 120g', '米饭 150g'],
  },
  {
    id: 'tofu-veg',
    title: '豆腐 + 蔬菜',
    desc: '清淡一点',
    protein: '约 20g 蛋白',
    foods: ['豆腐 150g', '蔬菜 100g'],
  },
]

export default function ProteinRecommend() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = proteinOptions.find((item) => item.id === selectedId)

  const goConfirm = () => {
    if (!selected) return
    Taro.setStorageSync('shilySelectedProteinMeal', selected)
    Taro.navigateTo({ url: `/pages/protein-confirm/index?id=${selected.id}` })
  }

  return (
    <View className='page protein-page'>
      <CustomNavBar title='补一点蛋白' showBack onBack={() => Taro.navigateBack()} />

      <ScrollView className='page-content protein-content shily-flow-page' scrollY>
        <View className='protein-hero'>
          <ShilyAvatar status='happy' size='medium' motion={shilyMotion.flow.protein_flow.avatarMotion} />
          <View className='protein-copy'>
            <Text className='protein-kicker'>Shily 帮你选了几个简单的</Text>
            <Text className='protein-title'>不用复杂，选一个就好。</Text>
          </View>
        </View>

        <View className='protein-options'>
          {proteinOptions.map((item, index) => (
            <GlassCard
              key={item.id}
              className={`protein-option shily-flow-card ${selectedId === item.id ? 'protein-option--active' : ''}`}
              onClick={() => setSelectedId(item.id)}
              style={{ '--flow-card-delay': `${index * shilyMotion.card.stagger}s` } as any}
            >
              <View>
                <Text className='protein-option-title'>{item.title}</Text>
                <Text className='protein-option-desc'>{item.desc}</Text>
              </View>
              <View className='protein-option-side'>
                <Text className='protein-option-value'>{item.protein}</Text>
                {selectedId === item.id && <Text className='protein-option-selected'>已选</Text>}
              </View>
            </GlassCard>
          ))}
        </View>

        <View className='protein-primary-wrap'>
          <PrimaryButton disabled={!selected} onClick={goConfirm}>就选这个</PrimaryButton>
        </View>
      </ScrollView>
    </View>
  )
}
