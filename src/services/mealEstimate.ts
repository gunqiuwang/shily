import { MealType } from '../shily/mealRecords'

const HUNYUAN_PROVIDER = 'hunyuan-v3'
const HUNYUAN_MODEL = 'hy3-preview'

export interface MealEstimateResult {
  calories: number
  proteinG: number
  carbG: number
  fatG: number
  source: 'hunyuan' | 'fallback'
  note?: string
}

interface FoodRule {
  pattern: RegExp
  calories: number
  proteinG: number
  carbG: number
  fatG: number
}

const foodRules: FoodRule[] = [
  { pattern: /半碗饭|半份米饭|少饭/, calories: 95, proteinG: 2, carbG: 21, fatG: 0 },
  { pattern: /米饭|白饭|一碗饭|饭\b/, calories: 230, proteinG: 5, carbG: 52, fatG: 0 },
  { pattern: /馒头/, calories: 112, proteinG: 4, carbG: 24, fatG: 1 },
  { pattern: /面条|汤面|拌面|面\b|米粉|河粉/, calories: 420, proteinG: 13, carbG: 72, fatG: 8 },
  { pattern: /粥|稀饭/, calories: 115, proteinG: 3, carbG: 24, fatG: 1 },
  { pattern: /红薯|地瓜/, calories: 120, proteinG: 2, carbG: 28, fatG: 0 },
  { pattern: /玉米/, calories: 112, proteinG: 4, carbG: 22, fatG: 1 },
  { pattern: /鸡蛋|水煮蛋|煎蛋|蛋/, calories: 70, proteinG: 6, carbG: 1, fatG: 5 },
  { pattern: /牛奶|奶\b/, calories: 135, proteinG: 8, carbG: 12, fatG: 7 },
  { pattern: /豆浆/, calories: 90, proteinG: 7, carbG: 8, fatG: 4 },
  { pattern: /酸奶/, calories: 140, proteinG: 7, carbG: 18, fatG: 4 },
  { pattern: /豆腐/, calories: 95, proteinG: 10, carbG: 3, fatG: 5 },
  { pattern: /鸡胸|鸡肉|瘦肉|猪肉|牛肉|肉/, calories: 180, proteinG: 24, carbG: 0, fatG: 8 },
  { pattern: /鱼|鱼肉/, calories: 150, proteinG: 22, carbG: 0, fatG: 6 },
  { pattern: /虾|虾仁/, calories: 85, proteinG: 17, carbG: 1, fatG: 1 },
  { pattern: /青菜|绿叶菜|蔬菜|菜/, calories: 45, proteinG: 3, carbG: 8, fatG: 1 },
  { pattern: /西红柿|番茄/, calories: 30, proteinG: 1, carbG: 6, fatG: 0 },
  { pattern: /黄瓜/, calories: 24, proteinG: 1, carbG: 5, fatG: 0 },
  { pattern: /西兰花/, calories: 50, proteinG: 4, carbG: 9, fatG: 1 },
  { pattern: /包子/, calories: 210, proteinG: 7, carbG: 34, fatG: 6 },
  { pattern: /盖饭|饭盒/, calories: 650, proteinG: 25, carbG: 85, fatG: 22 },
  { pattern: /沙拉|轻食/, calories: 420, proteinG: 28, carbG: 36, fatG: 18 },
  { pattern: /麻辣烫/, calories: 520, proteinG: 24, carbG: 45, fatG: 25 },
  { pattern: /炒菜|小炒/, calories: 360, proteinG: 18, carbG: 18, fatG: 22 },
]

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function getCountNearFood(text: string, pattern: RegExp) {
  const match = text.match(pattern)
  if (!match || match.index === undefined) return 1
  const start = Math.max(0, match.index - 6)
  const prefix = text.slice(start, match.index)
  if (/两个|2个|两只|2只|两颗|2颗/.test(prefix)) return 2
  if (/三个|3个|三只|3只|三颗|3颗/.test(prefix)) return 3
  if (/一半|半个|半份|半碗/.test(prefix)) return 0.5
  return 1
}

function normalizeEstimate(value: Partial<MealEstimateResult>, source: MealEstimateResult['source']): MealEstimateResult {
  return {
    calories: clamp(Math.round(Number(value.calories || 0)), 0, 2500),
    proteinG: clamp(Math.round(Number(value.proteinG || 0)), 0, 180),
    carbG: clamp(Math.round(Number(value.carbG || 0)), 0, 300),
    fatG: clamp(Math.round(Number(value.fatG || 0)), 0, 180),
    source,
    note: value.note,
  }
}

function parseJsonObject(content: string): Partial<MealEstimateResult> | null {
  const cleaned = content.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim()
  try {
    return JSON.parse(cleaned) as Partial<MealEstimateResult>
  } catch {
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start < 0 || end <= start) return null
    try {
      return JSON.parse(cleaned.slice(start, end + 1)) as Partial<MealEstimateResult>
    } catch {
      return null
    }
  }
}

async function collectAIText(response: { eventStream?: AsyncIterable<{ data?: string }> }) {
  let text = ''
  const stream = response.eventStream
  if (!stream || typeof stream[Symbol.asyncIterator] !== 'function') return text

  for await (const event of stream) {
    if (!event.data || event.data === '[DONE]') {
      if (event.data === '[DONE]') break
      continue
    }
    try {
      const data = JSON.parse(event.data)
      text += data?.choices?.[0]?.delta?.content || data?.choices?.[0]?.message?.content || ''
    } catch {
      text += event.data
    }
  }
  return text
}

export function estimateMealByRules(text: string): MealEstimateResult {
  const matched = foodRules.filter((rule) => rule.pattern.test(text))
  if (!matched.length) {
    return {
      calories: 360,
      proteinG: 16,
      carbG: 40,
      fatG: 12,
      source: 'fallback',
      note: '没识别清楚，先按普通一餐粗估。',
    }
  }

  const total = matched.reduce(
    (sum, rule) => {
      const count = getCountNearFood(text, rule.pattern)
      return {
        calories: sum.calories + rule.calories * count,
        proteinG: sum.proteinG + rule.proteinG * count,
        carbG: sum.carbG + rule.carbG * count,
        fatG: sum.fatG + rule.fatG * count,
      }
    },
    { calories: 0, proteinG: 0, carbG: 0, fatG: 0 },
  )

  return normalizeEstimate(total, 'fallback')
}

export async function estimateMealWithAI(text: string, mealType: MealType): Promise<MealEstimateResult> {
  if (typeof wx === 'undefined' || !wx.cloud?.extend?.AI?.createModel) {
    return estimateMealByRules(text)
  }

  try {
    const model = wx.cloud.extend.AI.createModel(HUNYUAN_PROVIDER)
    const response = await model.streamText({
      data: {
        model: HUNYUAN_MODEL,
        messages: [
          {
            role: 'system',
            content: [
              '你是 Shily 的饮食估算模块。',
              '用户会用一句中文描述刚吃的一餐。你只做粗略营养估算，不做医学建议。',
              '估算普通中国日常份量即可。不要解释，不要 markdown，只输出 JSON。',
              '格式：{"calories":520,"proteinG":24,"carbG":58,"fatG":16,"note":"按普通份量粗估"}',
              '所有数字必须是整数。估不准也给保守粗估。',
            ].join('\n'),
          },
          {
            role: 'user',
            content: `餐次：${mealType}\n内容：${text}`,
          },
        ],
      },
    })
    const content = await collectAIText(response)
    const parsed = parseJsonObject(content)
    if (!parsed) throw new Error('AI estimate parse failed')
    return normalizeEstimate(parsed, 'hunyuan')
  } catch (error) {
    console.error('meal estimate ai failed', error)
    return estimateMealByRules(text)
  }
}
