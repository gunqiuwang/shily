
import Taro from '@tarojs/taro'

export type MealType = '早餐' | '午餐' | '加餐' | '晚餐'

export interface ShilyMealRecord {
  id: string
  mealType: MealType
  sourceText: string
  calories: number
  proteinG: number
  carbG: number
  fatG: number
  source?: 'hunyuan' | 'fallback' | 'manual' | 'protein'
  createdAt: number
}

interface LegacyMealRecord {
  mealType?: MealType
  sourceText?: string
  calories?: number
  proteinG?: number
  carbG?: number
  fatG?: number
  createdAt?: number
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export function getTodayDateKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function getTodayMealRecordsKey(date = new Date()) {
  return `shilyMealRecords:${getTodayDateKey(date)}`
}

export function getDateRange(days: number, endDate = new Date()) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(endDate)
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - (days - 1 - index))
    return date
  })
}

function isToday(timestamp?: number) {
  if (!timestamp) return false
  return getTodayDateKey(new Date(timestamp)) === getTodayDateKey()
}

function normalizeLegacyMeal(value: LegacyMealRecord | '' | null, source: 'manual' | 'protein'): ShilyMealRecord | null {
  if (!value || !isToday(value.createdAt)) return null
  const calories = Math.round(Number(value.calories || 0))
  const proteinG = Math.round(Number(value.proteinG || 0))
  const carbG = Math.round(Number(value.carbG || 0))
  const fatG = Math.round(Number(value.fatG || 0))
  if (calories <= 0 && proteinG <= 0 && carbG <= 0 && fatG <= 0) return null

  return {
    id: `${source}-${value.createdAt}`,
    mealType: value.mealType || '午餐',
    sourceText: value.sourceText || (source === 'protein' ? '补蛋白餐' : '手动记录'),
    calories,
    proteinG,
    carbG,
    fatG,
    source,
    createdAt: value.createdAt || Date.now(),
  }
}

export function readMealRecordsForDate(date = new Date()): ShilyMealRecord[] {
  const stored = Taro.getStorageSync<ShilyMealRecord[] | ''>(getTodayMealRecordsKey(date)) || []
  const shouldReadLegacy = getTodayDateKey(date) === getTodayDateKey()
  const legacyManual = shouldReadLegacy ? normalizeLegacyMeal(Taro.getStorageSync<LegacyMealRecord | ''>('shilyManualMealRecord'), 'manual') : null
  const legacyProtein = shouldReadLegacy ? normalizeLegacyMeal(Taro.getStorageSync<LegacyMealRecord | ''>('shilyProteinMealRecord'), 'protein') : null
  const byId = new Map<string, ShilyMealRecord>()

  stored.forEach((record) => {
    if (record?.id) byId.set(record.id, record)
  })
  ;[legacyManual, legacyProtein].forEach((record) => {
    if (record) byId.set(record.id, record)
  })

  return Array.from(byId.values()).sort((a, b) => a.createdAt - b.createdAt)
}

export function readTodayMealRecords(): ShilyMealRecord[] {
  return readMealRecordsForDate()
}

export function readMealRecordsInRange(days: number, endDate = new Date()) {
  return getDateRange(days, endDate).flatMap((date) => readMealRecordsForDate(date))
}

export function appendTodayMealRecord(record: Omit<ShilyMealRecord, 'id' | 'createdAt'>) {
  const nextRecord: ShilyMealRecord = {
    ...record,
    id: `meal-${Date.now()}`,
    createdAt: Date.now(),
  }
  const records = [...readTodayMealRecords(), nextRecord]
  Taro.setStorageSync(getTodayMealRecordsKey(), records)
  return nextRecord
}

export function sumMealRecords(records: ShilyMealRecord[]) {
  return records.reduce(
    (sum, meal) => ({
      calories: sum.calories + Math.round(meal.calories || 0),
      proteinG: sum.proteinG + Math.round(meal.proteinG || 0),
      carbG: sum.carbG + Math.round(meal.carbG || 0),
      fatG: sum.fatG + Math.round(meal.fatG || 0),
    }),
    { calories: 0, proteinG: 0, carbG: 0, fatG: 0 },
  )
}
