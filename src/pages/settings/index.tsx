import { Image, Input, Picker, Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import CustomNavBar from '../../components/CustomNavBar'
import GlassCard from '../../components/GlassCard'
import PrimaryButton from '../../components/PrimaryButton'
import { DEFAULT_SHILY_PLAN, ShilyPlanId, getShilyPlan } from '../../shily/plans'
import { ShilyProfile, defaultProfile, readShilyProfile } from '../../shily/profile'
import { ShilyStrategyConfig, defaultStrategyConfig, getRiskInfo, getStrategySummary, readShilyStrategy } from '../../shily/strategy'
import { uiAssets } from '../../shily/uiAssets'
import './index.scss'

const heightOptions = Array.from({ length: 71 }, (_, index) => `${140 + index} cm`)
const weightOptions = Array.from({ length: 181 }, (_, index) => `${(40 + index * 0.5).toFixed(index % 2 === 0 ? 0 : 1)} kg`)
const targetWeightOptions = weightOptions
const defaultHeightIndex = 20
const defaultWeightIndex = 30

function stripUnit(value: string) {
  return value.replace(/[^\d.]/g, '')
}

function getPickerIndex(options: string[], value?: number, fallback = 0) {
  if (!value) return fallback
  const index = options.findIndex((item) => Number(stripUnit(item)) === value)
  return index >= 0 ? index : fallback
}

export default function Settings() {
  const [profile, setProfile] = useState<ShilyProfile>(defaultProfile)
  const [strategy, setStrategy] = useState<ShilyStrategyConfig>(defaultStrategyConfig)
  const [planId, setPlanId] = useState<ShilyPlanId>(DEFAULT_SHILY_PLAN)

  useDidShow(() => {
    const nextProfile = readShilyProfile()
    const nextStrategy = readShilyStrategy()
    setProfile(nextProfile)
    setStrategy(nextStrategy)
    setPlanId((Taro.getStorageSync('shilyPlan') as ShilyPlanId) || nextStrategy.planId || DEFAULT_SHILY_PLAN)
  })

  const plan = getShilyPlan(planId)
  const risk = getRiskInfo(strategy)

  const saveProfile = () => {
    const nextProfile = {
      ...profile,
      nickname: profile.nickname.trim() || '小禾',
      completedAt: profile.completedAt || Date.now(),
    }
    Taro.setStorageSync('shilyProfile', nextProfile)
    setProfile(nextProfile)
    Taro.showToast({ title: '已更新', icon: 'none' })
  }

  return (
    <View className='page settings-page'>
      <CustomNavBar title='资料与帮助' showBack onBack={() => Taro.navigateBack()} />

      <View className='page-content settings-content'>
        <GlassCard className='settings-card' variant='tint'>
          <Image className='settings-card-illustration settings-card-illustration--hero' src={uiAssets.shily.main} mode='aspectFit' />
          <Text className='settings-kicker'>基础资料</Text>
          <Input
            className='settings-input'
            value={profile.nickname}
            placeholder='昵称'
            maxlength={12}
            onInput={(event) => setProfile({ ...profile, nickname: String(event.detail.value) })}
          />
          <View className='settings-picker-grid'>
            <Picker
              mode='selector'
              range={heightOptions}
              value={getPickerIndex(heightOptions, profile.heightCm, defaultHeightIndex)}
              onChange={(event) => setProfile({ ...profile, heightCm: Number(stripUnit(heightOptions[Number(event.detail.value)])) })}
            >
              <View className='settings-picker'>
                <Text>身高</Text>
                <Text>{profile.heightCm ? `${profile.heightCm} cm` : '选择'}</Text>
              </View>
            </Picker>
            <Picker
              mode='selector'
              range={weightOptions}
              value={getPickerIndex(weightOptions, profile.weightKg, defaultWeightIndex)}
              onChange={(event) => setProfile({ ...profile, weightKg: Number(stripUnit(weightOptions[Number(event.detail.value)])) })}
            >
              <View className='settings-picker'>
                <Text>体重</Text>
                <Text>{profile.weightKg ? `${profile.weightKg} kg` : '选择'}</Text>
              </View>
            </Picker>
          </View>
          <Picker
            mode='selector'
            range={targetWeightOptions}
            value={getPickerIndex(targetWeightOptions, profile.targetWeightKg, Math.max(0, defaultWeightIndex - 8))}
            onChange={(event) => setProfile({ ...profile, targetWeightKg: Number(stripUnit(targetWeightOptions[Number(event.detail.value)])) })}
          >
            <View className='settings-picker settings-picker--full'>
              <Text>目标体重</Text>
              <Text>{profile.targetWeightKg ? `${profile.targetWeightKg} kg` : '可选'}</Text>
            </View>
          </Picker>
          <PrimaryButton onClick={saveProfile}>保存资料</PrimaryButton>
        </GlassCard>

        <GlassCard className='settings-card'>
          <Image className='settings-card-illustration' src={uiAssets.feature.plan} mode='aspectFit' />
          <Text className='settings-kicker'>当前节律</Text>
          <Text className='settings-title'>{plan.title}</Text>
          <Text className='settings-desc'>{getStrategySummary(strategy)}</Text>
          <Text className='settings-desc'>今日偏向：{plan.focus}</Text>
        </GlassCard>

        <GlassCard className={`settings-card risk-card risk-card--${risk.level}`}>
          <Image className='settings-card-illustration' src={uiAssets.feature.help} mode='aspectFit' />
          <Text className='settings-kicker'>风险边界</Text>
          <Text className='settings-title'>{risk.title}</Text>
          <Text className='settings-desc'>{risk.text}</Text>
        </GlassCard>

        <GlassCard className='settings-card'>
          <Image className='settings-card-illustration' src={uiAssets.feature.record} mode='aspectFit' />
          <Text className='settings-kicker'>功能说明</Text>
          <Text className='settings-desc'>节律方案、分享卡、提醒和记录入口都放在主页面管理。这里仅保留个人资料与判断边界，避免重复入口。</Text>
        </GlassCard>
      </View>
    </View>
  )
}
