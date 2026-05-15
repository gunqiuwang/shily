import Taro from '@tarojs/taro'
import { DEFAULT_SHILY_PLAN, ShilyPlanId } from './plans'

export type ShilyGoal =
  | 'fat_loss'
  | 'muscle_gain'
  | 'fasting'
  | 'carb'
  | 'glp1_support'

export type ShilyReminderStrategy = 'gentle' | 'key_only' | 'quiet'
export type ShilyGender = 'female' | 'male' | 'private'
export type ShilyAgeRange = 'under_25' | '25_34' | '35_44' | '45_plus' | 'private'

export interface ShilyProfile {
  nickname: string
  goal: ShilyGoal
  heightCm?: number
  weightKg?: number
  targetWeightKg?: number
  gender?: ShilyGender
  ageRange?: ShilyAgeRange
  activityLevel?: 'light' | 'normal' | 'active'
  preference?: 'takeout' | 'cook' | 'breakfast_light' | 'dinner_late' | 'low_appetite'
  completedAt: number
}

export const defaultProfile: ShilyProfile = {
  nickname: '小禾',
  goal: 'fat_loss',
  completedAt: 0,
}

export const goalOptions: Array<{ id: ShilyGoal; label: string; desc: string; plan: ShilyPlanId }> = [
  { id: 'fat_loss', label: '温和减脂', desc: '按身高体重和周期测算热量，再稳住蛋白、水和记录。', plan: DEFAULT_SHILY_PLAN },
  { id: 'fasting', label: '轻断食', desc: '用进食窗口管理节奏，热量和蛋白仍按目标计算。', plan: 'fasting_14_10' },
  { id: 'carb', label: '控碳 / 生酮', desc: '先管理碳水预算，再配平蛋白、脂肪和总热量。', plan: 'low_carb' },
  { id: 'glp1_support', label: 'GLP-1 药物支持', desc: '按医嘱记录用药节奏，重点保护蛋白、水和舒适感。', plan: 'glp1_unspecified' },
]

export const reminderStrategyOptions: Array<{ id: ShilyReminderStrategy; label: string; desc: string }> = [
  { id: 'gentle', label: '温柔提醒', desc: '水、蛋白、用餐和晚间复盘按节奏出现。' },
  { id: 'key_only', label: '只提醒关键事项', desc: '只保留今天最重要的 2-3 个提醒。' },
  { id: 'quiet', label: '尽量少打扰', desc: '只在晚上保留一次复盘提醒。' },
]

export function readShilyProfile(): ShilyProfile {
  return (Taro.getStorageSync('shilyProfile') as ShilyProfile) || defaultProfile
}

export function hasProfileMetrics(profile: ShilyProfile): boolean {
  return Boolean(profile.heightCm && profile.weightKg)
}
