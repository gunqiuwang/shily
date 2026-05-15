export const AI_CHAT_DAILY_FREE_LIMIT = 50

export const REWARDED_AI_CHAT_GRANT = 5

export const shilyAdStrategy = {
  splashEnabled: false,
  rewardedVideoEnabled: false,
  rewardedVideoAdUnitId: '',
}

export function isRewardedAiUnlockEnabled() {
  return Boolean(shilyAdStrategy.rewardedVideoEnabled && shilyAdStrategy.rewardedVideoAdUnitId)
}
