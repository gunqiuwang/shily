import Taro from '@tarojs/taro'

export type ShilyVoiceProfileId = 'direct' | 'warm' | 'coach' | 'analytic' | 'light'

export interface ShilyVoiceProfile {
  id: ShilyVoiceProfileId
  title: string
  description: string
}

export const DEFAULT_SHILY_VOICE_PROFILE: ShilyVoiceProfileId = 'direct'

export const shilyVoiceProfiles: Record<ShilyVoiceProfileId, ShilyVoiceProfile> = {
  direct: {
    id: 'direct',
    title: '清爽直接型',
    description: '少废话，先给结论和下一步。',
  },
  warm: {
    id: 'warm',
    title: '温和陪伴型',
    description: '更温和，但不装亲密。',
  },
  coach: {
    id: 'coach',
    title: '教练推动型',
    description: '更有推动感，帮你抓重点。',
  },
  analytic: {
    id: 'analytic',
    title: '理性分析型',
    description: '更偏数据、原因和优先级。',
  },
  light: {
    id: 'light',
    title: '轻松一点型',
    description: '表达更轻松，但不油腻。',
  },
}

const storageKey = 'shilyVoiceProfile'

export function isShilyVoiceProfileId(value: unknown): value is ShilyVoiceProfileId {
  return typeof value === 'string' && value in shilyVoiceProfiles
}

export function readShilyVoiceProfile(): ShilyVoiceProfileId {
  const stored = Taro.getStorageSync(storageKey)
  return isShilyVoiceProfileId(stored) ? stored : DEFAULT_SHILY_VOICE_PROFILE
}

export function saveShilyVoiceProfile(profileId: ShilyVoiceProfileId) {
  Taro.setStorageSync(storageKey, profileId)
}
