import Taro from '@tarojs/taro'
import { getDateRange, getTodayDateKey } from './mealRecords'

export interface MoodRecord {
  value?: string
  note?: string
  source?: string
  createdAt?: number
}

export interface MovementRecord {
  label?: string
  createdAt?: number
}

function key(name: string, date = new Date()) {
  return `${name}:${getTodayDateKey(date)}`
}

function isToday(date = new Date()) {
  return getTodayDateKey(date) === getTodayDateKey()
}

export function readWaterCups(date = new Date()) {
  const dated = Number(Taro.getStorageSync(key('shilyWaterCups', date)) || 0)
  if (dated || !isToday(date)) return dated
  return Number(Taro.getStorageSync('shilyWaterCups') || 0)
}

export function writeWaterCups(value: number, date = new Date()) {
  const next = Math.max(0, Math.min(12, Math.round(value)))
  Taro.setStorageSync(key('shilyWaterCups', date), next)
  if (isToday(date)) Taro.setStorageSync('shilyWaterCups', next)
  return next
}

export function readSteps(date = new Date()) {
  const dated = Number(Taro.getStorageSync(key('shilySteps', date)) || 0)
  if (dated || !isToday(date)) return dated
  return Number(Taro.getStorageSync('shilySteps') || 0)
}

export function writeSteps(value: number, date = new Date()) {
  const next = Math.max(0, Math.round(value))
  Taro.setStorageSync(key('shilySteps', date), next)
  if (isToday(date)) Taro.setStorageSync('shilySteps', next)
  return next
}

export function readMoodRecord(date = new Date()): MoodRecord | null {
  const dated = Taro.getStorageSync<MoodRecord | ''>(key('shilyMoodNote', date)) || null
  if (dated || !isToday(date)) return dated
  return Taro.getStorageSync<MoodRecord | ''>('shilyMoodNote') || null
}

export function writeMoodRecord(record: MoodRecord, date = new Date()) {
  const next = {
    ...record,
    createdAt: record.createdAt || Date.now(),
  }
  Taro.setStorageSync(key('shilyMoodNote', date), next)
  if (isToday(date)) Taro.setStorageSync('shilyMoodNote', next)
  return next
}

export function readMovementRecord(date = new Date()): MovementRecord | null {
  const dated = Taro.getStorageSync<MovementRecord | ''>(key('shilyMovementLog', date)) || null
  if (dated || !isToday(date)) return dated
  return Taro.getStorageSync<MovementRecord | ''>('shilyMovementLog') || null
}

export function writeMovementRecord(record: MovementRecord, date = new Date()) {
  const next = {
    ...record,
    createdAt: record.createdAt || Date.now(),
  }
  Taro.setStorageSync(key('shilyMovementLog', date), next)
  if (isToday(date)) Taro.setStorageSync('shilyMovementLog', next)
  return next
}

export function readSleepHours(date = new Date()) {
  const dated = Number(Taro.getStorageSync(key('shilySleepHours', date)) || 0)
  if (dated || !isToday(date)) return dated
  return Number(Taro.getStorageSync('shilySleepHours') || 0)
}

export function readMetricRange(days: number, endDate = new Date()) {
  const dates = getDateRange(days, endDate)
  const waterCups = dates.reduce((sum, date) => sum + readWaterCups(date), 0)
  const steps = dates.reduce((sum, date) => sum + readSteps(date), 0)
  const sleepDays = dates.filter((date) => readSleepHours(date) > 0).length
  const waterDays = dates.filter((date) => readWaterCups(date) > 0).length
  const stepDays = dates.filter((date) => readSteps(date) > 0).length
  const moodDays = dates.filter((date) => readMoodRecord(date)).length

  return {
    days,
    waterCups,
    steps,
    sleepDays,
    waterDays,
    stepDays,
    moodDays,
  }
}
