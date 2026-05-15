import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import CustomNavBar from '../../components/CustomNavBar'
import GlassCard from '../../components/GlassCard'
import PrimaryButton from '../../components/PrimaryButton'
import AppIcon from '../../components/AppIcon'
import { DEFAULT_SHILY_PLAN, ShilyPlanId, shilyPlans } from '../../shily/plans'
import { ShilyStrategyConfig, readShilyStrategy } from '../../shily/strategy'
import './index.scss'

const planGroups = [
  { key: 'body', title: '体重与体态' },
  { key: 'fasting', title: '轻断食' },
  { key: 'carb', title: '控碳 / 生酮' },
  { key: 'glp1', title: 'GLP-1 支持' },
] as const

export default function Plan() {
  const [selectedPlan, setSelectedPlan] = useState<ShilyPlanId>(DEFAULT_SHILY_PLAN)
  const [activeGroup, setActiveGroup] = useState<(typeof planGroups)[number]['key']>('body')
  const [strategyConfig, setStrategyConfig] = useState<ShilyStrategyConfig>(readShilyStrategy())

  useDidShow(() => {
    const nextStrategy = readShilyStrategy()
    const nextPlan = (Taro.getStorageSync('shilyPlan') as ShilyPlanId) || nextStrategy.planId || DEFAULT_SHILY_PLAN
    const nextGroup = shilyPlans.find((plan) => plan.id === nextPlan)?.group || 'body'
    setStrategyConfig(nextStrategy)
    setSelectedPlan(nextPlan)
    setActiveGroup(nextGroup)
  })

  const savePlan = () => {
    Taro.setStorageSync('shilyPlan', selectedPlan)
    Taro.setStorageSync('shilyStrategy', {
      ...strategyConfig,
      planId: selectedPlan,
      goal: selectedPlan === 'muscle_gain'
        ? 'muscle_gain'
        : selectedPlan.startsWith('fasting_')
          ? 'fasting'
          : selectedPlan === 'low_carb' || selectedPlan === 'keto_standard'
            ? 'carb'
            : selectedPlan.startsWith('glp1_')
              ? 'glp1_support'
              : 'fat_loss',
    })
    Taro.showToast({ title: '已保存', icon: 'none' })
    setTimeout(() => Taro.navigateBack(), 260)
  }

  return (
    <View className='page plan-page'>
      <CustomNavBar title='我的节律方案' showBack />

      <View className='page-content plan-content'>
        <View className='plan-head'>
          <Text className='plan-title'>让 Shily 按你的方式陪你</Text>
          <Text className='plan-subtitle'>先选一个当前最接近你的方案，之后可以随时换。</Text>
        </View>

        <View className='plan-group-tabs'>
          {planGroups.map((group) => {
            const active = activeGroup === group.key
            const selectedInGroup = shilyPlans.some((plan) => plan.group === group.key && plan.id === selectedPlan)
            return (
              <View
                key={group.key}
                className={`plan-group-tab ${active ? 'plan-group-tab--active' : ''} ${selectedInGroup ? 'plan-group-tab--selected' : ''}`}
                onClick={() => setActiveGroup(group.key)}
              >
                <Text>{group.title}</Text>
              </View>
            )
          })}
        </View>

        <View className='plan-list'>
          <View className='plan-group'>
            {shilyPlans.filter((plan) => plan.group === activeGroup).map((plan) => {
              const active = selectedPlan === plan.id
              return (
                <GlassCard
                  key={plan.id}
                  className={`plan-card ${active ? 'plan-card--active' : ''}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <View className='plan-card-main'>
                    <View className='plan-icon'>
                      <AppIcon name={active ? 'check' : 'sparkle'} size={24} tone={active ? 'white' : 'deep'} />
                    </View>
                    <View className='plan-copy'>
                      <Text className='plan-card-title'>{plan.title}</Text>
                      <Text className='plan-card-desc'>{plan.desc}</Text>
                      <Text className='plan-card-focus'>今日重点会偏向：{plan.focus}</Text>
                      {plan.safetyNote && <Text className='plan-card-note'>{plan.safetyNote}</Text>}
                    </View>
                  </View>
                </GlassCard>
              )
            })}
          </View>
        </View>

        <View className='plan-note'>
          <Text>方案只用于调整饮食记录、提醒和 Shily 反馈，不替代医生、营养师或药品说明书。</Text>
        </View>

        <PrimaryButton onClick={savePlan}>保存方案</PrimaryButton>
      </View>
    </View>
  )
}
