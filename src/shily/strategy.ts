import Taro from '@tarojs/taro'
import { DEFAULT_SHILY_PLAN, ShilyPlanId, getShilyPlan } from './plans'
import { ShilyGoal } from './profile'

export type FatLossPace = 'soft' | 'steady' | 'focused'
export type MuscleMode = 'twice' | 'three_four' | 'protein_first'
export type FastingWindow = '12_12' | '14_10' | '16_8' | '18_6' | '5_2'
export type CarbMode = 'moderate' | 'keto'
export type Glp1Medication = 'semaglutide' | 'tirzepatide' | 'mazdutide' | 'unknown'
export type Glp1Frequency = 'weekly' | 'custom'
export type RiskLevel = 'normal' | 'caution' | 'high'

export interface ShilyStrategyConfig {
  goal: ShilyGoal
  planId: ShilyPlanId
  cycleWeeks?: 2 | 4 | 8 | 12 | 16
  targetWeightKg?: number
  fatLossPace?: FatLossPace
  muscleMode?: MuscleMode
  fastingWindow?: FastingWindow
  fastingStartTime?: string
  carbMode?: CarbMode
  glp1?: {
    medication: Glp1Medication
    doseText: string
    frequency: Glp1Frequency
    nextDoseDate?: string
  }
}

export interface StrategyOption {
  id: string
  label: string
  desc: string
}

export interface RiskInfo {
  level: RiskLevel
  title: string
  text: string
}

export const defaultStrategyConfig: ShilyStrategyConfig = {
  goal: 'fat_loss',
  planId: DEFAULT_SHILY_PLAN,
  cycleWeeks: 12,
  fatLossPace: 'steady',
}

export const fatLossPaceOptions: Array<StrategyOption & { id: FatLossPace; weeks: 8 | 12 | 16; weightDelta: number }> = [
  { id: 'soft', label: '轻量开始', desc: '小热量缺口，优先建立记录、蛋白和饮水习惯。', weeks: 8, weightDelta: 2 },
  { id: 'steady', label: '稳定推进', desc: '按维持热量减去温和缺口，是多数减脂 App 的默认思路。', weeks: 12, weightDelta: 4 },
  { id: 'focused', label: '更有计划', desc: '周期更长、执行更清楚，但不做极端低热量。', weeks: 16, weightDelta: 6 },
]

export const muscleModeOptions: Array<StrategyOption & { id: MuscleMode; weeks: 8 | 12 }> = [
  { id: 'twice', label: '每周 2 次训练', desc: '适合刚开始建立训练节奏。', weeks: 8 },
  { id: 'three_four', label: '每周 3-4 次训练', desc: '适合已经有一点训练基础。', weeks: 12 },
  { id: 'protein_first', label: '先补蛋白', desc: '暂时不压训练，只先把饮食稳住。', weeks: 8 },
]

export const fastingWindowOptions: Array<StrategyOption & { id: FastingWindow; planId: ShilyPlanId; weeks: 2 | 4 | 8 }> = [
  { id: '12_12', label: '12:12 轻节律', desc: '12 小时进食窗口，适合作为起步和晚间收尾练习。', planId: 'fasting_12_12', weeks: 2 },
  { id: '14_10', label: '14:10 温和轻断食', desc: '10 小时进食窗口，更适合多数日常场景。', planId: 'fasting_14_10', weeks: 4 },
  { id: '16_8', label: '16:8 标准窗口', desc: '8 小时进食窗口，首页会按时间显示窗口状态。', planId: 'fasting_16_8', weeks: 4 },
  { id: '18_6', label: '18:6 进阶窗口', desc: '更紧，需要更注意舒适度。', planId: 'fasting_18_6', weeks: 2 },
  { id: '5_2', label: '5:2 周节律', desc: '更像周计划，不适合频繁临时切换。', planId: 'fasting_5_2', weeks: 4 },
]

export const carbModeOptions: Array<StrategyOption & { id: CarbMode; planId: ShilyPlanId; weeks: 2 | 4 | 8 }> = [
  { id: 'moderate', label: '温和控碳', desc: '每日碳水目标约 130g，主食减量，蛋白和蔬菜保留。', planId: 'low_carb', weeks: 4 },
  { id: 'keto', label: '生酮模式', desc: '每日碳水目标约 50g，脂肪补足剩余热量。', planId: 'keto_standard', weeks: 2 },
]

export const glp1MedicationOptions: Array<StrategyOption & { id: Glp1Medication }> = [
  { id: 'semaglutide', label: '司美格鲁肽类', desc: '只记录医嘱节奏，建议会偏向少量蛋白、水和舒适感。' },
  { id: 'tirzepatide', label: '替尔泊肽类', desc: '只记录医嘱节奏，关注食欲低、进食不足和胃部反馈。' },
  { id: 'mazdutide', label: '玛仕度肽类', desc: '只记录医嘱节奏，避免给用药剂量判断。' },
  { id: 'unknown', label: '不确定 / 其他', desc: '不强行分类，按医嘱时间和身体反馈记录。' },
]

export const glp1ReferenceText: Record<Glp1Medication, string> = {
  semaglutide: '公开说明书常见为每周一次、从较低剂量逐步递增，成人体重管理维持剂量常见 2.4mg 或 1.7mg。请按医生给你的实际医嘱填写。',
  tirzepatide: '公开说明书常见为每周一次、2.5mg 起始后逐步递增，常见维持剂量包括 5mg、10mg、15mg。请按医生给你的实际医嘱填写。',
  mazdutide: '公开资料显示该类药物用于成人超重/肥胖长期体重管理，剂量和加量节奏请以医生或药品说明书为准。',
  unknown: '如果暂时不确定药物类别，可以先记录你的医嘱剂量、频率和下次用药日。',
}

export function inferPlanId(config: Pick<ShilyStrategyConfig, 'goal' | 'fatLossPace' | 'muscleMode' | 'fastingWindow' | 'fastingStartTime' | 'carbMode' | 'glp1'>): ShilyPlanId {
  if (config.goal === 'muscle_gain') return 'muscle_gain'
  if (config.goal === 'fasting') {
    return fastingWindowOptions.find((item) => item.id === config.fastingWindow)?.planId || 'fasting_14_10'
  }
  if (config.goal === 'carb') {
    return carbModeOptions.find((item) => item.id === config.carbMode)?.planId || 'low_carb'
  }
  if (config.goal === 'glp1_support') {
    const medication = config.glp1?.medication
    if (medication === 'semaglutide') return 'glp1_semaglutide'
    if (medication === 'tirzepatide') return 'glp1_tirzepatide'
    if (medication === 'mazdutide') return 'glp1_mazdutide'
    return 'glp1_unspecified'
  }
  return 'fat_loss'
}

export function readShilyStrategy(): ShilyStrategyConfig {
  return (Taro.getStorageSync('shilyStrategy') as ShilyStrategyConfig) || defaultStrategyConfig
}

export function getRiskInfo(config: ShilyStrategyConfig): RiskInfo {
  if (config.goal === 'glp1_support') {
    return {
      level: 'high',
      title: 'GLP-1 模式按医嘱记录',
      text: 'Shily 只辅助饮食、蛋白、水分和舒适感记录，不判断剂量、加量、减量、换药或副作用。',
    }
  }

  if (config.goal === 'carb' && config.carbMode === 'keto') {
    return {
      level: 'caution',
      title: '生酮模式更看重边界',
      text: 'Shily 会按低碳水目标展示数据，不提供医疗级配方。有基础疾病或持续不适时请咨询医生。',
    }
  }

  if (config.goal === 'fasting' && (config.fastingWindow === '18_6' || config.fastingWindow === '5_2')) {
    return {
      level: 'caution',
      title: '进食窗口不用硬扛',
      text: '窗口用于安排节奏，不代表越短越好。低血糖、孕期/哺乳期或进食障碍风险人群应先咨询医生。',
    }
  }

  return {
    level: 'normal',
    title: 'Shily 会按温和节奏陪你',
    text: '这些设置用于计算首页目标和调整 Shily 回复。',
  }
}

export function getStrategySummary(config: ShilyStrategyConfig): string {
  const plan = getShilyPlan(config.planId)
  if (config.goal === 'fat_loss') return `${plan.title} · ${config.cycleWeeks || 12} 周`
  if (config.goal === 'muscle_gain') return `${plan.title} · ${config.cycleWeeks || 8} 周`
  if (config.goal === 'fasting') return `${plan.title} · ${config.fastingStartTime || '10:00'} 开始`
  if (config.goal === 'carb') return `${plan.title} · ${config.cycleWeeks || 4} 周`
  if (config.goal === 'glp1_support') return `${plan.title} · ${config.glp1?.frequency === 'weekly' ? '每周提醒' : '按医嘱提醒'}`
  return plan.title
}
