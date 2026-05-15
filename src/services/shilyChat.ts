import Taro from '@tarojs/taro'
import type { ShilyVoiceProfileId } from '../shily/voice'
import { defaultQuickActions } from '../shily/quickActions'

const CLOUD_ENV_ID = 'cloudbase-d7gv7tpnecde3db99'
const HUNYUAN_PROVIDER = 'hunyuan-v3'
const HUNYUAN_MODEL = 'hy3-preview'

export type ShilyChatMood = 'normal' | 'happy' | 'tired' | 'puffy' | 'low_energy' | 'stressed'

export interface ShilyChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ShilyAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ShilyChatRequest {
  message: string
  history: ShilyChatMessage[]
  context?: {
    nickname?: string
    goal?: string
    planTitle?: string
    strategySummary?: string
    riskLevel?: string
    todayFocus?: string
    todayAction?: string
    lastAction?: string
    lastActionNote?: string
    glp1Dose?: string
    glp1NextDoseDate?: string
    voiceProfile?: ShilyVoiceProfileId
    timeOfDay?: string
    proteinGap?: number
    waterGapCups?: number
    quickActions?: string[]
  }
}

export interface ShilyChatResult {
  reply: string
  mood: ShilyChatMood
  quickActions: string[]
  source: 'deepseek' | 'hunyuan' | 'fallback'
  errorMessage?: string
}

interface ShilyChatProxyResponse {
  reply?: string
  mood?: ShilyChatMood
  quickActions?: string[]
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

interface ShilyCloudFunctionResponse {
  statusCode?: number
  body?: string | ShilyChatProxyResponse
  reply?: string
  mood?: ShilyChatMood
  quickActions?: string[]
  source?: ShilyChatResult['source']
}

function buildHunyuanMessages(request: ShilyChatRequest): ShilyAIMessage[] {
  const context = request.context
  const contextLines = [
    context?.planTitle ? `当前方案：${context.planTitle}` : '',
    context?.strategySummary ? `方案摘要：${context.strategySummary}` : '',
    context?.todayFocus ? `今日重点：${context.todayFocus}` : '',
    context?.todayAction ? `今日行动：${context.todayAction}` : '',
    Number.isFinite(context?.proteinGap) ? `蛋白缺口：${context?.proteinGap}g` : '',
    Number.isFinite(context?.waterGapCups) ? `饮水缺口：${context?.waterGapCups}杯` : '',
    Array.isArray(context?.quickActions) ? `快捷按钮：${context?.quickActions.slice(0, 2).join(' / ')}` : '',
  ].filter(Boolean).join('\n')

  return [
    {
      role: 'system',
      content: [
        '你是 Shily，用户的今日节律助手。',
        '用户选择方案后，你默认基于用户的方案、目标、今日记录、饮食/饮水完成情况、最近一次行动和当前对话，判断用户现在最该做的一小步。',
        '你的任务不是泛聊，也不是展示 AI 能力，而是把用户已经记录的数据和当前问题，转成一个清楚、可执行、少费脑子的下一步。',
        '用户问得模糊时，不反复追问，先给一个稳妥建议。',
        '用户状态不好时，降低任务难度。',
        '用户想吃、嘴馋、困、乱、懒得想时，直接帮他收敛到一个选择。',
        '数据不足时，也先给一个保守可执行方案，不停下来解释自己不知道。',
        '不做医学诊断，不编造系统没有记录过的事实。',
        '语气像一个靠谱的人在旁边帮用户省脑子，不像 AI 功能菜单，不像医生，不像心理咨询。',
        '不说教，不鸡汤，不卖萌。尽量一句话给方向，再给一步行动。',
        '只能输出 JSON，不要 markdown。',
        '格式：{"reply":"给用户看的中文回复","mood":"normal","quickActions":["今天吃啥","现在先干嘛"]}',
        'mood 只能是 normal/happy/tired/puffy/low_energy/stressed，quickActions 正好 2 个。',
        'quickActions 要像真实用户脑子里的原话，短、具体、口语化，不要功能名、AI 腔、健康行业黑话。',
        contextLines,
      ].filter(Boolean).join('\n'),
    },
    ...request.history.slice(-8),
    {
      role: 'user',
      content: request.message,
    },
  ]
}

async function collectMiniProgramAIText(response: { eventStream?: AsyncIterable<{ data?: string }> }) {
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

async function sendMiniProgramHunyuanMessage(request: ShilyChatRequest): Promise<ShilyChatResult> {
  if (typeof wx === 'undefined' || !wx.cloud?.extend?.AI?.createModel) {
    throw new Error('wx.cloud.extend.AI is unavailable')
  }

  const model = wx.cloud.extend.AI.createModel(HUNYUAN_PROVIDER)
  const response = await model.streamText({
    data: {
      model: HUNYUAN_MODEL,
      messages: buildHunyuanMessages(request),
    },
  })
  const content = await collectMiniProgramAIText(response)
  const parsed = parseDeepSeekContent(content)
  const normalized = normalizeResponse(parsed as ShilyChatProxyResponse, request.message)
  return {
    ...normalized,
    source: 'hunyuan',
  }
}

const moodQuickActions: Record<ShilyChatMood, string[]> = {
  normal: defaultQuickActions,
  happy: ['明天怎么继续', '今天还要管吗'],
  tired: ['我现在好困', '先简单点吧'],
  puffy: ['今天别太咸', '现在喝点水'],
  low_energy: ['吃不下怎么办', '今晚吃点热的吗'],
  stressed: ['先吃点啥', '今天别乱吃'],
}

function detectFallbackMood(message: string): ShilyChatMood {
  const text = message.toLowerCase()

  if (/开心|高兴|不错|很好|舒服|顺利|喜欢|满足/.test(text)) return 'happy'
  if (/累|困|疲惫|睡不醒|乏|没力气/.test(text)) return 'tired'
  if (/不想动|什么都不想|没能量|没劲|低落|摆烂/.test(text)) return 'low_energy'
  if (/焦虑|压力|烦|崩溃|紧张|事情好多|慌|难受/.test(text)) return 'stressed'
  if (/水肿|浮肿|肿|胀|沉|脸大|吃多|撑/.test(text)) return 'puffy'

  return 'normal'
}

function getEndpoint() {
  if (typeof SHILY_CHAT_ENDPOINT === 'undefined') return ''
  return SHILY_CHAT_ENDPOINT.trim()
}

function normalizeQuickActions(actions?: string[]) {
  if (!Array.isArray(actions)) return defaultQuickActions
  const cleaned = actions
    .map((item) => String(item).trim())
    .filter(Boolean)
    .map((item) => {
      if (item === '按方案选这餐') return '今天吃啥'
      if (item === '下一餐给我方案') return '今天吃啥'
      if (item === '今天先做哪件事') return '现在先干嘛'
      if (item === '今天吃什么') return '今天吃啥'
      if (item === '今天怎么吃更稳') return '今天吃啥'
      if (item === '外卖怎么选') return '外卖怎么点'
      if (item === '排今天优先级') return '现在先干嘛'
      if (item === '先做哪件事') return '现在先干嘛'
      if (item === '保留必要项') return '现在先干嘛'
      if (item === '晚餐降负担') return '晚上吃啥不撑'
      return item
    })
    .slice(0, 2)
  return cleaned.length > 0 ? cleaned : defaultQuickActions
}

function safeMood(mood?: string): ShilyChatMood {
  const moods: ShilyChatMood[] = ['normal', 'happy', 'tired', 'puffy', 'low_energy', 'stressed']
  return moods.includes(mood as ShilyChatMood) ? (mood as ShilyChatMood) : 'normal'
}

function parseJsonObject(content: string): Partial<ShilyChatResult> | null {
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim()

  try {
    const parsed = JSON.parse(cleaned) as Partial<ShilyChatResult>
    return parsed
  } catch {
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start < 0 || end <= start) return null

    try {
      const parsed = JSON.parse(cleaned.slice(start, end + 1)) as Partial<ShilyChatResult>
      return parsed
    } catch {
      return null
    }
  }
}

function stripEmbeddedJson(content: string) {
  return content
    .replace(/```(?:json)?[\s\S]*?```/gi, '')
    .replace(/\{\s*"reply"\s*:\s*"[\s\S]*?"\s*,\s*"mood"\s*:\s*"[\s\S]*?"\s*,\s*"quickActions"\s*:\s*\[[\s\S]*?\]\s*\}/g, '')
    .trim()
}

function parseDeepSeekContent(content?: string): Partial<ShilyChatResult> {
  if (!content) return {}
  const parsed = parseJsonObject(content)
  if (parsed?.reply) return parsed

  const reply = stripEmbeddedJson(content)
  return { reply: reply || content.trim() }
}

function normalizeModelPayload(value: ShilyChatProxyResponse): ShilyChatProxyResponse {
  const parsedReply = typeof value.reply === 'string' ? parseJsonObject(value.reply) : null
  if (parsedReply?.reply) {
    return {
      ...value,
      ...parsedReply,
      quickActions: parsedReply.quickActions || value.quickActions,
    }
  }

  return value
}

function buildFallbackReply(message: string): ShilyChatResult {
  const normalized = message.trim()
  const mood = detectFallbackMood(normalized)
  const isMealChoice = /外卖|点餐|吃什么|吃啥|这一餐|这餐|午餐|午饭|晚餐|晚饭|早餐|便利店|餐食|下一餐|加个鸡蛋/.test(normalized)
  const isDailyPriority = /现在先干嘛|今天优先|优先级|哪三件|保留哪三件|理一下|先做什么|先干嘛/.test(normalized)
  const isHungry = /饿|想吃|嘴馋/.test(normalized)
  const planTitle = requestContext?.planTitle || ''
  const todayAction = requestContext?.todayAction || ''
  const contextQuickActions = normalizeQuickActions(requestContext?.quickActions)

  let reply = '可以，先给你一个能直接照做的选择。'

  if (mood === 'low_energy') {
    reply = '今天先别加新任务。吃一顿正经饭，喝一杯水，后面就收住。'
  } else if (mood === 'stressed') {
    reply = '先别把所有事摊开。现在只做一件：把下一餐定下来。'
  } else if (mood === 'tired') {
    reply = '那就吃简单点。鸡蛋、豆浆、酸奶或鸡肉饭里选一个，再喝点水。'
  } else if (mood === 'happy') {
    reply = '今天状态可以，别加码。照现在这套吃法继续走就行。'
  } else if (mood === 'puffy') {
    reply = '今天先别点太咸的。晚点选鸡蛋、豆浆或清汤面，加一杯水。'
  } else if (isDailyPriority) {
    reply = todayAction ? `现在先做这个：${todayAction}。做完就不用继续加任务。` : '现在先把下一餐定下来。选鸡蛋、豆浆、鸡肉饭这类就行。'
  } else if (isMealChoice) {
    reply = planTitle.includes('生酮') || planTitle.includes('控碳')
      ? '这餐选肉、蛋或豆腐，再配蔬菜。主食少一点，不用弄得很极端。'
      : '下一餐就选鸡肉饭、鸡蛋豆浆或清汤面加蛋。外卖别点炸物和甜饮。'
  } else if (isHungry) {
    reply = '先别用零食顶过去。想省事就鸡蛋、酸奶、豆浆里选一个。'
  } else if (todayAction) {
    reply = `现在先做一件就好：${todayAction}。做完就不用继续加任务。`
  }

  return {
    reply,
    mood,
    quickActions: contextQuickActions.length > 0 ? contextQuickActions : moodQuickActions[mood] || defaultQuickActions,
    source: 'fallback',
  }
}

let requestContext: ShilyChatRequest['context'] | undefined

function normalizeResponse(data: ShilyChatProxyResponse, message: string): ShilyChatResult {
  const direct = normalizeModelPayload(data || {})
  const parsed = parseDeepSeekContent(direct.choices?.[0]?.message?.content)
  const reply = String(direct.reply || parsed.reply || buildFallbackReply(message).reply).trim()

  return {
    reply,
    mood: safeMood(direct.mood || parsed.mood),
    quickActions: normalizeQuickActions(direct.quickActions || parsed.quickActions || requestContext?.quickActions),
    source: (direct as ShilyCloudFunctionResponse).source || 'deepseek',
  }
}

function normalizeCloudFunctionResult(result: ShilyCloudFunctionResponse | undefined, message: string): ShilyChatResult {
  if (!result) return buildFallbackReply(message)
  const body = result.body
  let data: ShilyChatProxyResponse
  try {
    data = typeof body === 'string' ? JSON.parse(body) as ShilyChatProxyResponse : (body || result)
  } catch {
    data = result
  }
  return normalizeResponse(data, message)
}

export async function sendShilyChatMessage(request: ShilyChatRequest): Promise<ShilyChatResult> {
  const endpoint = getEndpoint()
  requestContext = request.context

  try {
    return await sendMiniProgramHunyuanMessage(request)
  } catch (error) {
    console.error('shily-chat mini program hunyuan failed', error)
  }

  if (typeof wx !== 'undefined' && wx.cloud?.callFunction) {
    try {
      const response = await wx.cloud.callFunction<ShilyCloudFunctionResponse>({
        name: 'shily-chat',
        config: {
          env: CLOUD_ENV_ID,
        },
        data: {
          message: request.message,
          history: request.history.slice(-12),
          context: request.context,
        },
      })
      return normalizeCloudFunctionResult(response.result, request.message)
    } catch (error) {
      console.error('shily-chat cloud function failed', error)
      if (!endpoint) {
        const fallback = buildFallbackReply(request.message)
        return {
          ...fallback,
          errorMessage: error instanceof Error ? error.message : 'cloud function request failed',
        }
      }
    }
  }

  try {
    const response = await Taro.request<ShilyChatProxyResponse>({
      url: endpoint,
      method: 'POST',
      timeout: 20000,
      header: {
        'content-type': 'application/json',
      },
      data: {
        message: request.message,
        history: request.history.slice(-12),
        context: request.context,
      },
    })

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw new Error(`chat proxy status ${response.statusCode}`)
    }

    return normalizeResponse(response.data, request.message)
  } catch (error) {
    const fallback = buildFallbackReply(request.message)
    return {
      ...fallback,
      errorMessage: error instanceof Error ? error.message : 'DeepSeek request failed',
    }
  }
}

export { defaultQuickActions }
