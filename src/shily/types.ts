export interface DailyInput {
  waterMl: number
  waterTargetMl: number
  proteinG: number
  proteinTargetG: number
  carbG: number
  carbTargetG: number
  fatG?: number
  fatTargetG?: number
  calories: number
  calorieTarget: number
  steps: number
  stepTarget: number
  sleepHours: number
  moodLevel: number
  stressLevel: number
  fastingHours?: number
  fastingTargetHours?: number
  glp1Mode?: boolean
  nauseaLevel?: number
  appetiteLevel?: number
}

export interface ShilyScores {
  fluidScore: number
  stabilityScore: number
  energyScore: number
  rhythmScore: number
  pressureScore: number
  waterScore: number
  proteinScore: number
  carbPressure: number
  activityScore: number
  sleepScore: number
  moodScore: number
  stressPressure: number
}

export type ShilyMood = 'balanced' | 'clear' | 'tired' | 'puffy' | 'low_energy' | 'stressed'

export interface ShilyVisual {
  scale: number
  opacity: number
  brightness: number
  saturation: number
  blur: number
  glowSize: number
  waveIntensity: number
  breathSpeed: number
  floatY: number
  borderSharpness: number
  shapeSquash: number
  mood: ShilyMood
  message: string
}

export interface ShilyVisualParams extends ShilyVisual {
  faceMood: 'happy' | 'calm' | 'tired' | 'puffy' | 'low_energy'
}

export type ShilyBaseType = 'balanced' | 'low_carb' | 'keto' | 'fasting' | 'glp1' | 'emotional_eating'

export interface ShilyDNA {
  baseType: ShilyBaseType
  roundness: number
  compactness: number
  asymmetry: number
  softness: number
  primaryColor: string
  secondaryColor: string
  glowColor: string
  breathSpeed: number
  waveIntensity: number
  lift: number
  expressionStyle: 'calm' | 'sensitive'
}
