import { Image, View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import GlassCard from '../../components/GlassCard'
import BottomTabBar from '../../components/BottomTabBar'
import CustomNavBar from '../../components/CustomNavBar'
import AppIcon, { AppIconName } from '../../components/AppIcon'
import { AiChatQuota, getAiQuotaTotal, readAiChatQuota } from '../../shily/aiQuota'
import { DEFAULT_SHILY_PLAN, ShilyPlanId, getShilyPlan } from '../../shily/plans'
import { ShilyProfile, defaultProfile, readShilyProfile } from '../../shily/profile'
import { ShilyDailyState, readShilyDailyState } from '../../shily/dailyState'
import { readShilyStrategy } from '../../shily/strategy'
import { uiAssets } from '../../shily/uiAssets'
import './index.scss'

const menuItems: Array<{ icon: AppIconName; label: string; path: string }> = [
  { icon: 'flag', label: '我的目标', path: '/pages/goal/index' },
  { icon: 'bell', label: '我的提醒', path: '/pages/reminder/index' },
  { icon: 'chart', label: '数据详情', path: '/pages/data/index' },
  { icon: 'settings', label: '资料与帮助', path: '/pages/settings/index' },
]

const menuIllustrationMap: Partial<Record<AppIconName, string>> = {
  flag: uiAssets.feature.stage,
  bell: uiAssets.feature.window,
  chart: uiAssets.feature.nutrition,
  settings: uiAssets.feature.help,
}

export default function Mine() {
  const [planId, setPlanId] = useState<ShilyPlanId>(DEFAULT_SHILY_PLAN)
  const [profile, setProfile] = useState<ShilyProfile>(defaultProfile)
  const [dailyState, setDailyState] = useState<ShilyDailyState | null>(null)
  const [aiQuota, setAiQuota] = useState<AiChatQuota>(readAiChatQuota())
  const plan = getShilyPlan(planId)
  const aiQuotaTotal = getAiQuotaTotal(aiQuota)

  useDidShow(() => {
    const nextProfile = readShilyProfile()
    const nextStrategy = readShilyStrategy()
    const nextPlan = (Taro.getStorageSync('shilyPlan') as ShilyPlanId) || DEFAULT_SHILY_PLAN
    setPlanId(nextPlan)
    setProfile(nextProfile)
    setDailyState(readShilyDailyState(nextProfile, nextPlan, nextStrategy))
    setAiQuota(readAiChatQuota())
  })

  return (
    <View className='page mine-page'>
      <CustomNavBar title='我的' />

      <View className='page-content'>
        <GlassCard className='profile-card'>
          <View className='profile-avatar'>
            <Image className='profile-avatar-image' src={uiAssets.shily.main} mode='aspectFit' />
          </View>
          <View className='profile-info'>
            <Text className='profile-name'>{profile.nickname || '小禾'}</Text>
            <Text className='profile-days'>Shily 陪伴你 {dailyState?.companionDays || 1} 天</Text>
            <Text className='profile-streak'>
              {dailyState?.stableRecordDays ? `已稳定记录 ${dailyState.stableRecordDays} 天` : '今日状态已同步'}
            </Text>
          </View>
        </GlassCard>

        <GlassCard className='hub-card' variant='tint'>
          <View className='hub-head'>
            <Text className='hub-title'>方案与分享</Text>
            <Text className='hub-desc'>这里管理节律方案和分享卡，个人资料放在“资料与帮助”。</Text>
          </View>

          <View className='hub-action' onClick={() => wx.navigateTo({ url: '/pages/plan/index' })}>
            <View className='hub-icon'>
              <Image className='hub-illustration' src={uiAssets.feature.plan} mode='aspectFit' />
            </View>
            <View className='hub-copy'>
              <Text className='hub-action-title'>我的节律方案</Text>
              <Text className='hub-action-desc'>{plan.title} · 今日偏向 {plan.focus}</Text>
            </View>
            <AppIcon name='chevron-right' size={24} tone='muted' />
          </View>

          <View className='hub-action' onClick={() => wx.navigateTo({ url: '/pages/share/index' })}>
            <View className='hub-icon'>
              <Image className='hub-illustration' src={uiAssets.shily.heart} mode='aspectFit' />
            </View>
            <View className='hub-copy'>
              <Text className='hub-action-title'>生成分享卡</Text>
              <Text className='hub-action-desc'>保存卡片后，再发给微信好友或群聊</Text>
            </View>
            <AppIcon name='chevron-right' size={24} tone='muted' />
          </View>
        </GlassCard>

        <GlassCard className='ai-usage-card' variant='tint'>
          <View className='ai-usage-content'>
            <Text className='ai-usage-title'>今日 Shily 建议</Text>
            <Text className='ai-usage-desc'>每天 5 次，优先用在外卖、下一餐和吃不下的时候。</Text>
          </View>
          <View className='ai-usage-pill'>
            <Text>{aiQuota.remaining}/{aiQuotaTotal}</Text>
          </View>
        </GlassCard>

        <GlassCard className='menu-list'>
          {menuItems.map((item) => (
            <View
              key={item.label}
              className='menu-item'
              onClick={() => item.path && wx.navigateTo({ url: item.path })}
            >
              <View className='menu-left'>
                <View className='menu-icon'>
                  <Image className='menu-illustration' src={menuIllustrationMap[item.icon] || uiAssets.feature.record} mode='aspectFit' />
                </View>
                <Text className='menu-label'>{item.label}</Text>
              </View>
              <View className='menu-arrow'>
                <AppIcon name='chevron-right' size={24} tone='muted' />
              </View>
            </View>
          ))}
        </GlassCard>

        <View className='brand-note'>
          <View className='brand-note-main'>
            <View className='brand-logo'>
              <Image className='brand-logo-image' src={uiAssets.shily.main} mode='aspectFit' />
            </View>
            <View className='brand-copy'>
              <Text className='brand-title'>Shily 使用范围</Text>
              <Text className='brand-footnote'>根据你的方案、记录和今日状态，整理下一餐、喝水、蛋白和节律重点。</Text>
              <Text className='brand-footnote'>GLP-1/GIP 用户仅作日常饮食支持参考，不替代医生、营养师或药品说明，不做诊断。</Text>
            </View>
          </View>
          <View className='brand-tags'>
            <View className='brand-tag'>
              <AppIcon name='notebook' size={22} tone='active' />
              <Text>记录参考</Text>
            </View>
            <View className='brand-tag'>
              <AppIcon name='cloud' size={22} tone='active' />
              <Text>饮食建议</Text>
            </View>
            <View className='brand-tag'>
              <AppIcon name='settings' size={22} tone='active' />
              <Text>GLP-1支持</Text>
            </View>
          </View>
        </View>
      </View>

      <BottomTabBar />
    </View>
  )
}
