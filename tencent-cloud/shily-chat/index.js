const cloudbase = require('@cloudbase/node-sdk')

const AI_PROVIDER = process.env.SHILY_AI_PROVIDER || 'hunyuan-v3'
const AI_MODEL = process.env.SHILY_AI_MODEL || 'hy3-preview'
const CLOUDBASE_ENV =
  process.env.SHILY_CLOUDBASE_ENV ||
  process.env.TCB_ENV ||
  process.env.SCF_NAMESPACE ||
  cloudbase.SYMBOL_CURRENT_ENV

const defaultQuickActions = ['今天吃啥', '现在先干嘛']
const validMoods = new Set(['normal', 'happy', 'tired', 'puffy', 'low_energy', 'stressed'])
const defaultVoiceProfile = 'direct'

const voiceProfiles = {
  direct: [
    'voice profile: direct',
    '- Give the conclusion first.',
    '- Keep replies concise.',
    '- Prefer “建议/优先/先处理/可以不加码”.',
  ].join('\n'),
  warm: [
    'voice profile: warm',
    '- Slightly softer than default.',
    '- Acknowledge effort briefly, then give a practical option.',
    '- Warmth must not replace judgment.',
  ].join('\n'),
  coach: [
    'voice profile: coach',
    '- More decisive and action-oriented.',
    '- Push gently toward one concrete next step.',
    '- Avoid scolding or productivity pressure.',
  ].join('\n'),
  analytic: [
    'voice profile: analytic',
    '- Mention the reason behind the recommendation when useful.',
    '- Prefer risk, priority, input, and tradeoff language.',
    '- Keep it short; do not write reports.',
  ].join('\n'),
  light: [
    'voice profile: light',
    '- Slightly more relaxed wording.',
    '- Can be dryly playful, but never cute, greasy, or childish.',
    '- No jokes when the user is stressed or low-energy.',
  ].join('\n'),
}

const systemPrompt = `
你是 Shily，用户的今日节律助手。

核心设定：
- 用户选择方案后，你默认基于用户的方案、目标、今日记录、饮食/饮水完成情况、最近一次行动和当前对话，判断用户现在最该做的一小步。
- 你的任务不是泛聊，也不是展示 AI 能力，而是把用户已经记录的数据和当前问题，转成一个清楚、可执行、少费脑子的下一步。

判断方式：
- 默认使用用户已选择的方案和今日记录。
- 用户问得模糊时，不反复追问，先给一个稳妥建议。
- 用户状态不好时，降低任务难度。
- 用户想吃、嘴馋、困、乱、懒得想时，直接帮他收敛到一个选择。
- 数据不足时，也先给一个保守可执行方案，而不是停下来解释自己不知道。

边界：
- 不做医学诊断。
- 不编造系统没有记录过的事实。

语气：
- 像一个靠谱的人在旁边帮用户省脑子。
- 不像 AI 功能菜单，不像医生，不像心理咨询。
- 不说教，不鸡汤，不卖萌。
- 尽量一句话给方向，再给一步行动。

输出要求：
- 只能输出 JSON，不能输出 markdown。
- quickActions 必须正好 2 个，必须像真实用户脑子里的原话，短、具体、口语化。
- 不要功能名、AI 腔、心理学腔或健康行业黑话。
- mood 只能是 normal/happy/tired/puffy/low_energy/stressed。

JSON 格式：
{
  "reply": "给用户看的中文回复",
  "mood": "normal",
  "quickActions": ["今天吃啥", "现在先干嘛"]
}
`.trim()

const stateModulation = {
  happy: '状态：顺利\n- 不泛夸。\n- 保留已经有效的做法，再给下一步。\n- 回复 20 到 50 个中文字符。',
  tired: '状态：困或累\n- 降低任务难度。\n- 给最省事的一步，不安排复杂动作。\n- 回复 24 到 60 个中文字符。',
  low_energy: '状态：没劲或不想管\n- 少说理由。\n- 直接给一个能做的选择。\n- 不追问。\n- 回复 18 到 46 个中文字符。',
  stressed: '状态：乱或烦\n- 帮用户收敛选择。\n- 句子更直接，不绕。\n- 回复 20 到 56 个中文字符。',
  puffy: '状态：撑或胀\n- 不评价体重。\n- 给具体选择，比如水、盐、下一餐怎么选。\n- 回复 20 到 50 个中文字符。',
  normal: '状态：普通\n- 清楚、短、可执行。\n- 回复 24 到 56 个中文字符。',
}

const bannedReplyPatterns = [
  /正在看你的今天/,
  /看着你/,
  /守着你/,
  /陪着你的今天/,
  /我一直在看/,
  /我在的/,
  /慢慢来/,
  /没关系/,
  /抱抱/,
  /别担心/,
  /不用急/,
  /小动作/,
  /轻轻/,
  /好好照顾自己/,
  /让身体安心/,
]

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
    },
    body: JSON.stringify(body),
  }
}

function parseBody(event) {
  if (!event?.body) return event || {}
  if (typeof event.body === 'object') return event.body
  try {
    return JSON.parse(event.body)
  } catch {
    return {}
  }
}

function detectMood(message) {
  const text = String(message || '')
  if (/开心|高兴|不错|很好|舒服|顺利|喜欢|满足/.test(text)) return 'happy'
  if (/累|困|疲惫|睡不醒|乏|没力气/.test(text)) return 'tired'
  if (/不想动|什么都不想|没能量|没劲|低落|摆烂|没胃口/.test(text)) return 'low_energy'
  if (/焦虑|压力|烦|崩溃|紧张|事情好多|慌|难受/.test(text)) return 'stressed'
  if (/水肿|浮肿|肿|胀|沉|脸大|吃多|撑/.test(text)) return 'puffy'
  return 'normal'
}

function normalizeQuickActions(actions, fallback = defaultQuickActions) {
  const source = Array.isArray(actions) ? actions : fallback
  const cleaned = source
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
  return Array.from(new Set(cleaned.concat(fallback))).slice(0, 2)
}

function sanitizeReply(reply, mood) {
  const text = String(reply || '')
    .replace(/```(?:json)?[\s\S]*?```/gi, '')
    .replace(/\{\s*"reply"\s*:\s*"[\s\S]*?"\s*,\s*"mood"\s*:\s*"[\s\S]*?"\s*,\s*"quickActions"\s*:\s*\[[\s\S]*?\]\s*\}/g, '')
    .trim()
  if (!text) return fallbackReply(mood)
  if (bannedReplyPatterns.some((pattern) => pattern.test(text))) return fallbackReply(mood)
  return text
}

function normalizeOutput(value, fallbackMood, contextQuickActions) {
  const mood = validMoods.has(value?.mood) ? value.mood : fallbackMood
  const reply = sanitizeReply(value?.reply, mood)
  return {
    reply,
    mood,
    quickActions: normalizeQuickActions(contextQuickActions || value?.quickActions),
    source: 'hunyuan',
  }
}

function fallbackReply(mood = 'normal') {
  const replies = {
    happy: '今天照现在这套走就行，别加码。',
    tired: '今天吃简单点。鸡蛋、豆浆、酸奶或鸡肉饭里选一个，再喝点水。',
    low_energy: '先别加新任务。吃一顿正经饭，喝一杯水，后面就收住。',
    stressed: '现在只定下一餐。鸡肉饭、鸡蛋豆浆或清汤面加蛋，选一个就行。',
    puffy: '今天别点太咸的。晚点选鸡蛋、豆浆或清汤面，加一杯水。',
    normal: '可以，先给你一个能直接照做的选择。',
  }
  return replies[mood] || replies.normal
}

function buildContextPrompt(context) {
  if (!context || typeof context !== 'object') return ''
  return [
    '当前用户上下文：',
    context.nickname ? `昵称：${context.nickname}` : '',
    context.goal ? `目标：${context.goal}` : '',
    context.planTitle ? `当前方案：${context.planTitle}` : '',
    context.strategySummary ? `方案摘要：${context.strategySummary}` : '',
    context.riskLevel ? `风险等级：${context.riskLevel}` : '',
    context.todayFocus ? `今日重点：${context.todayFocus}` : '',
    context.todayAction ? `今日最小行动：${context.todayAction}` : '',
    context.lastAction ? `最近完成行动：${context.lastAction}` : '',
    context.lastActionNote ? `最近行动备注：${context.lastActionNote}` : '',
    context.glp1Dose ? `记录的 GLP-1 剂量：${context.glp1Dose}` : '',
    context.glp1NextDoseDate ? `下次提醒日期：${context.glp1NextDoseDate}` : '',
    context.timeOfDay ? `当前时间段：${context.timeOfDay}` : '',
    Number.isFinite(context.proteinGap) ? `蛋白缺口：${context.proteinGap}g` : '',
    Number.isFinite(context.waterGapCups) ? `饮水缺口：${context.waterGapCups}杯` : '',
    Array.isArray(context.quickActions) ? `当前快捷按钮：${context.quickActions.slice(0, 2).join(' / ')}` : '',
    '只能基于记录做饮食节律建议，不做医疗判断。',
  ].filter(Boolean).join('\n')
}

function getVoiceProfilePrompt(context) {
  const profileId = String(context?.voiceProfile || process.env.SHILY_DEFAULT_VOICE_PROFILE || defaultVoiceProfile)
  return voiceProfiles[profileId] || voiceProfiles[defaultVoiceProfile]
}

function parseModelContent(content, fallbackMood) {
  const raw = String(content || '').trim()
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1))
      } catch {
        // Fall through to sanitized text reply.
      }
    }

    return {
      reply: cleaned,
      mood: fallbackMood,
      quickActions: defaultQuickActions,
    }
  }
}

async function collectStreamText(response) {
  if (!response) return ''
  if (typeof response.text === 'string') return response.text
  if (typeof response.text === 'function') return await response.text()
  if (typeof response.content === 'string') return response.content
  if (typeof response.outputText === 'string') return response.outputText

  const stream = response.eventStream || response.stream
  if (response.textStream && typeof response.textStream[Symbol.asyncIterator] === 'function') {
    let text = ''
    for await (const chunk of response.textStream) {
      text += String(chunk || '')
    }
    return text
  }

  if (!stream || typeof stream[Symbol.asyncIterator] !== 'function') {
    const content = response?.choices?.[0]?.message?.content || response?.data?.choices?.[0]?.message?.content
    return content ? String(content) : ''
  }

  let text = ''
  for await (const event of stream) {
    const eventData = typeof event === 'string' ? event : event?.data
    if (!eventData || eventData === '[DONE]') {
      if (eventData === '[DONE]') break
      continue
    }

    try {
      const data = typeof eventData === 'string' ? JSON.parse(eventData) : eventData
      text += data?.choices?.[0]?.delta?.content || data?.choices?.[0]?.message?.content || ''
    } catch {
      text += String(eventData)
    }
  }
  return text
}

async function callCloudbaseAI(messages) {
  const app = cloudbase.init({
    env: CLOUDBASE_ENV,
    timeout: 60000,
  })
  const ai = app.ai()

  if (typeof ai.createModel === 'function') {
    const model = ai.createModel(AI_PROVIDER)
    return collectStreamText(await model.streamText({
      model: AI_MODEL,
      messages,
    }))
  }

  return collectStreamText(await ai.streamText({
    provider: AI_PROVIDER,
    model: AI_MODEL,
    messages,
  }))
}

exports.main = async (event) => {
  if (event?.httpMethod === 'OPTIONS') return json(204, {})
  if (event?.httpMethod && event.httpMethod !== 'POST') return json(405, { error: 'method not allowed' })

  const body = parseBody(event)
  const message = String(body.message || '').trim()
  const history = Array.isArray(body.history) ? body.history.slice(-12) : []
  const context = body.context || {}

  if (!message) return json(400, { error: 'message is required' })

  console.log('shily-chat message:', message)
  console.log('shily-chat ai:', `${AI_PROVIDER}/${AI_MODEL}`)

  const fallbackMood = detectMood(message)
  const contextPrompt = buildContextPrompt(context)
  const voiceProfilePrompt = getVoiceProfilePrompt(context)

  try {
    const content = await callCloudbaseAI([
      { role: 'system', content: systemPrompt },
      { role: 'system', content: voiceProfilePrompt },
      { role: 'system', content: stateModulation[fallbackMood] || stateModulation.normal },
      ...(contextPrompt ? [{ role: 'system', content: contextPrompt }] : []),
      ...history.map((item) => ({
        role: item.role === 'assistant' ? 'assistant' : 'user',
        content: String(item.content || ''),
      })),
      { role: 'user', content: message },
    ])
    const parsed = parseModelContent(content, fallbackMood)

    return json(200, normalizeOutput(parsed, fallbackMood, context.quickActions))
  } catch (error) {
    return json(200, {
      reply: fallbackReply(fallbackMood),
      mood: fallbackMood,
      quickActions: normalizeQuickActions(context.quickActions),
      source: 'fallback',
      errorMessage: error instanceof Error ? error.message : 'proxy error',
    })
  }
}
