import { Image, View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import GlassCard from '../../components/GlassCard'
import SecondaryButton from '../../components/SecondaryButton'
import BottomTabBar from '../../components/BottomTabBar'
import CustomNavBar from '../../components/CustomNavBar'
import { calculateTargets } from '../../shily/calculations'
import { DEFAULT_SHILY_PLAN, ShilyPlanId, getShilyPlan } from '../../shily/plans'
import { ShilyProfile, defaultProfile, readShilyProfile } from '../../shily/profile'
import {
  ShilyStrategyConfig,
  defaultStrategyConfig,
  getStrategySummary,
  readShilyStrategy,
} from '../../shily/strategy'
import { uiAssets } from '../../shily/uiAssets'
import './index.scss'

function getWeekIndex(profile: ShilyProfile) {
  if (!profile.completedAt) return 1
  const elapsed = Date.now() - profile.completedAt
  return Math.max(1, Math.floor(elapsed / (86400000 * 7)) + 1)
}

function getTasks(profile: ShilyProfile, strategy: ShilyStrategyConfig) {
  const targetText = profile.targetWeightKg ? `目标体重 ${profile.targetWeightKg}kg` : '先稳定记录节奏'

  if (strategy.goal === 'glp1_support') {
    return ['记录医嘱和下次提醒', '记录食欲和舒适感', '照顾水分和少量蛋白', targetText, '不自行调整用药']
  }

  if (strategy.goal === 'muscle_gain') {
    return ['保证训练日蛋白', '记录训练和恢复', '睡眠尽量稳定', targetText]
  }

  if (strategy.goal === 'fasting') {
    return ['稳定进食窗口', '不舒服时放宽窗口', '窗口内先吃够蛋白', targetText]
  }

  if (strategy.goal === 'carb') {
    return ['选择温和控碳方式', '保留蛋白和蔬菜', '避免过度限制', targetText]
  }

  return ['记录每日饮食', '补足蛋白和水分', '保持轻量活动', targetText]
}

export default function Goal() {
  const [profile, setProfile] = useState<ShilyProfile>(defaultProfile)
  const [strategy, setStrategy] = useState<ShilyStrategyConfig>(defaultStrategyConfig)
  const [planId, setPlanId] = useState<ShilyPlanId>(DEFAULT_SHILY_PLAN)

  useDidShow(() => {
    const nextProfile = readShilyProfile()
    const nextStrategy = readShilyStrategy()
    setProfile(nextProfile)
    setStrategy(nextStrategy)
    setPlanId((Taro.getStorageSync('shilyPlan') as ShilyPlanId) || nextStrategy.planId || DEFAULT_SHILY_PLAN)
  })

  const plan = getShilyPlan(planId)
  const weekIndex = getWeekIndex(profile)
  const totalWeeks = strategy.cycleWeeks || 8
  const isGlp1 = strategy.goal === 'glp1_support'
  const progress = `${Math.min(100, Math.round((weekIndex / (isGlp1 ? 8 : totalWeeks)) * 100))}%`
  const stageProgressText = isGlp1
    ? `饮食观察第 ${weekIndex} 周`
    : `第 ${Math.min(weekIndex, totalWeeks)} 周 / 共 ${totalWeeks} 周`
  const tasks = getTasks(profile, strategy)
  const targets = calculateTargets(profile, planId, strategy)
  const currentWeightText = profile.weightKg ? `${profile.weightKg}kg` : '未填写'
  const targetWeightText = profile.targetWeightKg || strategy.targetWeightKg ? `${profile.targetWeightKg || strategy.targetWeightKg}kg` : '未设置'
  const calorieBasisText = targets.maintenanceCalories
    ? `按身高、当前体重、活动量和目标体重估算，维持约 ${targets.maintenanceCalories}kcal。`
    : '当前缺少身高信息，先按体重和方案估算。'

  return (
    <View className='page goal-page'>
      <CustomNavBar
        title='阶段与目标'
        showBack
        onBack={() => Taro.navigateBack()}
      />

      <View className='page-content goal-content'>
        <GlassCard className='stage-card' variant='tint'>
          <Image className='stage-illustration' src={uiAssets.feature.stage} mode='aspectFit' />
          <Text className='stage-label'>当前节律</Text>
          <Text className='stage-name'>{plan.title}</Text>
          <Text className='stage-progress'>{stageProgressText}</Text>
          <View className='progress-bar'>
            <View className='progress-fill' style={{ width: progress }} />
          </View>
          <Text className='stage-goal'>{getStrategySummary(strategy)}</Text>
        </GlassCard>

        <GlassCard className='target-card'>
          <View className='target-row'>
            <Text className='target-label'>当前体重</Text>
            <Text className='target-value'>{currentWeightText}</Text>
          </View>
          <View className='target-row'>
            <Text className='target-label'>目标体重</Text>
            <Text className='target-value'>{targetWeightText}</Text>
          </View>
          <View className='target-row'>
            <Text className='target-label'>今日热量目标</Text>
            <Text className='target-value'>{targets.calorieTarget}kcal</Text>
          </View>
          <Text className='target-desc'>{calorieBasisText}</Text>
        </GlassCard>

        <Text className='section-title'>这一阶段先照顾这些</Text>
        <GlassCard className='task-list'>
          {tasks.map((task, index) => {
            const completed = index === 0
            return (
              <View key={task} className='task-item'>
                <View className={`task-check ${completed ? 'done' : ''}`}>
                  {completed && <Text>✓</Text>}
                </View>
                <Text className={`task-label ${completed ? 'done' : ''}`}>
                  {task}
                </Text>
              </View>
            )
          })}
        </GlassCard>

        <SecondaryButton onClick={() => Taro.navigateTo({ url: '/pages/onboarding/index' })}>
          调整节律方案
        </SecondaryButton>
      </View>

      <BottomTabBar />
    </View>
  )
}
