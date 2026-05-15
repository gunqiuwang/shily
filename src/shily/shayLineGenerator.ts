import { DailyInput, ShilyScores } from './types'
import { calculateShilyScores } from './visualCalculator'

interface WeatherInfo {
  temperature: number
  condition: 'sunny' | 'cloudy' | 'rainy' | 'hot' | 'cold'
}

interface ShilyLine {
  mood: string
  reasons: string[]
  action: string
  fullText: string
}

function getMoodFromScores(scores: ShilyScores): string {
  const { fluidScore, energyScore, stabilityScore, pressureScore } = scores

  if (pressureScore > 0.7) return '有点胀'
  if (energyScore < 0.4) return '有点累'
  if (fluidScore < 0.4) return '有点干'
  if (stabilityScore > 0.7 && fluidScore > 0.7) return '很轻盈'
  return '状态平稳'
}

function getTopReasons(scores: ShilyScores, weather?: WeatherInfo): string[] {
  const reasons: { reason: string; weight: number }[] = []

  if (scores.sleepScore < 0.5) reasons.push({ reason: '睡眠偏少', weight: 3 })
  if (scores.waterScore < 0.5) reasons.push({ reason: '水分还少一点', weight: 3 })
  if (scores.proteinScore < 0.5) reasons.push({ reason: '蛋白质还可以补一点', weight: 2 })
  if (scores.carbPressure > 0.6) reasons.push({ reason: '碳水有些高', weight: 2 })
  if (scores.stressPressure > 0.6) reasons.push({ reason: '压力有些高', weight: 2 })

  if (weather?.condition === 'hot') reasons.push({ reason: '天气偏热', weight: 1 })
  if (weather?.condition === 'cold') reasons.push({ reason: '天气偏冷', weight: 1 })

  reasons.sort((a, b) => b.weight - a.weight)
  return reasons.slice(0, 2).map((item) => item.reason)
}

function getNextAction(scores: ShilyScores, weather?: WeatherInfo): string {
  if (scores.waterScore < 0.5) return '先喝一杯水，把基础状态补回来'
  if (scores.proteinScore < 0.5) return '下一餐补一点蛋白质就很好'
  if (scores.pressureScore > 0.6) return '下一餐轻一点，不用太复杂'
  if (scores.activityScore < 0.4) return '等会儿可以安排一小段步行'
  if (weather?.condition === 'hot') return '今天记得多补一点水分'
  if (weather?.condition === 'cold') return '可以安排一点温热的食物'
  if (scores.sleepScore < 0.5) return '今晚早点休息，身体会更稳'
  return '保持现在这样就好'
}

export function generateShilyLine(input: DailyInput, weather?: WeatherInfo): ShilyLine {
  const scores = calculateShilyScores(input)
  const mood = getMoodFromScores(scores)
  const reasons = getTopReasons(scores, weather)
  const action = getNextAction(scores, weather)

  const reasonLine = reasons.length > 0 ? `\n${reasons.join('、')}` : ''
  const fullText = `Shily 今天${mood}${reasonLine}\n\n${action}`

  return {
    mood,
    reasons,
    action,
    fullText,
  }
}

export type ShilyStatusType = 'light' | 'stable' | 'tired' | 'dry' | 'puffy' | 'unstable'

export function getShilyStatusType(scores: ShilyScores): ShilyStatusType {
  const { fluidScore, energyScore, stabilityScore, pressureScore, stressPressure } = scores

  if (pressureScore > 0.7) return 'puffy'
  if (stressPressure > 0.7) return 'unstable'
  if (energyScore < 0.4) return 'tired'
  if (fluidScore < 0.4) return 'dry'
  if (stabilityScore > 0.7 && fluidScore > 0.7) return 'light'
  return 'stable'
}

export function getStatusMessage(status: ShilyStatusType): { title: string; desc: string; action: string } {
  const messages: Record<ShilyStatusType, { title: string; desc: string; action: string }> = {
    light: {
      title: 'Shily 今天很轻盈',
      desc: '水分和蛋白质都不错',
      action: '继续保持就好',
    },
    stable: {
      title: 'Shily 状态平稳',
      desc: '今天状态比较稳定',
      action: '按现在这样做就很好',
    },
    tired: {
      title: 'Shily 今天有点累',
      desc: '睡眠和水分都可以再照顾一点',
      action: '先补水，今晚早点休息',
    },
    dry: {
      title: 'Shily 有点干',
      desc: '水分还少了一点',
      action: '先喝一杯水，不急着调整饮食',
    },
    puffy: {
      title: 'Shily 今天有点胀',
      desc: '碳水或盐分可能偏高',
      action: '下一餐轻一点就能拉回来',
    },
    unstable: {
      title: 'Shily 有点不稳',
      desc: '压力或情绪有些波动',
      action: '先把今天过稳，不用严格控制',
    },
  }

  return messages[status]
}
