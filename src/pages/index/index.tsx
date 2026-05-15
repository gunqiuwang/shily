import { Image, View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useMemo, useState } from 'react'
import BottomTabBar from '../../components/BottomTabBar'
import CustomNavBar from '../../components/CustomNavBar'
import GlassCard from '../../components/GlassCard'
import PrimaryButton from '../../components/PrimaryButton'
import AppIcon from '../../components/AppIcon'
import { ShilyActionType, getTodayAction } from '../../shily/actions'
import { ShilyTargets, buildDailyInput, calculateTargets } from '../../shily/calculations'
import { readMoodRecord, readMovementRecord, readSteps, readWaterCups, writeMoodRecord, writeMovementRecord, writeSteps, writeWaterCups } from '../../shily/dailyMetrics'
import { ShilyDailyState, readShilyDailyState, readTodayCompletedActionsKey } from '../../shily/dailyState'
import { DEFAULT_SHILY_PLAN, ShilyPlanId, getShilyPlan } from '../../shily/plans'
import { ShilyProfile, defaultProfile, readShilyProfile } from '../../shily/profile'
import { ShilyStrategyConfig, defaultStrategyConfig, readShilyStrategy } from '../../shily/strategy'
import { DailyInput } from '../../shily/types'
import { uiAssets } from '../../shily/uiAssets'
import './index.scss'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 6) return '凌晨好'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  if (hour < 22) return '晚上好'
  return '夜深了'
}

function padTime(value: number): string {
  return String(value).padStart(2, '0')
}

function formatHour(date: Date): string {
  return `${padTime(date.getHours())}:${padTime(date.getMinutes())}`
}

function addHoursFromNow(hours: number): string {
  const next = new Date()
  next.setMinutes(0, 0, 0)
  next.setHours(next.getHours() + Math.ceil(hours))
  return formatHour(next)
}

function addHoursToClock(time: string, hours: number): string {
  const [rawHour = '10', rawMinute = '00'] = time.split(':')
  const nextHour = ((Number(rawHour) || 10) + hours) % 24
  return `${padTime(nextHour)}:${rawMinute || '00'}`
}

function getFastingWindowHours(planId: ShilyPlanId): number {
  if (planId === 'fasting_18_6') return 6
  if (planId === 'fasting_16_8') return 8
  if (planId === 'fasting_14_10') return 10
  if (planId === 'fasting_12_12') return 12
  return 10
}

function getMealWindowText(planId: ShilyPlanId, strategy?: ShilyStrategyConfig): string {
  if (planId.startsWith('fasting_')) {
    const start = strategy?.fastingStartTime || (planId === 'fasting_16_8' ? '12:00' : planId === 'fasting_12_12' ? '08:00' : '10:00')
    return `${start}-${addHoursToClock(start, getFastingWindowHours(planId))}`
  }
  return '按下一餐安排'
}

function buildHomeReminder(
  input: DailyInput,
  targets: ShilyTargets,
  planId: ShilyPlanId,
  proteinValue: number,
  proteinBoostDone: boolean,
  fallback: { label: string; desc: string },
  strategy?: ShilyStrategyConfig,
) {
  const plan = getShilyPlan(planId)
  const waterCups = Math.round(input.waterMl / 250)
  const waterTargetCups = Math.round(targets.waterTargetMl / 250)
  const waterLeft = Math.max(0, waterTargetCups - waterCups)
  const proteinLeft = Math.max(0, targets.proteinTargetG - proteinValue)
  const fastingLeft = Math.max(0, (input.fastingTargetHours || targets.fastingTargetHours) - (input.fastingHours || 0))

  if (proteinBoostDone) {
    return {
      kicker: 'Shily 已同步',
      title: '刚刚那一餐已经补上了',
      desc: '今天先保持记录和喝水，不用再额外加任务。',
      pill: '已完成',
      actionLabel: '继续保持',
    }
  }

  if (plan.group === 'fasting') {
    const windowText = getMealWindowText(planId, strategy)
    if (fastingLeft > 0) {
      return {
        kicker: `${plan.title} · 进食窗口`,
        title: `距离进食窗口还差 ${fastingLeft} 小时`,
        desc: `今天窗口 ${windowText}。现在先补水，到窗口后先安排一份蛋白。`,
        pill: `还差 ${fastingLeft}h`,
        actionLabel: '记录窗口',
      }
    }

    return {
      kicker: `${plan.title} · 可以进食`,
      title: `现在在 ${windowText} 窗口内`,
      desc: '先吃一份蛋白，再配一点主食和蔬菜；不用把第一餐吃得太重。',
      pill: '可进食',
      actionLabel: '安排第一餐',
    }
  }

  if (plan.group === 'glp1') {
    return {
      kicker: 'GLP-1 饮食支持',
      title: proteinLeft > 0 ? `蛋白还差 ${proteinLeft}g` : '今天先保住舒适感',
      desc: waterLeft > 0
        ? `先喝一杯水，再补一小份鸡蛋、牛奶或豆腐；吃不下不用硬撑。`
        : '水分已经不错，下一餐优先少量蛋白和容易入口的食物。',
      pill: waterLeft > 0 ? '该喝水' : '少量蛋白',
      actionLabel: proteinLeft > 0 ? '吃不下怎么补' : '下一餐怎么吃',
    }
  }

  if (waterLeft >= 2) {
    return {
      kicker: '今日饮水提醒',
      title: `今天还差 ${waterLeft} 杯水`,
      desc: '现在先喝一杯，喝完首页会同步记录；水分够了，后面的建议会更可靠。',
      pill: '该喝水',
      actionLabel: '喝一杯水',
    }
  }

  if (proteinLeft >= 15) {
    return {
      kicker: `${plan.title} · 下一餐重点`,
      title: `蛋白还差 ${proteinLeft}g`,
      desc: '下一餐补一份鸡蛋、牛奶、豆腐或鱼肉，不用把这一餐做复杂。',
      pill: '补蛋白',
      actionLabel: '补一点蛋白',
    }
  }

  if (plan.group === 'carb') {
    return {
      kicker: `${plan.title} · 碳水节奏`,
      title: '下一餐主食少一点',
      desc: '先保留蛋白和蔬菜，主食半份就够；外卖也按这个顺序选。',
      pill: '控碳',
      actionLabel: '按方案选餐',
    }
  }

  return {
    kicker: `${plan.title} · 今日提醒`,
    title: fallback.label,
    desc: fallback.desc,
    pill: targets.score >= 85 ? '稳定' : '可调整',
    actionLabel: fallback.label,
  }
}

function buildExecutionPanel(input: DailyInput, targets: ShilyTargets, planId: ShilyPlanId, proteinValue: number, strategy?: ShilyStrategyConfig) {
  const plan = getShilyPlan(planId)
  const waterCups = Math.round(input.waterMl / 250)
  const waterTargetCups = Math.round(targets.waterTargetMl / 250)
  const waterLeft = Math.max(0, waterTargetCups - waterCups)
  const proteinLeft = Math.max(0, targets.proteinTargetG - proteinValue)
  const calorieLeft = targets.calorieTarget - Math.round(input.calories)
  const fastingTarget = input.fastingTargetHours || targets.fastingTargetHours
  const fastingNow = input.fastingHours || 0
  const fastingLeft = Math.max(0, fastingTarget - fastingNow)
  const canEatAt = plan.group === 'fasting' && fastingLeft > 0 ? addHoursFromNow(fastingLeft) : '现在'
  const windowDesc = plan.group === 'fasting'
    ? fastingLeft > 0
      ? `${canEatAt} 后进食`
      : getMealWindowText(planId, strategy)
    : getMealWindowText(planId, strategy)

  return [
    {
      key: 'window',
      label: plan.group === 'fasting' ? '进食时间' : '下一餐',
      value: windowDesc,
      note: plan.group === 'fasting' ? `${fastingNow}/${fastingTarget}h 空腹` : plan.actionHint,
      strong: plan.group === 'fasting',
    },
    {
      key: 'calories',
      label: '今日热量',
      value: `${Math.round(input.calories)}/${targets.calorieTarget}kcal`,
      note: calorieLeft >= 0 ? `还可安排约 ${calorieLeft}kcal` : `已超 ${Math.abs(calorieLeft)}kcal，晚餐清淡`,
      strong: calorieLeft < 250,
    },
    {
      key: 'protein',
      label: '蛋白缺口',
      value: proteinLeft > 0 ? `还差 ${proteinLeft}g` : '已达标',
      note: proteinLeft > 0 ? '下一餐补鸡蛋、牛奶、豆腐或鱼肉' : '后面不用硬加蛋白',
      strong: proteinLeft > 0,
    },
    {
      key: 'water',
      label: '饮水提醒',
      value: waterLeft > 0 ? `还差 ${waterLeft}杯` : '已达标',
      note: waterLeft > 0 ? '喝完后到记录页更新' : `${waterCups}/${waterTargetCups}杯已完成`,
      strong: waterLeft > 0,
    },
  ]
}

function filterExecutionPanelByReminder(
  panel: ReturnType<typeof buildExecutionPanel>,
  planId: ShilyPlanId,
) {
  const overrides = (Taro.getStorageSync('shilyReminderOverrides') as Record<string, boolean>) || {}
  const hiddenKeys = new Set<string>()

  const hideWhenOff = (id: number, key: string) => {
    if (overrides[String(id)] === false) hiddenKeys.add(key)
  }

  if (planId.startsWith('glp1_')) {
    hideWhenOff(11, 'protein')
    hideWhenOff(12, 'water')
  } else if (planId.startsWith('fasting_')) {
    hideWhenOff(21, 'window')
    hideWhenOff(22, 'protein')
  } else if (planId === 'keto_standard' || planId === 'low_carb') {
    hideWhenOff(31, 'protein')
    hideWhenOff(32, 'water')
  } else if (planId === 'muscle_gain') {
    hideWhenOff(41, 'protein')
  } else if (planId === 'fat_loss') {
    hideWhenOff(51, 'protein')
    hideWhenOff(52, 'water')
  } else {
    hideWhenOff(1, 'water')
    hideWhenOff(2, 'window')
  }

  const filtered = panel.filter((item) => !hiddenKeys.has(item.key))
  return filtered.length >= 2 ? filtered : panel
}

export default function Index() {
  const [greeting] = useState(getGreeting)
  const [proteinDone, setProteinDone] = useState(false)
  const [planId, setPlanId] = useState<ShilyPlanId>(DEFAULT_SHILY_PLAN)
  const [profile, setProfile] = useState<ShilyProfile>(defaultProfile)
  const [strategyConfig, setStrategyConfig] = useState<ShilyStrategyConfig>(defaultStrategyConfig)
  const [completedActions, setCompletedActions] = useState<ShilyActionType[]>([])
  const [dailyState, setDailyState] = useState<ShilyDailyState | null>(null)
  const [movementText, setMovementText] = useState('')
  const [moodText, setMoodText] = useState('')
  const [reminderVersion, setReminderVersion] = useState(0)
  const targets = useMemo(() => calculateTargets(profile, planId, strategyConfig), [profile, planId, strategyConfig])
  const dailyInput = dailyState?.dailyInput || buildDailyInput(profile, planId, strategyConfig)
  const proteinBoostDone = proteinDone && planId === 'fat_loss'
  const todayAction = useMemo(() => getTodayAction(dailyInput, planId, proteinBoostDone, completedActions), [dailyInput, planId, proteinBoostDone, completedActions])
  const proteinValue = proteinBoostDone ? Math.min(targets.proteinTargetG, Math.round(dailyInput.proteinG) + 17) : Math.round(dailyInput.proteinG)
  const proteinProgress = Math.min(100, Math.round((proteinValue / targets.proteinTargetG) * 100))
  const carbProgress = Math.min(100, Math.round((dailyInput.carbG / targets.carbTargetG) * 100))
  const waterCups = Math.round(dailyInput.waterMl / 250)
  const waterTargetCups = Math.round(targets.waterTargetMl / 250)
  const calorieProgress = Math.min(100, Math.round((dailyInput.calories / targets.calorieTarget) * 100))
  const waterProgress = Math.min(100, Math.round((waterCups / waterTargetCups) * 100))
  const proteinLeft = Math.max(0, targets.proteinTargetG - proteinValue)
  const waterLeft = Math.max(0, waterTargetCups - waterCups)
  const homeReminder = useMemo(
    () => buildHomeReminder(dailyInput, targets, planId, proteinValue, proteinBoostDone, todayAction, strategyConfig),
    [dailyInput, targets, planId, proteinValue, proteinBoostDone, todayAction, strategyConfig],
  )
  const executionPanel = useMemo(
    () => filterExecutionPanelByReminder(buildExecutionPanel(dailyInput, targets, planId, proteinValue, strategyConfig), planId),
    [dailyInput, targets, planId, proteinValue, strategyConfig, reminderVersion],
  )
  useDidShow(() => {
    if (!Taro.getStorageSync('shilyOnboardingDone')) {
      Taro.navigateTo({ url: '/pages/onboarding/index' })
      return
    }
    const nextProfile = readShilyProfile()
    const nextStrategy = readShilyStrategy()
    const nextPlan = (Taro.getStorageSync('shilyPlan') as ShilyPlanId) || DEFAULT_SHILY_PLAN
    setProfile(nextProfile)
    setStrategyConfig(nextStrategy)
    setProteinDone(Boolean(Taro.getStorageSync('shilyProteinBoostDone')))
    setPlanId(nextPlan)
    setDailyState(readShilyDailyState(nextProfile, nextPlan, nextStrategy))
    setCompletedActions((Taro.getStorageSync(readTodayCompletedActionsKey()) as ShilyActionType[]) || [])
    const movementLog = readMovementRecord()
    const moodLog = readMoodRecord()
    setMovementText(movementLog ? movementLog.label || '' : '')
    setMoodText(moodLog ? moodLog.note || moodLog.value || '' : '')
    setReminderVersion((value) => value + 1)
  })

  const refreshHomeState = () => {
    setDailyState(readShilyDailyState(profile, planId, strategyConfig))
    setReminderVersion((value) => value + 1)
  }

  const handlePrimaryAction = () => {
    Taro.reLaunch({ url: '/pages/chat/index' })
  }

  const handleRecordAction = () => {
    Taro.navigateTo({ url: '/pages/quick-log/index?mode=manual' })
  }

  const handleQuickCheck = (type: 'water' | 'movement' | 'mood') => {
    if (type === 'water') {
      const options = ['喝了 1 杯', '喝了 2 杯', '今天喝水够了']
      Taro.showActionSheet({
        itemList: options,
        success: ({ tapIndex }) => {
          const current = readWaterCups() || waterCups || 0
          const next = tapIndex === 0
            ? current + 1
            : tapIndex === 1
              ? current + 2
              : Math.max(current, waterTargetCups)
          writeWaterCups(Math.min(12, next))
          Taro.setStorageSync('shilyLastActionFlow', {
            type: 'water',
            option: { title: options[tapIndex] },
            createdAt: Date.now(),
          })
          refreshHomeState()
          Taro.showToast({ title: '喝水已记录', icon: 'none' })
        },
      })
      return
    }

    if (type === 'movement') {
      const options = ['轻走 10 分钟', '散步 20 分钟', '拉伸/家务 10 分钟', '今天先休息']
      const stepMap = [1200, 2500, 800, 0]
      Taro.showActionSheet({
        itemList: options,
        success: ({ tapIndex }) => {
          const label = options[tapIndex]
          const currentSteps = readSteps()
          if (stepMap[tapIndex] > 0) writeSteps(Math.max(currentSteps, stepMap[tapIndex]))
          writeMovementRecord({ label })
          Taro.setStorageSync('shilyLastActionFlow', {
            type: 'movement',
            option: { title: `记录了${label}` },
            createdAt: Date.now(),
          })
          setMovementText(label)
          refreshHomeState()
          Taro.showToast({ title: '运动已记录', icon: 'none' })
        },
      })
      return
    }

    const options = ['开心', '高兴', '还可以', '平静', '有点累', '有点焦虑']
    Taro.showActionSheet({
      itemList: options,
      success: ({ tapIndex }) => {
        const value = options[tapIndex]
        writeMoodRecord({
          value,
          source: 'mood',
        })
        Taro.setStorageSync('shilyLastActionFlow', {
          type: 'mood',
          option: { title: `记录了心情：${value}` },
          createdAt: Date.now(),
        })
        setMoodText(value)
        refreshHomeState()
        Taro.showToast({ title: '心情已记录', icon: 'none' })
      },
    })
  }

  return (
    <View className='page home-page'>
      <CustomNavBar title='' />

      <View className='page-content home-content'>
        <View className='home-header'>
          <Text className='greeting'>{greeting}，{profile.nickname}</Text>
        </View>

        <GlassCard className='hero-card' variant='hero'>
          <View className='hero-copy'>
            <Text className='hero-kicker'>{homeReminder.kicker}</Text>
            <Text className='hero-title'>{homeReminder.title}</Text>
            <Text className='hero-desc'>{homeReminder.desc}</Text>
          </View>

          <View className='hero-status-pill score-pill'>
            <Text>{homeReminder.pill}</Text>
          </View>

          <View className='hero-shily hero-shily-wrap'>
            <Image className='hero-shily-image' src={uiAssets.shily.main} mode='aspectFit' />
          </View>
        </GlassCard>

        <GlassCard className='home-data-card' onClick={() => Taro.navigateTo({ url: '/pages/data/index' })}>
          <View className='home-data-head'>
            <Text className='home-data-title'>今日数据</Text>
            <Text className='home-data-link'>查看详情</Text>
          </View>
          <View className='home-data-grid'>
            {[
              { label: '热量', value: `${Math.round(dailyInput.calories)} / ${targets.calorieTarget}`, progress: calorieProgress, image: uiAssets.feature.nutrition },
              { label: '蛋白', value: `${proteinProgress}%`, progress: proteinProgress, image: uiAssets.feature.meal },
              { label: '碳水', value: `${carbProgress}%`, progress: carbProgress, image: uiAssets.plan.carb },
              { label: '喝水', value: `${waterCups}/${waterTargetCups}杯`, progress: waterProgress, image: uiAssets.feature.water },
            ].map((item, index) => (
              <View className='home-data-item' key={item.label} style={{ '--data-progress': `${item.progress}%`, '--data-delay': `${index * 70}ms` } as any}>
                <View className='home-data-icon'>
                  <Image className='home-data-illustration' src={item.image} mode='aspectFit' />
                </View>
                <Text className='home-data-value'>{item.value}</Text>
                <Text className='home-data-label'>{item.label}</Text>
                <View className='home-data-bar'>
                  <View className='home-data-bar-fill' />
                </View>
              </View>
            ))}
          </View>
        </GlassCard>

        <GlassCard className='execution-card'>
          <View className='execution-head'>
            <Text className='execution-title'>今日执行面板</Text>
            <Text className='execution-desc'>没有通知时，先看这里。</Text>
          </View>

          <View className='execution-grid'>
            {executionPanel.map((item) => (
              <View className={`execution-item ${item.strong ? 'execution-item--strong' : ''}`} key={item.label}>
                <Text className='execution-label'>{item.label}</Text>
                <Text className='execution-value'>{item.value}</Text>
                <Text className='execution-note'>{item.note}</Text>
              </View>
            ))}
          </View>

          <View className='execution-closer'>
            <View className='execution-closer-head'>
              <View className='execution-closer-icon'>
                <AppIcon name='check' size={28} tone='deep' />
              </View>
              <View className='execution-closer-copy'>
                <Text className='execution-closer-title'>顺手记录</Text>
              </View>
            </View>
            <View className='execution-closer-grid'>
              <View className='execution-closer-chip' onClick={() => handleQuickCheck('water')}>
                <View className='execution-closer-chip-icon'>
                  <Image className='execution-closer-chip-image' src={uiAssets.feature.water} mode='aspectFit' />
                </View>
                <Text className='execution-closer-label'>喝水</Text>
                <Text className='execution-closer-value'>{waterLeft > 0 ? `再 ${waterLeft}杯` : '已够'}</Text>
              </View>
              <View className='execution-closer-chip' onClick={() => handleQuickCheck('movement')}>
                <View className='execution-closer-chip-icon'>
                  <Image className='execution-closer-chip-image' src={uiAssets.feature.movement} mode='aspectFit' />
                </View>
                <Text className='execution-closer-label'>运动</Text>
                <Text className='execution-closer-value'>{movementText || (dailyState?.stepsEstimated ? '选一下' : dailyState?.stepsText || '选一下')}</Text>
              </View>
              <View className='execution-closer-chip' onClick={() => handleQuickCheck('mood')}>
                <View className='execution-closer-chip-icon'>
                  <Image className='execution-closer-chip-image' src={uiAssets.feature.mood} mode='aspectFit' />
                </View>
                <Text className='execution-closer-label'>心情</Text>
                <Text className='execution-closer-value'>{moodText || '选一下'}</Text>
              </View>
            </View>
          </View>
        </GlassCard>

        <View className='home-action-wrap'>
          <PrimaryButton
            size='large'
            icon='notebook'
            iconTone='deep'
            onClick={handleRecordAction}
            className='home-action-button home-action-button--record'
            fullWidth={false}
          >
            记录饮食
          </PrimaryButton>
          <PrimaryButton
            size='large'
            icon='cloud'
            onClick={handlePrimaryAction}
            className='home-action-button home-action-button--shily'
            fullWidth={false}
          >
            问 Shily
          </PrimaryButton>
        </View>

      </View>

      <BottomTabBar />
    </View>
  )
}
