import Taro from '@tarojs/taro'
import { ShilyPlanId } from './plans'
import { ShilyProfile } from './profile'
import { ShilyStrategyConfig } from './strategy'
import { DailyInput } from './types'
import { buildDailyInput, calculateTargets } from './calculations'
import { readTodayMealRecords, sumMealRecords } from './mealRecords'
import { readSleepHours, readSteps, readWaterCups } from './dailyMetrics'

interface StoredMealItem {
  name?: string
  quantity?: number
  unit?: string
  calories?: number
  proteinG?: number
  carbG?: number
  fatG?: number
}

interface StoredMealRecord {
  mealType?: string
  items?: StoredMealItem[]
  calories?: number
  proteinG?: number
  carbG?: number
  fatG?: number
  createdAt?: number
}

interface LastActionFlow {
  type?: string
  option?: {
    title?: string
  }
  note?: string
  createdAt?: number
}

export interface ShilyDailyState {
  dailyInput: DailyInput
  waterCups: number
  waterRecorded: boolean
  mealCount: number
  sleepText: string
  sleepRecorded: boolean
  stepsText: string
  stepsEstimated: boolean
  recordText: string
  companionDays: number
  stableRecordDays: number
  lastActionTitle: string
  weatherLine: string
  weatherCity: string
  weatherDegree: string
  weatherCondition: string
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function getCompanionDays(profile: ShilyProfile) {
  if (!profile.completedAt) return 1
  const elapsed = Date.now() - profile.completedAt
  return Math.max(1, Math.floor(elapsed / 86400000) + 1)
}

function getStableRecordDays(profile: ShilyProfile, mealCount: number) {
  const stored = Number(Taro.getStorageSync('shilyStableRecordDays') || 0)
  if (stored) return stored
  if (!mealCount) return 0
  return Math.min(7, getCompanionDays(profile))
}

function readLastActionTitle() {
  const stored = Taro.getStorageSync<LastActionFlow | ''>('shilyLastActionFlow')
  const lastAction = stored || null
  return lastAction?.option?.title || ''
}

function readWeatherState() {
  const stored = Taro.getStorageSync<{
    city?: string
    degree?: string | number
    condition?: string
  } | ''>('shilyWeather')
  const weather = stored || null

  const city = weather?.city || '当前位置'
  const degree = weather?.degree ? `${weather.degree}` : '--'
  const condition = weather?.condition || '天气待同步'

  return {
    weatherCity: city,
    weatherDegree: degree,
    weatherCondition: condition,
    weatherLine: degree === '--' ? `${city} · ${condition}` : `${city} · ${degree}℃ · ${condition}`,
  }
}

export function readShilyDailyState(
  profile: ShilyProfile,
  planId: ShilyPlanId,
  strategy?: ShilyStrategyConfig,
): ShilyDailyState {
  const targets = calculateTargets(profile, planId, strategy)
  const baseInput = buildDailyInput(profile, planId, strategy)
  const waterCups = readWaterCups()
  const sleepHours = readSleepHours()
  const steps = readSteps()
  const mealRecords = readTodayMealRecords()
  const mealCount = mealRecords.length
  const mealNutrition = sumMealRecords(mealRecords)
  const companionDays = getCompanionDays(profile)
  const stableRecordDays = getStableRecordDays(profile, mealCount)
  const weather = readWeatherState()

  const dailyInput: DailyInput = {
    ...baseInput,
    calories: mealNutrition.calories,
    proteinG: mealNutrition.proteinG,
    carbG: mealNutrition.carbG,
    fatG: mealNutrition.fatG,
    waterMl: waterCups * 250,
    sleepHours: sleepHours || baseInput.sleepHours,
    steps: steps || baseInput.steps,
  }

  return {
    dailyInput,
    waterCups,
    waterRecorded: Boolean(waterCups),
    mealCount,
    sleepText: sleepHours ? `${sleepHours}h` : '未记录',
    sleepRecorded: Boolean(sleepHours),
    stepsText: steps ? `${steps}步` : '手动估算',
    stepsEstimated: !steps,
    recordText: mealCount ? `${mealCount}餐` : '未记录',
    companionDays,
    stableRecordDays,
    lastActionTitle: readLastActionTitle(),
    ...weather,
  }
}

export function readTodayCompletedActionsKey() {
  return `shilyCompletedActions:${todayKey()}`
}
