import { ShilyPlanId } from './plans'
import { ShilyProfile } from './profile'
import { ShilyStrategyConfig } from './strategy'
import { DailyInput } from './types'
import { getDefaultDailyInput } from './visualCalculator'

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export interface ShilyTargets {
  bmi?: number
  weightGapKg?: number
  bmr?: number
  maintenanceCalories?: number
  proteinTargetG: number
  waterTargetMl: number
  calorieTarget: number
  carbTargetG: number
  fatTargetG: number
  fastingTargetHours: number
  score: number
  scoreTitle: string
  scoreDesc: string
}

function getAgeValue(ageRange?: ShilyProfile['ageRange']): number {
  if (ageRange === 'under_25') return 22
  if (ageRange === '35_44') return 39
  if (ageRange === '45_plus') return 48
  return 30
}

function getActivityFactor(activityLevel?: ShilyProfile['activityLevel']): number {
  if (activityLevel === 'active') return 1.5
  if (activityLevel === 'light') return 1.25
  return 1.38
}

function calculateBmr(profile: ShilyProfile, weight: number): number | undefined {
  if (!profile.heightCm) return undefined

  const age = getAgeValue(profile.ageRange)
  const base = 10 * weight + 6.25 * profile.heightCm - 5 * age
  const genderOffset = profile.gender === 'male' ? 5 : -161
  return Math.round(base + genderOffset)
}

function calculateCalorieTarget(
  profile: ShilyProfile,
  weight: number,
  planId: ShilyPlanId,
  strategy?: ShilyStrategyConfig,
): { calorieTarget: number; bmr?: number; maintenanceCalories?: number } {
  const isGlp1 = planId.startsWith('glp1_')
  const isMuscleGain = planId === 'muscle_gain'
  const isFatLossLike = profile.goal === 'fat_loss' || isGlp1
  const fallback = roundTo(weight * (isMuscleGain ? 33 : isFatLossLike ? 27 : 30), 50)
  const bmr = calculateBmr(profile, weight)

  if (!bmr) {
    return {
      calorieTarget: clamp(fallback, isMuscleGain ? 1700 : 1400, isMuscleGain ? 2800 : 2400),
    }
  }

  const maintenanceCalories = roundTo(bmr * getActivityFactor(profile.activityLevel), 50)
  let target = maintenanceCalories

  if (isMuscleGain) {
    target = maintenanceCalories + 150
  } else if (isFatLossLike) {
    const currentWeight = profile.weightKg || weight
    const targetWeight = profile.targetWeightKg || strategy?.targetWeightKg
    const weeks = strategy?.cycleWeeks || (isGlp1 ? 12 : 12)
    const weeklyWeightChange = targetWeight && currentWeight > targetWeight
      ? Math.min(0.6, Math.max(0.2, (currentWeight - targetWeight) / weeks))
      : strategy?.fatLossPace === 'focused'
        ? 0.45
        : strategy?.fatLossPace === 'soft'
          ? 0.25
          : 0.35
    const deficit = Math.round((weeklyWeightChange * 7700) / 7)
    target = maintenanceCalories - deficit

    if (isGlp1) {
      target = Math.max(target, bmr + 120)
    }
  } else if (planId.startsWith('fasting_') || planId === 'low_carb' || planId === 'keto_standard') {
    target = maintenanceCalories - 180
  }

  return {
    bmr,
    maintenanceCalories,
    calorieTarget: clamp(roundTo(target, 50), isMuscleGain ? 1700 : 1300, isMuscleGain ? 3000 : 2300),
  }
}

export function calculateTargets(profile: ShilyProfile, planId: ShilyPlanId, strategy?: ShilyStrategyConfig): ShilyTargets {
  const weight = profile.weightKg || 60
  const heightM = profile.heightCm ? profile.heightCm / 100 : undefined
  const bmi = heightM && weight ? Number((weight / (heightM * heightM)).toFixed(1)) : undefined
  const weightGapKg =
    profile.weightKg && profile.targetWeightKg
      ? Number((profile.weightKg - profile.targetWeightKg).toFixed(1))
      : undefined

  const isGlp1 = planId.startsWith('glp1_')
  const isFasting = planId.startsWith('fasting_')
  const isLowCarb = planId === 'low_carb' || planId === 'keto_standard'
  const isMuscleGain = planId === 'muscle_gain'
  const isFatLoss = planId === 'fat_loss'
  const isHighProtein = isFatLoss || isMuscleGain || isGlp1

  const proteinPerKg = isMuscleGain ? 1.7 : isHighProtein ? 1.45 : isLowCarb ? 1.25 : 1.15
  const proteinTargetG = clamp(roundTo(weight * proteinPerKg, 5), 65, 130)
  const waterTargetMl = clamp(roundTo(weight * (isGlp1 ? 34 : 32), 100), 1600, 2800)
  const calorieResult = calculateCalorieTarget(profile, weight, planId, strategy)
  const carbTargetG = planId === 'keto_standard'
    ? 50
    : planId === 'low_carb'
      ? 130
      : isGlp1
        ? 160
        : isFasting
          ? 180
          : clamp(roundTo((calorieResult.calorieTarget - proteinTargetG * 4 - weight * 0.7 * 9) / 4, 10), 140, 220)
  const fatTargetG = clamp(roundTo((calorieResult.calorieTarget - proteinTargetG * 4 - carbTargetG * 4) / 9, 5), planId === 'keto_standard' ? 70 : 40, planId === 'keto_standard' ? 120 : 90)
  const fastingTargetHours = planId === 'fasting_18_6' ? 18 : planId === 'fasting_16_8' ? 16 : planId === 'fasting_14_10' ? 14 : planId === 'fasting_12_12' ? 12 : 16

  const score = bmi && bmi > 28 ? 82 : isGlp1 ? 84 : isFasting ? 85 : isMuscleGain ? 86 : 86
  const scoreTitle = isGlp1
    ? '今天先照顾进食舒适感'
    : isFasting
      ? '今天的进食窗口比较稳定'
      : isLowCarb
        ? '今天的碳水可以更有分寸'
        : isMuscleGain
          ? '今天先把蛋白和恢复照顾好'
          : '你今天状态挺稳定'
  const scoreDesc = isGlp1
    ? '少量蛋白和水分比一次吃很多更重要，不用硬撑。'
    : isFasting
      ? '窗口只是辅助，身体舒服和营养够也同样重要。'
      : isLowCarb
        ? '主食可以轻一点，蛋白和蔬菜先稳住。'
        : isMuscleGain
          ? `这 ${strategy?.cycleWeeks || 8} 周先看蛋白达标、训练恢复和体重趋势。`
          : `这 ${strategy?.cycleWeeks || 12} 周先看蛋白、水分和记录习惯，不追求一次做到很多。`

  return {
    bmi,
    weightGapKg,
    bmr: calorieResult.bmr,
    maintenanceCalories: calorieResult.maintenanceCalories,
    proteinTargetG,
    waterTargetMl,
    calorieTarget: calorieResult.calorieTarget,
    carbTargetG,
    fatTargetG,
    fastingTargetHours,
    score,
    scoreTitle,
    scoreDesc,
  }
}

export function buildDailyInput(profile: ShilyProfile, planId: ShilyPlanId, strategy?: ShilyStrategyConfig): DailyInput {
  const defaults = getDefaultDailyInput()
  const targets = calculateTargets(profile, planId, strategy)

  return {
    ...defaults,
    waterTargetMl: targets.waterTargetMl,
    proteinTargetG: targets.proteinTargetG,
    carbTargetG: targets.carbTargetG,
    fatG: defaults.fatG,
    fatTargetG: targets.fatTargetG,
    calorieTarget: targets.calorieTarget,
    fastingTargetHours: targets.fastingTargetHours,
    glp1Mode: planId.startsWith('glp1_'),
  }
}
