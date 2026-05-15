import { Image, View, Text, Textarea, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useEffect, useRef, useState } from 'react'
import AppIcon from '../../components/AppIcon'
import BottomTabBar from '../../components/BottomTabBar'
import CustomNavBar from '../../components/CustomNavBar'
import GlassCard from '../../components/GlassCard'
import { ShilyChatMood, sendShilyChatMessage } from '../../services/shilyChat'
import { ShilyActionType, getTodayAction } from '../../shily/actions'
import { AiChatQuota, consumeAiChatQuota, getAiQuotaExhaustedText, getAiQuotaTotal, readAiChatQuota } from '../../shily/aiQuota'
import { buildDailyInput } from '../../shily/calculations'
import { ShilyDailyState, readShilyDailyState } from '../../shily/dailyState'
import { DEFAULT_SHILY_PLAN, ShilyPlanId, getShilyPlan } from '../../shily/plans'
import { ShilyProfile, defaultProfile, readShilyProfile } from '../../shily/profile'
import { defaultQuickActions, generateDynamicQuickActions, getDynamicQuickActionMeta } from '../../shily/quickActions'
import { ShilyStrategyConfig, defaultStrategyConfig, getRiskInfo, getStrategySummary, readShilyStrategy } from '../../shily/strategy'
import { uiAssets } from '../../shily/uiAssets'
import { DEFAULT_SHILY_VOICE_PROFILE, ShilyVoiceProfileId, readShilyVoiceProfile } from '../../shily/voice'
import './index.scss'

type ShilyChatState = 'idle' | 'thinking' | 'responding'
type MessageTone = 'soft' | 'bright' | 'slow' | 'grounded'
type BackgroundMood = 'neutral' | 'warm' | 'cool' | 'dim'

interface ShilyUIState {
  mood: ShilyChatMood
  intensity: 1 | 2
  messageTone: MessageTone
  backgroundMood: BackgroundMood
}

interface Message {
  id: number
  role: 'user' | 'assistant'
  text: string
}

const initialReply = '直接问这一餐、外卖或今天怎么安排。'
const initialMessages: Message[] = []
const thinkingReply = '我看一下今天的记录和方案。'
const maxVisibleHistory = 20
const quickActionIllustrations = [
  uiAssets.feature.meal,
  uiAssets.feature.takeout,
]

const shilyMoodImages: Record<ShilyChatMood, string> = {
  normal: uiAssets.shily.state.normal,
  happy: uiAssets.shily.state.happy,
  tired: uiAssets.shily.state.tired,
  puffy: uiAssets.shily.state.puffy,
  low_energy: uiAssets.shily.state.lowEnergy,
  stressed: uiAssets.shily.state.stressed,
}

const moodToneMap: Record<ShilyChatMood, Pick<ShilyUIState, 'messageTone' | 'backgroundMood'>> = {
  normal: {
    messageTone: 'soft',
    backgroundMood: 'neutral',
  },
  happy: {
    messageTone: 'bright',
    backgroundMood: 'warm',
  },
  tired: {
    messageTone: 'slow',
    backgroundMood: 'dim',
  },
  low_energy: {
    messageTone: 'slow',
    backgroundMood: 'dim',
  },
  stressed: {
    messageTone: 'grounded',
    backgroundMood: 'cool',
  },
  puffy: {
    messageTone: 'soft',
    backgroundMood: 'cool',
  },
}

const normalUIState: ShilyUIState = {
  mood: 'normal',
  intensity: 1,
  ...moodToneMap.normal,
}

export default function Chat() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [shilyState, setShilyState] = useState<ShilyChatState>('idle')
  const [uiState, setUiState] = useState<ShilyUIState>(normalUIState)
  const [mainReply, setMainReply] = useState(initialReply)
  const [quickActions, setQuickActions] = useState(defaultQuickActions)
  const [isSending, setIsSending] = useState(false)
  const [profile, setProfile] = useState<ShilyProfile>(defaultProfile)
  const [planId, setPlanId] = useState<ShilyPlanId>(DEFAULT_SHILY_PLAN)
  const [strategyConfig, setStrategyConfig] = useState<ShilyStrategyConfig>(defaultStrategyConfig)
  const [voiceProfile, setVoiceProfile] = useState<ShilyVoiceProfileId>(DEFAULT_SHILY_VOICE_PROFILE)
  const [dailyState, setDailyState] = useState<ShilyDailyState | null>(null)
  const [proteinDone, setProteinDone] = useState(false)
  const [completedActions, setCompletedActions] = useState<ShilyActionType[]>([])
  const [quickActionVersion, setQuickActionVersion] = useState(0)
  const [quickActionsRefreshing, setQuickActionsRefreshing] = useState(false)
  const [aiQuota, setAiQuota] = useState<AiChatQuota>(readAiChatQuota())
  const [scrollTarget, setScrollTarget] = useState('')
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const moodDecayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const quickActionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hasConversation = messages.length > 0
  const visibleMessages = messages
  const recentMessages = visibleMessages.slice(-maxVisibleHistory)
  const hasMoreHistory = visibleMessages.length > maxVisibleHistory
  const displayedQuickActions = quickActions.slice(0, 2)
  const aiQuotaTotal = getAiQuotaTotal(aiQuota)
  const shilyImageSrc = !hasConversation && !isSending
    ? uiAssets.shily.state.happy
    : isSending
      ? uiAssets.shily.state.normal
      : shilyState === 'responding'
        ? uiAssets.shily.state.happy
        : input.trim()
          ? uiAssets.shily.state.normal
          : shilyMoodImages[uiState.mood] || uiAssets.shily.state.normal
  const shilyAvatarSrc = uiAssets.shily.state.happy

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      if (moodDecayTimerRef.current) clearTimeout(moodDecayTimerRef.current)
      if (quickActionTimerRef.current) clearTimeout(quickActionTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!hasConversation) return
    const timer = setTimeout(() => {
      setScrollTarget('chat-bottom-anchor')
    }, 60)
    return () => clearTimeout(timer)
  }, [hasConversation, messages.length, isSending])

  const refreshQuickActions = (mood: ShilyChatMood, nextDailyState = dailyState) => {
    const nextQuickActions = generateDynamicQuickActions({
      mood,
      dailyInput: nextDailyState?.dailyInput,
      dailyState: nextDailyState || undefined,
    })
    setQuickActions(nextQuickActions)
    setQuickActionVersion((prev) => prev + 1)
    setQuickActionsRefreshing(true)
    if (quickActionTimerRef.current) clearTimeout(quickActionTimerRef.current)
    quickActionTimerRef.current = setTimeout(() => {
      setQuickActionsRefreshing(false)
      quickActionTimerRef.current = null
    }, 360)
    return nextQuickActions
  }

  useDidShow(() => {
    const nextProfile = readShilyProfile()
    const nextStrategy = readShilyStrategy()
    const nextPlan = (Taro.getStorageSync('shilyPlan') as ShilyPlanId) || nextStrategy.planId || DEFAULT_SHILY_PLAN
    const nextDailyState = readShilyDailyState(nextProfile, nextPlan, nextStrategy)
    setProfile(nextProfile)
    setStrategyConfig(nextStrategy)
    setPlanId(nextPlan)
    setDailyState(nextDailyState)
    setVoiceProfile(readShilyVoiceProfile())
    setAiQuota(readAiChatQuota())
    setProteinDone(Boolean(Taro.getStorageSync('shilyProteinBoostDone')))
    const todayKey = new Date().toISOString().slice(0, 10)
    setCompletedActions((Taro.getStorageSync(`shilyCompletedActions:${todayKey}`) as ShilyActionType[]) || [])
    refreshQuickActions(uiState.mood, nextDailyState)
  })

  useEffect(() => {
    if (shilyState !== 'responding') return
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => {
      setShilyState('idle')
      idleTimerRef.current = null
    }, 1400)
  }, [shilyState])

  const applyMood = (mood: ShilyChatMood) => {
    const nextState: ShilyUIState = {
      mood,
      intensity: mood === 'normal' ? 1 : 2,
      ...moodToneMap[mood],
    }

    setUiState(nextState)
    refreshQuickActions(mood)

    if (moodDecayTimerRef.current) clearTimeout(moodDecayTimerRef.current)
    if (mood !== 'normal') {
      moodDecayTimerRef.current = setTimeout(() => {
        setUiState(normalUIState)
        refreshQuickActions('normal')
        moodDecayTimerRef.current = null
      }, 90000)
    }
  }

  const handleSend = async (presetText?: string) => {
    if (isSending) return

    const text = (presetText || input).trim()
    if (!text) return

    const quotaResult = consumeAiChatQuota()
    setAiQuota(quotaResult.quota)
    if (!quotaResult.ok) {
      const exhaustedText = getAiQuotaExhaustedText()
      setMainReply(exhaustedText)
      setShilyState('responding')
      Taro.showToast({ title: '今日建议次数已用完', icon: 'none' })
      return
    }

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)

    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text }])
    setInput('')
    setMainReply(thinkingReply)
    setShilyState('thinking')
    setIsSending(true)

    try {
      const history = messages.map((msg) => ({
        role: msg.role,
        content: msg.text,
      }))
      const dailyInput = dailyState?.dailyInput || buildDailyInput(profile, planId, strategyConfig)
      const dynamicMeta = getDynamicQuickActionMeta({ dailyInput, dailyState: dailyState || undefined })
      const currentQuickActions = generateDynamicQuickActions({
        mood: uiState.mood,
        dailyInput,
        dailyState: dailyState || undefined,
      })
      const proteinBoostDone = proteinDone && planId === 'fat_loss'
      const todayAction = getTodayAction(dailyInput, planId, proteinBoostDone, completedActions)
      const plan = getShilyPlan(planId)
      const risk = getRiskInfo(strategyConfig)
      const lastAction = Taro.getStorageSync('shilyLastActionFlow') as { option?: { title?: string }; note?: string } | undefined
      const result = await sendShilyChatMessage({
        message: text,
        history,
        context: {
          nickname: profile.nickname,
          goal: profile.goal,
          planTitle: plan.title,
          strategySummary: getStrategySummary(strategyConfig),
          riskLevel: risk.level,
          todayFocus: todayAction.focus,
          todayAction: todayAction.label,
          lastAction: lastAction?.option?.title,
          lastActionNote: lastAction?.note,
          glp1Dose: strategyConfig.glp1?.doseText,
          glp1NextDoseDate: strategyConfig.glp1?.nextDoseDate,
          voiceProfile,
          timeOfDay: dynamicMeta.timeOfDay,
          proteinGap: dynamicMeta.proteinGap,
          waterGapCups: dynamicMeta.waterGapCups,
          quickActions: currentQuickActions,
        },
      })
      const visibleReply = result.source === 'fallback' && result.errorMessage
        ? `Shily 暂时没接上：${result.errorMessage}`
        : result.reply
      if (result.source === 'fallback' && result.errorMessage) {
        Taro.showToast({ title: `Shily 暂时没接上：${result.errorMessage.slice(0, 18)}`, icon: 'none' })
      }
      applyMood(result.mood)
      setMainReply(visibleReply)
      refreshQuickActions(result.mood)
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'assistant', text: visibleReply }])
      setShilyState('responding')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <View className={`page shily-page shily-page--${uiState.mood} shily-page--${uiState.backgroundMood}`}>
      <CustomNavBar title='Shily' />

      <ScrollView
        className={`page-content shily-content ${hasConversation ? 'shily-content--conversation' : ''}`}
        scrollY
        scrollIntoView={scrollTarget}
        scrollWithAnimation
      >
        {!hasConversation && (
          <View className='chat-intro'>
            <View className={`chat-hero chat-hero--${shilyState} chat-hero--${uiState.mood} ${quickActionsRefreshing ? 'chat-hero--quick-refresh' : ''}`}>
              <View className='chat-hero-shily'>
                <Image className='chat-hero-image' src={shilyImageSrc} mode='aspectFit' />
              </View>
            </View>

            <View className='chat-greeting'>
              <Text className='chat-greeting-hi'>Hi，{profile.nickname || '小禾'}</Text>
              <Text className='chat-greeting-title'>Shily 已经准备好了</Text>
              <Text className='chat-greeting-sub'>选一句开始，我来帮你把下一步定清楚。</Text>
            </View>

            <GlassCard className={`ai-main-card ai-main-card--${shilyState} ai-main-card--tone-${uiState.messageTone}`}>
              <Text className='main-reply-kicker'>现在可以这样安排</Text>
              <Text className='main-reply-line'>{mainReply}</Text>
            </GlassCard>

          </View>
        )}

        {hasConversation && (
          <View className='chat-presence'>
            <Image className='chat-presence-image' src={shilyImageSrc} mode='aspectFit' />
            <View className='chat-presence-copy'>
              <Text className='chat-presence-title'>Shily</Text>
              <Text className='chat-presence-sub'>按今天的方案，帮你定下一步</Text>
            </View>
          </View>
        )}

        {recentMessages.length > 0 && (
          <View className='conversation-surface'>
            {hasMoreHistory && <Text className='history-hint'>前面的对话已收起</Text>}
            {recentMessages.map((msg) => (
              <View key={msg.id} className={`chat-message-row chat-message-row--${msg.role}`}>
                {msg.role === 'assistant' && <Image className='chat-message-avatar' src={shilyAvatarSrc} mode='aspectFit' />}
                <View className={`chat-bubble chat-bubble--${msg.role}`}>
                  <Text>{msg.text}</Text>
                </View>
              </View>
            ))}
            {isSending && (
              <View className='chat-message-row chat-message-row--assistant'>
                <Image className='chat-message-avatar' src={uiAssets.shily.state.normal} mode='aspectFit' />
                <View className='chat-bubble chat-bubble--assistant chat-bubble--thinking'>
                  <Text>{thinkingReply}</Text>
                </View>
              </View>
            )}
            <View id='chat-bottom-anchor' className='chat-bottom-anchor' />
          </View>
        )}

        <View className='ai-quota-note'>
          <Text>今日建议 {aiQuota.remaining}/{aiQuotaTotal} 次</Text>
        </View>
      </ScrollView>

      <View className={`chat-bottom-panel ${hasConversation ? '' : 'chat-bottom-panel--intro'}`}>
          <View className={`quick-actions quick-actions--${uiState.mood} ${quickActionsRefreshing ? 'quick-actions--refreshing' : ''}`}>
            {displayedQuickActions.map((action, index) => (
              <View
                key={`${quickActionVersion}-${action}`}
                className={`quick-chip ${isSending ? 'quick-chip--disabled' : ''}`}
                onClick={() => handleSend(action)}
              >
                <Image className='quick-chip-illustration' src={quickActionIllustrations[index] || quickActionIllustrations[0]} mode='aspectFit' />
                <View className='quick-chip-copy'>
                  <Text className='quick-chip-title'>{action}</Text>
                  <Text className='quick-chip-desc'>{index === 0 ? '吃得舒服又稳' : '先定下一步'}</Text>
                </View>
              </View>
            ))}
          </View>

          <View className='chat-input-wrap'>
            <View className='chat-input-box'>
              <Textarea
                className='chat-input'
                placeholder='和 Shily 说点什么吧'
                value={input}
                autoHeight
                maxlength={300}
                onInput={(event) => setInput(event.detail.value)}
              />
            </View>
            <View className={`send-btn ${isSending ? 'send-btn--disabled' : ''}`} onClick={() => handleSend()}>
              <AppIcon name='send' size={34} tone='white' />
            </View>
          </View>
        </View>

      <BottomTabBar />
    </View>
  )
}
