import { ShilyDNA, ShilyVisualParams } from './types'

export function generateBlobPath(
  dna: ShilyDNA,
  visual: ShilyVisualParams
): string {
  const baseAsymmetry = dna.asymmetry * 12
  const waveOffset = visual.waveIntensity * 10
  const softnessFactor = dna.softness * 8

  const topY = 30 + waveOffset
  const rightX = 155 - baseAsymmetry
  const bottomY = 150 - waveOffset * 0.5
  const leftX = 25 + baseAsymmetry

  const cp1X = 140 + softnessFactor
  const cp1Y = 25 - baseAsymmetry * 0.5
  const cp2X = 165
  const cp2Y = 70 + waveOffset
  const cp3X = 150 + baseAsymmetry
  const cp3Y = 140
  const cp4X = 110
  const cp4Y = 160 + waveOffset * 0.3
  const cp5X = 45 - baseAsymmetry
  const cp5Y = 145
  const cp6X = 20
  const cp6Y = 95 - waveOffset
  const cp7X = 30 + baseAsymmetry * 0.8
  const cp7Y = 45 + waveOffset * 0.6
  const cp8X = 55
  const cp8Y = 25 + baseAsymmetry * 0.3

  return `
    M90 ${topY}
    C${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${rightX} 75
    C${cp3X} ${cp3Y}, ${cp4X} ${cp4Y}, 95 ${bottomY}
    C${cp5X} ${cp5Y}, ${cp6X} ${cp6Y}, ${leftX} 90
    C${cp7X} ${cp7Y}, ${cp8X} ${cp8Y}, 90 ${topY}
    Z
  `
}

export function generateFaceMoodPath(mood: ShilyVisualParams['faceMood']): string {
  switch (mood) {
    case 'happy':
      return 'M75 95 Q90 110 105 95'
    case 'calm':
      return 'M75 98 Q90 102 105 98'
    case 'tired':
      return 'M75 100 Q90 98 105 100'
    case 'puffy':
      return 'M70 95 Q90 105 110 95'
    case 'low_energy':
      return 'M75 102 Q90 98 105 102'
    default:
      return 'M75 98 Q90 102 105 98'
  }
}
