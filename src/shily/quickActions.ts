import type { ShilyDailyState } from './dailyState'
import type { DailyInput } from './types'

type ShilyChatMood = 'normal' | 'happy' | 'tired' | 'puffy' | 'low_energy' | 'stressed'
export type DynamicQuickActionType = 'food' | 'decision' | 'emotion' | 'rest' | 'move'

export interface DynamicQuickAction {
  label: string
  type: DynamicQuickActionType
  priority: number
}

export type ShilyTimeOfDay = 'morning' | 'work' | 'lunch' | 'afternoon' | 'evening' | 'night' | 'late'

export interface DynamicQuickActionContext {
  now?: Date
  mood?: ShilyChatMood
  dailyInput?: Pick<DailyInput, 'proteinG' | 'proteinTargetG' | 'waterMl' | 'waterTargetMl' | 'sleepHours'>
  dailyState?: Pick<ShilyDailyState, 'mealCount' | 'waterRecorded' | 'sleepRecorded' | 'stepsEstimated'>
}

const defaultQuickActions = ['今天吃啥', '现在先干嘛']

function getTimeOfDay(now = new Date()): ShilyTimeOfDay {
  const hour = now.getHours() + now.getMinutes() / 60

  if (hour >= 6 && hour < 9) return 'morning'
  if (hour >= 9 && hour < 11.5) return 'work'
  if (hour >= 11.5 && hour < 14) return 'lunch'
  if (hour >= 14 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 20) return 'evening'
  if (hour >= 20 && hour < 23) return 'night'
  return 'late'
}

function pushAction(actions: DynamicQuickAction[], label: string, type: DynamicQuickActionType, priority: number) {
  if (actions.some((item) => item.label === label)) return
  actions.push({ label, type, priority })
}

export function getDynamicQuickActionMeta(ctx: DynamicQuickActionContext = {}): {
  timeOfDay: ShilyTimeOfDay
  proteinGap: number
  waterGapCups: number
  sleepDebt: boolean
} {
  const dailyInput = ctx.dailyInput
  const proteinGap = Math.max(0, Math.round((dailyInput?.proteinTargetG || 0) - (dailyInput?.proteinG || 0)))
  const waterGapCups = Math.max(0, Math.round(((dailyInput?.waterTargetMl || 0) - (dailyInput?.waterMl || 0)) / 250))
  const sleepDebt = Boolean(dailyInput?.sleepHours && dailyInput.sleepHours < 6.5)

  return {
    timeOfDay: getTimeOfDay(ctx.now),
    proteinGap,
    waterGapCups,
    sleepDebt,
  }
}

export function generateDynamicQuickActions(ctx: DynamicQuickActionContext = {}): string[] {
  const actions: DynamicQuickAction[] = []
  const mood = ctx.mood || 'normal'
  const { timeOfDay, proteinGap, waterGapCups, sleepDebt } = getDynamicQuickActionMeta(ctx)
  const mealCount = ctx.dailyState?.mealCount || 0

  if (timeOfDay === 'morning') {
    pushAction(actions, '早上吃啥', 'food', 10)
    pushAction(actions, '便利店买什么', 'food', 8)
    if (sleepDebt || mood === 'tired' || mood === 'low_energy') {
      pushAction(actions, '我现在好困', 'food', 12)
      pushAction(actions, '咖啡能喝吗', 'food', 11)
    }
  }

  if (timeOfDay === 'work') {
    pushAction(actions, '今天吃啥', 'food', 10)
    pushAction(actions, '午饭怎么定', 'food', 9)
    pushAction(actions, '喝点什么', 'food', 8)
    if (mood === 'stressed') {
      pushAction(actions, '先吃点啥', 'food', 12)
      pushAction(actions, '今天别乱吃', 'food', 11)
    }
  }

  if (timeOfDay === 'lunch') {
    pushAction(actions, '午饭吃啥', 'food', mealCount ? 8 : 11)
    pushAction(actions, '外卖怎么点', 'food', 10)
    if (proteinGap > 20) pushAction(actions, '加个鸡蛋行吗', 'food', 12)
    if (mood === 'low_energy' || mood === 'tired') {
      pushAction(actions, '今天吃点热的', 'food', 13)
      pushAction(actions, '现在吃点啥', 'food', 12)
    }
  }

  if (timeOfDay === 'afternoon') {
    pushAction(actions, '下午吃点啥', 'food', mood === 'tired' || mood === 'low_energy' ? 12 : 10)
    pushAction(actions, '晚饭怎么定', 'food', 9)
    pushAction(actions, '我现在好困', 'food', 8)
    if (mood === 'stressed') {
      pushAction(actions, '先吃点啥', 'food', 13)
      pushAction(actions, '今天别乱吃', 'food', 12)
    }
  }

  if (timeOfDay === 'evening') {
    pushAction(actions, '晚上吃啥不撑', 'food', 11)
    pushAction(actions, '今天别乱吃', 'food', 9)
    pushAction(actions, '现在去散步吗', 'move', 7)
    if (mood === 'puffy') {
      pushAction(actions, '晚上吃啥不撑', 'food', 13)
      if (waterGapCups > 0) pushAction(actions, '先喝杯水吗', 'food', 12)
    }
  }

  if (timeOfDay === 'night') {
    pushAction(actions, '今天还要管吗', 'food', 10)
    pushAction(actions, '今晚还吃东西吗', 'food', 9)
    pushAction(actions, '明早吃啥', 'food', 8)
    if (mood === 'low_energy' || mood === 'tired') {
      pushAction(actions, '吃不下怎么办', 'food', 12)
      pushAction(actions, '今晚吃点热的吗', 'food', 11)
    }
    if (mood === 'stressed') {
      pushAction(actions, '今天别乱吃', 'food', 13)
      pushAction(actions, '先吃点啥', 'food', 12)
    }
  }

  if (timeOfDay === 'late') {
    pushAction(actions, '睡前还能吃什么', 'food', 12)
    pushAction(actions, '现在先干嘛', 'rest', 11)
    pushAction(actions, '睡前还能吃什么', 'food', 8)
    if (sleepDebt || mood === 'tired' || mood === 'low_energy') {
      pushAction(actions, '先简单点吧', 'food', 13)
      pushAction(actions, '现在先干嘛', 'rest', 12)
    }
  }

  if (mood === 'happy') {
    pushAction(actions, '今天还要管吗', 'food', 13)
    pushAction(actions, '明天怎么继续', 'food', 12)
  }
  if (mood === 'tired') {
    pushAction(actions, '我现在好困', 'food', 14)
    pushAction(actions, '晚饭怎么省事', 'food', 13)
  }
  if (mood === 'stressed') {
    pushAction(actions, '先吃点啥', 'food', 14)
    pushAction(actions, '今天别乱吃', 'food', 13)
  }
  if (mood === 'puffy') {
    pushAction(actions, '今天别太咸', 'food', 14)
    if (waterGapCups > 0) pushAction(actions, '先喝杯水吗', 'food', 13)
  }

  return actions
    .sort((a, b) => b.priority - a.priority)
    .map((item) => item.label)
    .slice(0, 2)
    .concat(defaultQuickActions)
    .slice(0, 2)
}

export { defaultQuickActions }
