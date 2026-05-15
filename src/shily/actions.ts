import { ShilyPlanId } from './plans'
import { DailyInput } from './types'

export type ShilyActionType =
  | 'protein_flow'
  | 'water_quick'
  | 'fasting_window'
  | 'low_carb_meal'
  | 'glp1_small_protein'
  | 'muscle_recovery'
  | 'rest'
  | 'none'

export interface ShilyTodayAction {
  type: ShilyActionType
  label: string
  focus: string
  title: string
  desc: string
  note: string
  progress: number
}

function ratio(value: number, target: number): number {
  if (!target) return 1
  return Math.max(0, Math.min(1, value / target))
}

function completedAction(focus: string, title = '今天这项已经记录') : ShilyTodayAction {
  return {
    type: 'none',
    label: '继续保持就好',
    focus,
    title,
    desc: '刚刚已经记录过，今天不用反复盯着同一件事。',
    note: '已记录',
    progress: 1,
  }
}

export function getTodayAction(
  input: DailyInput,
  planId: ShilyPlanId,
  proteinDone: boolean,
  completedTypes: ShilyActionType[] = [],
): ShilyTodayAction {
  const waterRatio = ratio(input.waterMl, input.waterTargetMl)
  const proteinRatio = ratio(input.proteinG, input.proteinTargetG)
  const fastingRatio = ratio(input.fastingHours || 0, input.fastingTargetHours || 16)
  const carbPressure = input.carbTargetG > 0 ? input.carbG / input.carbTargetG : 1

  if (planId.startsWith('glp1_') && completedTypes.includes('glp1_small_protein')) {
    return completedAction('少量蛋白', '用药后感受已经记下了')
  }

  if (planId.startsWith('glp1_')) {
    return {
      type: 'glp1_small_protein',
      label: '记录感受',
      focus: '少量蛋白',
      title: `少量蛋白 ${Math.round(input.proteinG)}/${input.proteinTargetG}g`,
      desc: '先记录食欲和舒适感，再照顾一点容易入口的蛋白和水分。',
      note: '温和优先',
      progress: proteinRatio,
    }
  }

  if (planId === 'muscle_gain' && completedTypes.includes('muscle_recovery')) {
    return completedAction('蛋白与恢复', '训练和恢复已经记下了')
  }

  if (planId === 'muscle_gain') {
    return {
      type: 'muscle_recovery',
      label: proteinRatio < 0.9 ? '补一份训练蛋白' : '记录一次训练',
      focus: '蛋白与恢复',
      title: `蛋白质 ${Math.round(input.proteinG)}/${input.proteinTargetG}g`,
      desc: proteinRatio < 0.9
        ? '今天先把蛋白补稳，训练日也不用吃得太少。'
        : '蛋白已经够不错了，可以记录一次训练或恢复感受。',
      note: '恢复优先',
      progress: proteinRatio,
    }
  }

  if (planId.startsWith('fasting_') && completedTypes.includes('fasting_window')) {
    return completedAction('进食窗口', '今天的窗口已经稳住了')
  }

  if (planId.startsWith('fasting_')) {
    return {
      type: 'fasting_window',
      label: '稳住进食窗口',
      focus: '进食窗口',
      title: `进食窗口 ${input.fastingHours || 0}/${input.fastingTargetHours || 16}h`,
      desc: '窗口只是辅助，今天先保持舒服，不用硬卡。',
      note: fastingRatio >= 0.8 ? '很稳定' : '调整中',
      progress: fastingRatio,
    }
  }

  if ((planId === 'keto_standard' || planId === 'low_carb') && completedTypes.includes('low_carb_meal')) {
    return completedAction('碳水安排', '今天的控碳选择已经记下了')
  }

  if (planId === 'keto_standard' || planId === 'low_carb') {
    return {
      type: 'low_carb_meal',
      label: '选一份低碳餐',
      focus: '碳水安排',
      title: `碳水 ${input.carbG}/${input.carbTargetG}g`,
      desc: carbPressure > 0.9 ? '下一餐主食少一点，蛋白和蔬菜先稳住。' : '今天碳水安排还可以，继续保持分寸。',
      note: carbPressure > 0.9 ? '轻一点' : '稳定',
      progress: Math.min(1, 1 / Math.max(1, carbPressure)),
    }
  }

  if (!proteinDone && proteinRatio < 0.9) {
    return {
      type: 'protein_flow',
      label: '补蛋白怎么吃',
      focus: '蛋白质',
      title: `蛋白质 ${Math.round(input.proteinG)}/${input.proteinTargetG}g`,
      desc: '午餐不用复杂。还差一小份鸡蛋、牛奶或鱼肉，再加一点蔬菜就很好。',
      note: '今日重点',
      progress: proteinRatio,
    }
  }

  if (waterRatio < 0.85) {
    return {
      type: 'water_quick',
      label: '喝一杯水',
      focus: '饮水',
      title: `饮水 ${Math.round(input.waterMl / 250)}/${Math.round(input.waterTargetMl / 250)}杯`,
      desc: '先喝一杯水，补足今天的基础状态。',
      note: '接近完成',
      progress: waterRatio,
    }
  }

  return {
    type: 'none',
    label: '继续保持就好',
    focus: '状态',
    title: '今天状态挺稳的',
    desc: '不用马上做更多，保持现在这样就很好。',
    note: '稳定',
    progress: 1,
  }
}
