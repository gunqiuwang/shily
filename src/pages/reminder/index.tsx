import { View, Text, Switch } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { colors } from '../../styles/tokens'
import GlassCard from '../../components/GlassCard'
import BottomTabBar from '../../components/BottomTabBar'
import CustomNavBar from '../../components/CustomNavBar'
import AppIcon, { AppIconName } from '../../components/AppIcon'
import { DEFAULT_SHILY_PLAN, ShilyPlanId } from '../../shily/plans'
import { ShilyReminderStrategy, reminderStrategyOptions } from '../../shily/profile'
import './index.scss'

type ReminderItem = {
  id: number
  icon: AppIconName
  label: string
  desc: string
  enabled: boolean
}

const reminders: ReminderItem[] = [
  { id: 1, icon: 'droplet', label: '喝水提醒', desc: '每 2 小时提醒一次', enabled: true },
  { id: 2, icon: 'clock', label: '用餐提醒', desc: '早 8:00 / 午 12:30 / 晚 18:30', enabled: true },
  { id: 3, icon: 'activity', label: '活动提醒', desc: '每天 19:00', enabled: false },
  { id: 4, icon: 'notebook', label: '记录提醒', desc: '每天 21:00', enabled: true },
  { id: 5, icon: 'moon', label: '睡眠提醒', desc: '每天 22:30', enabled: false },
]

function getPlanReminders(planId: ShilyPlanId): ReminderItem[] | null {
  if (planId.startsWith('glp1_')) {
    return [
      { id: 10, icon: 'bell', label: '用药提醒', desc: '按你记录的医嘱时间提醒', enabled: true },
      { id: 11, icon: 'egg', label: '少量蛋白提醒', desc: '午餐前，先照顾一小份容易入口的蛋白', enabled: true },
      { id: 12, icon: 'droplet', label: '温和补水', desc: '下午提醒一次，不一次喝太多', enabled: true },
      { id: 13, icon: 'notebook', label: '用药后舒适感记录', desc: '记录食欲、胃部和精力变化', enabled: true },
    ]
  }

  if (planId.startsWith('fasting_')) {
    return [
      { id: 21, icon: 'clock', label: '进食窗口提醒', desc: '窗口开始前提醒，不硬卡', enabled: true },
      { id: 22, icon: 'egg', label: '窗口内补营养', desc: '优先蛋白和蔬菜，不追求复杂', enabled: true },
      { id: 23, icon: 'moon', label: '结束窗口', desc: '睡前放慢一点，别临时加餐', enabled: false },
    ]
  }

  if (planId === 'keto_standard' || planId === 'low_carb') {
    return [
      { id: 31, icon: 'egg', label: '低碳餐提醒', desc: '下一餐先稳住蛋白和蔬菜', enabled: true },
      { id: 32, icon: 'droplet', label: '补水提醒', desc: '下午提醒一次', enabled: true },
      { id: 33, icon: 'notebook', label: '晚间复盘', desc: '看看今天碳水节奏，不用苛责', enabled: true },
    ]
  }

  if (planId === 'muscle_gain') {
    return [
      { id: 41, icon: 'egg', label: '蛋白与恢复', desc: '训练日前后提醒补一份蛋白', enabled: true },
      { id: 42, icon: 'activity', label: '训练日记录', desc: '按你的训练安排记录完成情况', enabled: true },
      { id: 43, icon: 'moon', label: '恢复提醒', desc: '睡前提醒休息和拉伸', enabled: false },
    ]
  }

  if (planId === 'fat_loss') {
    return [
      { id: 51, icon: 'egg', label: '蛋白提醒', desc: '午餐前提醒一小份蛋白', enabled: true },
      { id: 52, icon: 'droplet', label: '喝水提醒', desc: '下午提醒一次', enabled: true },
      { id: 53, icon: 'notebook', label: '晚间复盘', desc: '每天 21:00 看一眼今天节奏', enabled: true },
    ]
  }

  return null
}

function getStrategyReminders(strategy: ShilyReminderStrategy, planId: ShilyPlanId): ReminderItem[] {
  const planReminders = getPlanReminders(planId)
  if (planReminders) return planReminders

  if (strategy === 'quiet') {
    return [
      { id: 4, icon: 'notebook', label: '晚间复盘', desc: '每天 21:30，只提醒一次', enabled: true },
      { id: 5, icon: 'moon', label: '睡前放慢一点', desc: '每天 22:30，可关闭', enabled: false },
    ]
  }

  if (strategy === 'key_only') {
    return [
      { id: 1, icon: 'droplet', label: '喝水提醒', desc: '下午提醒一次', enabled: true },
      { id: 2, icon: 'clock', label: '关键用餐提醒', desc: '午餐 / 晚餐前提醒', enabled: true },
      { id: 4, icon: 'notebook', label: '晚间记录提醒', desc: '每天 21:00', enabled: true },
    ]
  }

  return reminders
}

function mergeReminderOverrides(list: ReminderItem[]) {
  const overrides = (Taro.getStorageSync('shilyReminderOverrides') as Record<string, boolean>) || {}
  return list.map((item) => ({
    ...item,
    enabled: overrides[String(item.id)] ?? item.enabled,
  }))
}

export default function Reminder() {
  const [strategy, setStrategy] = useState<ShilyReminderStrategy>('gentle')
  const [planId, setPlanId] = useState<ShilyPlanId>(DEFAULT_SHILY_PLAN)
  const [reminderList, setReminderList] = useState(reminders)

  useDidShow(() => {
    const nextStrategy = (Taro.getStorageSync('shilyReminderStrategy') as ShilyReminderStrategy) || 'gentle'
    const nextPlan = (Taro.getStorageSync('shilyPlan') as ShilyPlanId) || DEFAULT_SHILY_PLAN
    setStrategy(nextStrategy)
    setPlanId(nextPlan)
    setReminderList(mergeReminderOverrides(getStrategyReminders(nextStrategy, nextPlan)))
  })

  const toggleReminder = (id: number) => {
    setReminderList((list) => {
      const nextList = list.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
      const overrides = nextList.reduce<Record<string, boolean>>((result, item) => {
        result[String(item.id)] = item.enabled
        return result
      }, {})
      Taro.setStorageSync('shilyReminderOverrides', overrides)
      return nextList
    })
  }

  const enabledCount = reminderList.filter((item) => item.enabled).length
  const disabledCount = reminderList.length - enabledCount

  return (
    <View className='page reminder-page'>
      <CustomNavBar title='首页提醒' showBack onBack={() => wx.navigateBack()} />

      <View className='page-content'>
        <GlassCard className='strategy-card' variant='tint' onClick={() => Taro.navigateTo({ url: '/pages/onboarding/index' })}>
          <Text className='strategy-label'>首页信息密度</Text>
          <Text className='strategy-title'>{reminderStrategyOptions.find((item) => item.id === strategy)?.label}</Text>
          <Text className='strategy-desc'>
            {getPlanReminders(planId)
              ? '这里控制首页执行面板保留哪些提醒。微信系统通知接入后，再开放正式通知。'
              : `${reminderStrategyOptions.find((item) => item.id === strategy)?.desc}，并同步影响首页执行面板。`}
          </Text>
        </GlassCard>

        <View className='reminder-list'>
          {reminderList.map((item) => (
            <GlassCard key={item.id} className='reminder-item'>
              <View className='reminder-left'>
                <View className='reminder-icon'>
                  <AppIcon name={item.icon} size={28} tone='deep' strokeWidth={2} />
                </View>
                <View className='reminder-info'>
                  <Text className='reminder-label'>{item.label}</Text>
                  <Text className='reminder-desc'>{item.desc}</Text>
                </View>
              </View>
              <Switch
                checked={item.enabled}
                onChange={() => toggleReminder(item.id)}
                color={colors.primary}
              />
            </GlassCard>
          ))}
        </View>

        <Text className='section-title'>首页显示概览</Text>
        <GlassCard className='history-list'>
          <View className='history-item'>
            <View className='history-left'>
              <View className='history-dot done' />
              <Text className='history-time'>{enabledCount} 项开启</Text>
              <Text className='history-title'>Shily 只保留当前方案相关提醒</Text>
            </View>
            <Text className='history-status done'>生效中</Text>
          </View>
          <View className='history-item'>
            <View className='history-left'>
              <View className='history-dot' />
              <Text className='history-time'>{disabledCount} 项关闭</Text>
              <Text className='history-title'>可随时恢复，不影响今日记录</Text>
            </View>
            <Text className='history-status'>已静音</Text>
          </View>
        </GlassCard>
      </View>

      <BottomTabBar />
    </View>
  )
}
