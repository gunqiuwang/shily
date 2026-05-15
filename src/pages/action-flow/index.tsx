import { Input, ScrollView, Text, View } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useMemo, useState } from 'react'
import CustomNavBar from '../../components/CustomNavBar'
import GlassCard from '../../components/GlassCard'
import PrimaryButton from '../../components/PrimaryButton'
import SecondaryButton from '../../components/SecondaryButton'
import ShilyAvatar, { ShilyAvatarMood } from '../../components/ShilyAvatar'
import { ShilyActionType } from '../../shily/actions'
import './index.scss'

type FlowType = 'glp1' | 'fasting' | 'carb' | 'muscle'

interface FlowOption {
  id: string
  title: string
  desc: string
  meta: string
}

interface FlowConfig {
  type: FlowType
  title: string
  kicker: string
  subtitle: string
  mood: ShilyAvatarMood
  actionType: ShilyActionType
  options: FlowOption[]
  notePlaceholder: string
  saveLabel: string
}

const flowConfigs: Record<FlowType, FlowConfig> = {
  glp1: {
    type: 'glp1',
    title: '用药后状态记录',
    kicker: '记录用药后的状态',
    subtitle: '记录食欲、舒适感和补给情况，不做医疗判断。',
    mood: 'normal',
    actionType: 'glp1_small_protein',
    notePlaceholder: '比如：今天食欲低，喝水还可以',
    saveLabel: '记录这次感受',
    options: [
      { id: 'comfort', title: '舒适感还可以', desc: '没有明显不舒服', meta: '已记录' },
      { id: 'low-appetite', title: '食欲比较低', desc: '先照顾水分和少量蛋白', meta: '温和优先' },
      { id: 'stomach', title: '胃有点胀', desc: '今天少量多次，不硬撑', meta: '观察一下' },
    ],
  },
  fasting: {
    type: 'fasting',
    title: '稳住进食窗口',
    kicker: '今天不用硬卡',
    subtitle: '选择一个今天最容易做到的安排，身体不舒服就放宽。',
    mood: 'normal',
    actionType: 'fasting_window',
    notePlaceholder: '比如：今天晚饭想早点结束',
    saveLabel: '记录今天窗口',
    options: [
      { id: 'steady', title: '按计划来', desc: '保持当前窗口，不额外加压', meta: '稳定' },
      { id: 'soften', title: '稍微放宽', desc: '身体累的时候，先吃稳一点', meta: '更温和' },
      { id: 'protein-first', title: '窗口内补蛋白', desc: '先保证一小份蛋白和水分', meta: '不空撑' },
    ],
  },
  carb: {
    type: 'carb',
    title: '选一份轻控碳',
    kicker: '主食少一点，不是不能吃',
    subtitle: '从三个简单组合里选一个，保留蛋白和蔬菜。',
    mood: 'happy',
    actionType: 'low_carb_meal',
    notePlaceholder: '比如：晚餐想清淡一点',
    saveLabel: '记录这个选择',
    options: [
      { id: 'tofu-veg', title: '豆腐 + 蔬菜', desc: '清淡一点，负担小', meta: '温和控碳' },
      { id: 'fish-salad', title: '鱼肉 + 沙拉', desc: '蛋白更稳，主食少一点', meta: '低碳餐' },
      { id: 'egg-soup', title: '鸡蛋 + 清汤', desc: '适合不太饿的时候', meta: '轻一点' },
    ],
  },
  muscle: {
    type: 'muscle',
    title: '照顾训练和恢复',
    kicker: '增肌先别吃太少',
    subtitle: '今天只保留一个低负担行动：补蛋白、记录训练或安排恢复。',
    mood: 'happy',
    actionType: 'muscle_recovery',
    notePlaceholder: '比如：今天练了下肢，晚上想补点蛋白',
    saveLabel: '记录这个安排',
    options: [
      { id: 'protein', title: '补一份蛋白', desc: '训练日先把蛋白稳住', meta: '优先' },
      { id: 'training', title: '记录一次训练', desc: '不用很细，先记下来', meta: '已行动' },
      { id: 'recovery', title: '早点恢复', desc: '今天先睡稳，别硬撑', meta: '恢复' },
    ],
  },
}

function normalizeType(type?: string): FlowType {
  if (type === 'glp1' || type === 'fasting' || type === 'carb' || type === 'muscle') return type
  return 'glp1'
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function markActionCompleted(actionType: ShilyActionType) {
  const key = `shilyCompletedActions:${todayKey()}`
  const current = (Taro.getStorageSync(key) as ShilyActionType[]) || []
  if (!current.includes(actionType)) {
    Taro.setStorageSync(key, [...current, actionType])
  }
}

export default function ActionFlow() {
  const router = useRouter()
  const type = normalizeType(router.params.type)
  const config = flowConfigs[type]
  const [selectedId, setSelectedId] = useState(config.options[0].id)
  const [note, setNote] = useState('')
  const selected = useMemo(
    () => config.options.find((item) => item.id === selectedId) || config.options[0],
    [config.options, selectedId],
  )

  const save = () => {
    const payload = {
      type,
      actionType: config.actionType,
      option: selected,
      note,
      createdAt: Date.now(),
    }
    Taro.setStorageSync(`shilyActionFlow:${type}`, payload)
    Taro.setStorageSync('shilyLastActionFlow', payload)
    markActionCompleted(config.actionType)
    Taro.navigateTo({ url: `/pages/action-complete/index?type=${type}` })
  }

  return (
    <View className='page action-flow-page'>
      <CustomNavBar title={config.title} showBack onBack={() => Taro.navigateBack()} />

      <ScrollView className='page-content action-flow-content' scrollY enhanced bounces={false} showScrollbar={false}>
        <GlassCard className='action-hero' variant='tint'>
          <View className='action-hero-copy'>
            <Text className='action-kicker'>{config.kicker}</Text>
            <Text className='action-title'>{config.subtitle}</Text>
          </View>
          <ShilyAvatar mood={config.mood} size='small' />
        </GlassCard>

        <View className='action-option-list'>
          {config.options.map((item) => (
            <GlassCard
              key={item.id}
              className={`action-option ${selectedId === item.id ? 'action-option--active' : ''}`}
              onClick={() => setSelectedId(item.id)}
            >
              <View className='action-option-copy'>
                <Text className='action-option-title'>{item.title}</Text>
                <Text className='action-option-desc'>{item.desc}</Text>
              </View>
              <Text className='action-option-meta'>{item.meta}</Text>
            </GlassCard>
          ))}
        </View>

        <GlassCard className='action-note-card'>
          <Text className='action-note-title'>补一句感受</Text>
          <Input
            className='action-note-input'
            value={note}
            placeholder={config.notePlaceholder}
            maxlength={40}
            onInput={(event) => setNote(String(event.detail.value))}
          />
        </GlassCard>

        <View className='action-flow-actions'>
          <PrimaryButton onClick={save}>{config.saveLabel}</PrimaryButton>
          <SecondaryButton onClick={() => Taro.navigateBack()}>先不记录</SecondaryButton>
        </View>
      </ScrollView>
    </View>
  )
}
