import { DailyInput } from './types'
import { getDefaultDailyInput } from './visualCalculator'

export function getMockDailyInput(): DailyInput {
  return getDefaultDailyInput()
}

// 不同状态的 Mock 数据用于测试
export const MOCK_STATES: Record<string, DailyInput> = {
  balanced: {
    waterMl: 1500,
    waterTargetMl: 2000,
    proteinG: 68,
    proteinTargetG: 90,
    carbG: 180,
    carbTargetG: 200,
    calories: 1650,
    calorieTarget: 2000,
    steps: 6320,
    stepTarget: 10000,
    sleepHours: 7.5,
    moodLevel: 4,
    stressLevel: 2
  },
  clear: {
    waterMl: 1900,
    waterTargetMl: 2000,
    proteinG: 85,
    proteinTargetG: 90,
    carbG: 190,
    carbTargetG: 200,
    calories: 1950,
    calorieTarget: 2000,
    steps: 9800,
    stepTarget: 10000,
    sleepHours: 8,
    moodLevel: 5,
    stressLevel: 1
  },
  tired: {
    waterMl: 800,
    waterTargetMl: 2000,
    proteinG: 45,
    proteinTargetG: 90,
    carbG: 150,
    carbTargetG: 200,
    calories: 1200,
    calorieTarget: 2000,
    steps: 3000,
    stepTarget: 10000,
    sleepHours: 5.5,
    moodLevel: 2,
    stressLevel: 3
  },
  puffy: {
    waterMl: 1200,
    waterTargetMl: 2000,
    proteinG: 60,
    proteinTargetG: 90,
    carbG: 280,
    carbTargetG: 200,
    calories: 2400,
    calorieTarget: 2000,
    steps: 4000,
    stepTarget: 10000,
    sleepHours: 7,
    moodLevel: 3,
    stressLevel: 2
  },
  low_energy: {
    waterMl: 600,
    waterTargetMl: 2000,
    proteinG: 30,
    proteinTargetG: 90,
    carbG: 100,
    carbTargetG: 200,
    calories: 900,
    calorieTarget: 2000,
    steps: 2000,
    stepTarget: 10000,
    sleepHours: 5,
    moodLevel: 2,
    stressLevel: 4
  },
  stressed: {
    waterMl: 1000,
    waterTargetMl: 2000,
    proteinG: 55,
    proteinTargetG: 90,
    carbG: 220,
    carbTargetG: 200,
    calories: 2100,
    calorieTarget: 2000,
    steps: 5000,
    stepTarget: 10000,
    sleepHours: 6,
    moodLevel: 2,
    stressLevel: 5
  }
}
