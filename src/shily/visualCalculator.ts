import { DailyInput, ShilyMood, ShilyScores, ShilyVisual } from './types'

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function clamp01(value: number): number {
  return clamp(value, 0, 1)
}

function generateShilyMessage(mood: ShilyMood): string {
  switch (mood) {
    case 'clear':
      return 'Shily 今天很清透，水分和蛋白质都不错。继续保持就好。'
    case 'balanced':
      return 'Shily 状态平稳，今天按现在这样来就好。'
    case 'puffy':
      return 'Shily 今天有点鼓鼓的，可能和碳水或盐分有关。晚餐轻一点就能拉回来。'
    case 'tired':
      return 'Shily 今天有点累，睡眠可能拖了后腿。今晚先把休息放在前面。'
    case 'low_energy':
      return 'Shily 能量有点低，先补一杯水，再安排一点蛋白质。'
    case 'stressed':
      return 'Shily 有点波动，今天压力可能偏高。先别急着严格控制，把今天过稳更重要。'
    default:
      return 'Shily 状态平稳，今天按现在这样来就好。'
  }
}

function getShilyMood(scores: ShilyScores): ShilyMood {
  const { fluidScore, stabilityScore, energyScore, pressureScore, stressPressure } = scores

  if (pressureScore > 0.72) return 'puffy'
  if (stressPressure > 0.72) return 'stressed'
  if (energyScore < 0.35) return 'low_energy'
  if (fluidScore < 0.35) return 'tired'
  if (fluidScore > 0.75 && stabilityScore > 0.7) return 'clear'
  return 'balanced'
}

export function calculateShilyScores(input: DailyInput): ShilyScores {
  const waterScore = clamp01(input.waterMl / input.waterTargetMl)
  const proteinScore = clamp01(input.proteinG / input.proteinTargetG)
  const carbPressure = clamp01((input.carbG - input.carbTargetG) / input.carbTargetG)
  const caloriePressure = clamp01((input.calories - input.calorieTarget) / input.calorieTarget)
  const activityScore = clamp01(input.steps / input.stepTarget)
  const sleepScore = clamp01((input.sleepHours - 5) / 3)
  const moodScore = clamp01((input.moodLevel - 1) / 4)
  const stressPressure = clamp01((input.stressLevel - 1) / 4)
  const fastingScore =
    input.fastingTargetHours && input.fastingHours
      ? clamp01(input.fastingHours / input.fastingTargetHours)
      : 0.5

  const fluidScore = waterScore * 0.75 + sleepScore * 0.15 + moodScore * 0.1
  const stabilityScore =
    proteinScore * 0.45 +
    (1 - carbPressure) * 0.25 +
    (1 - caloriePressure) * 0.15 +
    sleepScore * 0.15
  const energyScore =
    proteinScore * 0.3 +
    activityScore * 0.3 +
    sleepScore * 0.25 +
    moodScore * 0.15
  const rhythmScore =
    fastingScore * 0.35 +
    waterScore * 0.2 +
    proteinScore * 0.2 +
    activityScore * 0.15 +
    sleepScore * 0.1

  let pressureScore =
    carbPressure * 0.35 +
    caloriePressure * 0.25 +
    stressPressure * 0.25 +
    (1 - sleepScore) * 0.15

  if (input.glp1Mode) {
    pressureScore += clamp01((input.nauseaLevel || 0) / 5) * 0.15
  }

  pressureScore = clamp01(pressureScore)

  return {
    fluidScore,
    stabilityScore,
    energyScore,
    rhythmScore,
    pressureScore,
    waterScore,
    proteinScore,
    carbPressure,
    activityScore,
    sleepScore,
    moodScore,
    stressPressure,
  }
}

export function calculateShilyVisual(input: DailyInput): ShilyVisual {
  const scores = calculateShilyScores(input)
  const { fluidScore, stabilityScore, energyScore, rhythmScore, pressureScore, stressPressure } = scores
  const mood = getShilyMood(scores)

  const scale = clamp(1 + pressureScore * 0.05 - energyScore * 0.015, 0.98, 1.06)
  const opacity = clamp(0.9 + fluidScore * 0.08, 0.9, 0.98)
  const brightness = clamp(0.96 + energyScore * 0.12 - pressureScore * 0.04, 0.92, 1.08)
  const saturation = clamp(0.96 + scores.moodScore * 0.08 - pressureScore * 0.04, 0.92, 1.08)
  const blur = 0
  const glowSize = clamp(8 + energyScore * 22 + fluidScore * 8, 8, 38)
  const waveIntensity = clamp(
    0.08 + pressureScore * 0.28 + stressPressure * 0.2 + (1 - stabilityScore) * 0.16,
    0.08,
    0.65
  )
  const breathSpeed = clamp(5.2 - rhythmScore * 1.2 + pressureScore * 0.8, 3.6, 6.2)
  const floatY = clamp(-4 * energyScore + 3 * pressureScore, -4, 3)
  const borderSharpness = clamp(0.45 + stabilityScore * 0.45 - pressureScore * 0.15, 0.3, 0.9)
  const shapeSquash = clamp((1 - energyScore) * 0.08 + pressureScore * 0.06, 0, 0.14)

  return {
    scale,
    opacity,
    brightness,
    saturation,
    blur,
    glowSize,
    waveIntensity,
    breathSpeed,
    floatY,
    borderSharpness,
    shapeSquash,
    mood,
    message: generateShilyMessage(mood),
  }
}

export function getDefaultDailyInput(): DailyInput {
  return {
    waterMl: 1500,
    waterTargetMl: 2000,
    proteinG: 68,
    proteinTargetG: 90,
    carbG: 180,
    carbTargetG: 200,
    fatG: 45,
    fatTargetG: 60,
    calories: 1650,
    calorieTarget: 2000,
    steps: 6320,
    stepTarget: 10000,
    sleepHours: 7.5,
    moodLevel: 4,
    stressLevel: 2,
    fastingHours: 12,
    fastingTargetHours: 16,
  }
}
