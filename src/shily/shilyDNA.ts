import { ShilyDNA, ShilyBaseType } from './types'

interface DNAPreset {
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
  expressionStyle: ShilyDNA['expressionStyle']
}

const DNA_PRESETS: Record<ShilyBaseType, DNAPreset> = {
  balanced: {
    roundness: 0.7,
    compactness: 0.5,
    asymmetry: 0.2,
    softness: 0.7,
    primaryColor: '#D9D7FF',
    secondaryColor: '#F4F2FF',
    glowColor: '#A5B4FC',
    breathSpeed: 4,
    waveIntensity: 0.2,
    lift: 0.2,
    expressionStyle: 'calm'
  },

  low_carb: {
    roundness: 0.6,
    compactness: 0.75,
    asymmetry: 0.18,
    softness: 0.55,
    primaryColor: '#DDF5E8',
    secondaryColor: '#F0FDF4',
    glowColor: '#6EE7B7',
    breathSpeed: 4.5,
    waveIntensity: 0.16,
    lift: 0.15,
    expressionStyle: 'calm'
  },

  keto: {
    roundness: 0.55,
    compactness: 0.82,
    asymmetry: 0.15,
    softness: 0.48,
    primaryColor: '#DBEAFE',
    secondaryColor: '#EFF6FF',
    glowColor: '#60A5FA',
    breathSpeed: 5,
    waveIntensity: 0.14,
    lift: 0.12,
    expressionStyle: 'calm'
  },

  fasting: {
    roundness: 0.65,
    compactness: 0.62,
    asymmetry: 0.28,
    softness: 0.68,
    primaryColor: '#EDE9FE',
    secondaryColor: '#F5F3FF',
    glowColor: '#A78BFA',
    breathSpeed: 3.6,
    waveIntensity: 0.24,
    lift: 0.18,
    expressionStyle: 'sensitive'
  },

  glp1: {
    roundness: 0.72,
    compactness: 0.58,
    asymmetry: 0.22,
    softness: 0.78,
    primaryColor: '#E0F2FE',
    secondaryColor: '#F0F9FF',
    glowColor: '#7DD3FC',
    breathSpeed: 4.8,
    waveIntensity: 0.18,
    lift: 0.1,
    expressionStyle: 'sensitive'
  },

  emotional_eating: {
    roundness: 0.8,
    compactness: 0.45,
    asymmetry: 0.35,
    softness: 0.86,
    primaryColor: '#FCE7F3',
    secondaryColor: '#FFF1F9',
    glowColor: '#F9A8D4',
    breathSpeed: 3.8,
    waveIntensity: 0.32,
    lift: 0.22,
    expressionStyle: 'sensitive'
  }
}

export interface ProfileInfo {
  dietMode?: ShilyBaseType
}

export function createShilyDNA(profile: ProfileInfo = {}): ShilyDNA {
  const baseType = profile.dietMode || 'balanced'
  const preset = DNA_PRESETS[baseType] || DNA_PRESETS.balanced

  return {
    baseType,
    ...preset
  }
}

export function getDefaultDNA(): ShilyDNA {
  return createShilyDNA({ dietMode: 'balanced' })
}
