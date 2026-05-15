import Taro from '@tarojs/taro'
import { AI_CHAT_DAILY_FREE_LIMIT, REWARDED_AI_CHAT_GRANT } from './monetization'

const AI_CHAT_QUOTA_KEY = 'shilyAiChatQuota'

export interface AiChatQuota {
  date: string
  freeLimit: number
  used: number
  rewardedGranted: number
  remaining: number
}

interface StoredAiChatQuota {
  date?: string
  used?: number
  rewardedGranted?: number
}

function getLocalDateKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = `${now.getMonth() + 1}`.padStart(2, '0')
  const date = `${now.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${date}`
}

function normalizeQuota(stored?: StoredAiChatQuota): AiChatQuota {
  const today = getLocalDateKey()
  const isToday = stored?.date === today
  const used = isToday ? Math.max(0, Number(stored?.used || 0)) : 0
  const rewardedGranted = isToday ? Math.max(0, Number(stored?.rewardedGranted || 0)) : 0
  const totalLimit = AI_CHAT_DAILY_FREE_LIMIT + rewardedGranted

  return {
    date: today,
    freeLimit: AI_CHAT_DAILY_FREE_LIMIT,
    used,
    rewardedGranted,
    remaining: Math.max(0, totalLimit - used),
  }
}

function writeQuota(quota: AiChatQuota) {
  Taro.setStorageSync(AI_CHAT_QUOTA_KEY, {
    date: quota.date,
    used: quota.used,
    rewardedGranted: quota.rewardedGranted,
  })
}

export function readAiChatQuota(): AiChatQuota {
  const quota = normalizeQuota(Taro.getStorageSync(AI_CHAT_QUOTA_KEY) as StoredAiChatQuota | undefined)
  writeQuota(quota)
  return quota
}

export function consumeAiChatQuota(): { ok: boolean; quota: AiChatQuota } {
  const current = readAiChatQuota()
  if (current.remaining <= 0) {
    return { ok: false, quota: current }
  }

  const next = normalizeQuota({
    date: current.date,
    used: current.used + 1,
    rewardedGranted: current.rewardedGranted,
  })
  writeQuota(next)
  return { ok: true, quota: next }
}

export function grantRewardedAiChats(count = REWARDED_AI_CHAT_GRANT): AiChatQuota {
  const current = readAiChatQuota()
  const next = normalizeQuota({
    date: current.date,
    used: current.used,
    rewardedGranted: current.rewardedGranted + Math.max(0, count),
  })
  writeQuota(next)
  return next
}

export function getAiQuotaTotal(quota: AiChatQuota) {
  return quota.freeLimit + quota.rewardedGranted
}

export function getAiQuotaExhaustedText() {
  return `今天 ${AI_CHAT_DAILY_FREE_LIMIT} 次 AI 建议已经用完。先按首页建议执行，明天会自动恢复 ${AI_CHAT_DAILY_FREE_LIMIT} 次。`
}
