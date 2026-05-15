import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import ShilyAvatar from '../../components/ShilyAvatar'
import BottomTabBar from '../../components/BottomTabBar'
import CustomNavBar from '../../components/CustomNavBar'
import GlassCard from '../../components/GlassCard'
import MetricCard from '../../components/MetricCard'
import { buildDailyInput, calculateTargets } from '../../shily/calculations'
import { readMetricRange } from '../../shily/dailyMetrics'
import { ShilyDailyState, readShilyDailyState } from '../../shily/dailyState'
import { readMealRecordsInRange, sumMealRecords } from '../../shily/mealRecords'
import { DEFAULT_SHILY_PLAN, ShilyPlanId } from '../../shily/plans'
import { ShilyProfile, defaultProfile, hasProfileMetrics, readShilyProfile } from '../../shily/profile'
import { ShilyStrategyConfig, defaultStrategyConfig, readShilyStrategy } from '../../shily/strategy'
import './index.scss'

type TimeRange = 'day' | 'week' | 'month'

export default function Data() {
  const [timeRange, setTimeRange] = useState<TimeRange>('day')
  const [proteinHandled, setProteinHandled] = useState(false)
  const [profile, setProfile] = useState<ShilyProfile>(defaultProfile)
  const [planId, setPlanId] = useState<ShilyPlanId>(DEFAULT_SHILY_PLAN)
  const [strategyConfig, setStrategyConfig] = useState<ShilyStrategyConfig>(defaultStrategyConfig)
  const [dailyState, setDailyState] = useState<ShilyDailyState | null>(null)
  const [onboardingDone, setOnboardingDone] = useState(false)

  useDidShow(() => {
    const nextProfile = readShilyProfile()
    const nextStrategy = readShilyStrategy()
    const nextPlan = (Taro.getStorageSync('shilyPlan') as ShilyPlanId) || DEFAULT_SHILY_PLAN
    setProfile(nextProfile)
    setStrategyConfig(nextStrategy)
    setPlanId(nextPlan)
    setOnboardingDone(Boolean(Taro.getStorageSync('shilyOnboardingDone')))
    setProteinHandled(Boolean(Taro.getStorageSync('shilyProteinBoostDone')))
    setDailyState(readShilyDailyState(nextProfile, nextPlan, nextStrategy))
  })

  const showProfileHint = !onboardingDone && !hasProfileMetrics(profile)
  const targets = calculateTargets(profile, planId, strategyConfig)
  const dailyInput = dailyState?.dailyInput || buildDailyInput(profile, planId, strategyConfig)
  const proteinValue = proteinHandled ? Math.min(targets.proteinTargetG, dailyInput.proteinG + 17) : dailyInput.proteinG
  const rangeMeta = {
    day: { label: '今日', days: 1, scoreLabel: '今日状态', desc: '今天的记录会直接影响首页建议。' },
    week: { label: '本周', days: 7, scoreLabel: '周趋势', desc: '最近 7 天真实记录汇总。' },
    month: { label: '本月', days: 30, scoreLabel: '月趋势', desc: '最近 30 天真实记录汇总。' },
  }[timeRange]
  const rangeDays = rangeMeta.days
  const rangeMealRecords = readMealRecordsInRange(rangeDays)
  const rangeNutrition = timeRange === 'day'
    ? {
        calories: dailyInput.calories,
        proteinG: proteinValue,
        carbG: dailyInput.carbG,
        fatG: dailyInput.fatG || 0,
      }
    : sumMealRecords(rangeMealRecords)
  const rangeMetrics = readMetricRange(rangeDays)
  const mealDays = new Set(rangeMealRecords.map((item) => new Date(item.createdAt).toDateString())).size
  const stableText = rangeMetrics.stepDays ? '步数和饮食记录' : '饮食记录'
  const gentleText = rangeNutrition.proteinG < targets.proteinTargetG * rangeDays ? '蛋白质' : '饮水'
  const dataQuality = [
    {
      label: '餐食记录',
      value: rangeMealRecords.length ? `${rangeMealRecords.length}餐` : '待补充',
      tone: 'primary',
      icon: 'record',
      note: rangeMealRecords.length ? `${mealDays || 1}天有记录` : '影响判断',
    },
    {
      label: '步数来源',
      value: timeRange === 'day'
        ? dailyState?.stepsEstimated ? '手动估算' : dailyState?.stepsText || '已记录'
        : rangeMetrics.stepDays ? `${rangeMetrics.stepDays}天` : '待补充',
      tone: 'blue',
      icon: 'steps',
      note: rangeMetrics.stepDays ? `${Math.round(rangeMetrics.steps / Math.max(1, rangeMetrics.stepDays))}步/天` : '可手填',
    },
    {
      label: '睡眠记录',
      value: timeRange === 'day' ? (dailyState?.sleepText || '未记录') : rangeMetrics.sleepDays ? `${rangeMetrics.sleepDays}天` : '未记录',
      tone: 'shily',
      icon: 'sleep',
      note: rangeMetrics.sleepDays ? '已记录' : '可跳过',
    },
    {
      label: '喝水记录',
      value: timeRange === 'day' ? `${dailyState?.waterCups || 0}杯` : rangeMetrics.waterDays ? `${rangeMetrics.waterDays}天` : '待补充',
      tone: 'blue',
      icon: 'water',
      note: rangeMetrics.waterCups ? `${rangeMetrics.waterCups}杯` : '可手填',
    },
  ] as const

  const nutritionData = [
    {
      label: '蛋白质',
      value: `${Math.round(rangeNutrition.proteinG)}g`,
      target: `${targets.proteinTargetG * rangeDays}g`,
      tone: 'primary',
      progress: `${Math.min(100, Math.round((rangeNutrition.proteinG / (targets.proteinTargetG * rangeDays)) * 100))}%`,
    },
    { label: '碳水', value: `${Math.round(rangeNutrition.carbG)}g`, target: `${targets.carbTargetG * rangeDays}g`, tone: 'blue', progress: `${Math.min(100, Math.round((rangeNutrition.carbG / (targets.carbTargetG * rangeDays)) * 100))}%` },
    {
      label: '脂肪',
      value: `${Math.round(rangeNutrition.fatG || 0)}g`,
      target: `${(targets.fatTargetG || dailyInput.fatTargetG || 60) * rangeDays}g`,
      tone: 'blue',
      progress: `${Math.min(100, Math.round(((rangeNutrition.fatG || 0) / ((targets.fatTargetG || dailyInput.fatTargetG || 60) * rangeDays)) * 100))}%`,
    },
    { label: '热量', value: `${Math.round(rangeNutrition.calories)}kcal`, target: `${targets.calorieTarget * rangeDays}kcal`, tone: 'coral', progress: `${Math.min(100, Math.round((rangeNutrition.calories / (targets.calorieTarget * rangeDays)) * 100))}%` },
  ]

  return (
    <View className='page data-page'>
      <CustomNavBar title='数据' />

      <View className='page-content data-content'>
        <View className='segment'>
          {[
            { key: 'day', label: '日' },
            { key: 'week', label: '周' },
            { key: 'month', label: '月' },
          ].map((item) => (
            <View
              key={item.key}
              className={`segment-item ${timeRange === item.key ? 'active' : ''}`}
              onClick={() => setTimeRange(item.key as TimeRange)}
            >
              <Text>{item.label}</Text>
            </View>
          ))}
        </View>

        {showProfileHint && (
          <GlassCard className='profile-hint-card' variant='tint' onClick={() => Taro.navigateTo({ url: '/pages/onboarding/index' })}>
            <Text className='profile-hint-title'>补全基础信息后，Shily 会更懂你的身体情况</Text>
            <Text className='profile-hint-desc'>身高、体重和目标体重可以跳过，但填写后蛋白、水分和趋势会更贴近你。</Text>
          </GlassCard>
        )}

        <GlassCard className='score-card' variant='tint'>
          <View className='score-visual'>
            <View className='score-ring'>
              <View className='score-core'>
                <Text className='score-main'>{targets.score}</Text>
                <Text className='score-sub'>{rangeMeta.scoreLabel}</Text>
              </View>
            </View>
          </View>
          <View className='score-info'>
            <Text className='score-title'>{targets.scoreTitle}</Text>
            <Text className='score-desc'>
              {proteinHandled
                ? '刚刚补上的那一点很有帮助，今天可以先不用再盯着蛋白。'
                : timeRange === 'day' ? targets.scoreDesc : rangeMeta.desc}
            </Text>
            <View className='score-insights'>
              <Text className='score-insight'>范围：{rangeMeta.label}</Text>
              <Text className='score-insight'>稳定：{stableText}</Text>
              <Text className='score-insight'>待补足：{gentleText}</Text>
            </View>
          </View>
          <View className='score-shily'>
            <ShilyAvatar status='happy' size='small' />
          </View>
        </GlassCard>

        <GlassCard className='nutrition-card'>
          <View className='section-head'>
            <Text className='card-title'>{rangeMeta.label}营养摄入</Text>
            <Text className='card-subtitle'>{timeRange === 'day' ? '看趋势就好，不用盯得太紧' : `来自最近 ${rangeDays} 天的真实记录`}</Text>
          </View>
          {nutritionData.map((item) => (
            <View key={item.label} className='nutrition-row'>
              <View className='nutrition-head'>
                <Text className='nutrition-label'>{item.label}</Text>
                <View className='nutrition-value-row'>
                  <Text className='nutrition-value'>{item.value}</Text>
                  <Text className='nutrition-target'> /{item.target}</Text>
                </View>
              </View>
              <View className='progress-bg'>
                <View
                  className={`progress-fill progress-fill--${item.tone}`}
                  style={{ width: item.progress }}
                />
              </View>
            </View>
          ))}
        </GlassCard>

        <GlassCard className='habit-section'>
          <View className='section-head'>
            <Text className='card-title'>{rangeMeta.label}数据质量</Text>
            <Text className='card-subtitle'>让 Shily 知道哪些判断更可靠</Text>
          </View>
          <View className='habit-grid'>
            {dataQuality.map((item) => (
              <MetricCard
                key={item.label}
                label={item.label}
                value={item.value}
                note={item.note}
                tone={item.tone}
                icon={item.icon}
                className='habit-metric'
              />
            ))}
          </View>
        </GlassCard>
      </View>

      <BottomTabBar />
    </View>
  )
}
