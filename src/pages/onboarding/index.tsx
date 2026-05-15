import { Image, Input, Picker, View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useMemo, useState } from 'react'
import CustomNavBar from '../../components/CustomNavBar'
import GlassCard from '../../components/GlassCard'
import PrimaryButton from '../../components/PrimaryButton'
import SecondaryButton from '../../components/SecondaryButton'
import AppIcon from '../../components/AppIcon'
import { getShilyPlan } from '../../shily/plans'
import {
  ShilyAgeRange,
  ShilyGender,
  ShilyGoal,
  ShilyReminderStrategy,
  ShilyProfile,
  goalOptions,
} from '../../shily/profile'
import {
  CarbMode,
  FatLossPace,
  FastingWindow,
  Glp1Medication,
  Glp1Frequency,
  ShilyStrategyConfig,
  carbModeOptions,
  fatLossPaceOptions,
  fastingWindowOptions,
  getStrategySummary,
  glp1MedicationOptions,
  inferPlanId,
} from '../../shily/strategy'
import { uiAssets } from '../../shily/uiAssets'
import './index.scss'

type Step = 0 | 1 | 2 | 3

const nicknamePresets = ['小禾', '晚晴', '阿然', '星眠']
const genderOptions: Array<{ id: ShilyGender; label: string }> = [
  { id: 'female', label: '女性' },
  { id: 'male', label: '男性' },
]
const ageOptions: Array<{ id: ShilyAgeRange; label: string }> = [
  { id: 'under_25', label: '25 岁以下' },
  { id: '25_34', label: '25-34' },
  { id: '35_44', label: '35-44' },
  { id: '45_plus', label: '45+' },
]
const activityOptions: Array<{ id: NonNullable<ShilyProfile['activityLevel']>; label: string }> = [
  { id: 'light', label: '久坐/少运动' },
  { id: 'normal', label: '日常走动' },
  { id: 'active', label: '每周运动3次+' },
]
const cycleOptions: Array<{ value: 4 | 8 | 12 | 16; label: string }> = [
  { value: 4, label: '4 周' },
  { value: 8, label: '8 周' },
  { value: 12, label: '12 周' },
  { value: 16, label: '16 周' },
]
const frequencyOptions: Array<{ id: Glp1Frequency; label: string }> = [
  { id: 'weekly', label: '每周一次' },
  { id: 'custom', label: '自定义' },
]
const heightOptions = Array.from({ length: 71 }, (_, index) => `${140 + index} cm`)
const weightOptions = Array.from({ length: 181 }, (_, index) => `${(40 + index * 0.5).toFixed(index % 2 === 0 ? 0 : 1)} kg`)
const targetWeightOptions = Array.from({ length: 181 }, (_, index) => `${(40 + index * 0.5).toFixed(index % 2 === 0 ? 0 : 1)} kg`)
const defaultHeightIndex = 20
const defaultWeightIndex = 30
const starterFastingWindowOptions = fastingWindowOptions.filter((item) => ['12_12', '14_10', '16_8', '18_6'].includes(item.id))
const fastingStartTimeOptions = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00']

const goalIllustrationMap: Record<ShilyGoal, string> = {
  fat_loss: uiAssets.plan.gentle,
  muscle_gain: uiAssets.feature.nutrition,
  fasting: uiAssets.plan.fasting,
  carb: uiAssets.plan.carb,
  glp1_support: uiAssets.plan.glp1,
}

const stepMeta: Record<Step, { title: string; desc: string }> = {
  0: { title: '先让 Shily 认识你', desc: '用于计算每日热量和营养目标' },
  1: { title: '选择你的实现方式', desc: '只选一个最接近你的方式，之后可以在我的页面调整。' },
  2: { title: '温和减脂怎么落地', desc: '按推荐热量减法温和缺口，蛋白优先达标。' },
  3: { title: '已生成今天的起步节奏', desc: '首页会把目标、记录和 Shily 建议放在一起。' },
}

const fatLossIllustrationMap: Record<FatLossPace, string> = {
  soft: uiAssets.feature.water,
  steady: uiAssets.feature.nutrition,
  focused: uiAssets.feature.stage,
}

const fastingIllustrationMap: Record<FastingWindow, string> = {
  '12_12': uiAssets.feature.window,
  '14_10': uiAssets.feature.meal,
  '16_8': uiAssets.plan.fasting,
  '18_6': uiAssets.feature.stage,
  '5_2': uiAssets.feature.stage,
}

const carbIllustrationMap: Record<CarbMode, string> = {
  moderate: uiAssets.plan.carb,
  keto: uiAssets.feature.nutrition,
}

const glp1IllustrationMap: Record<Glp1Medication, string> = {
  semaglutide: uiAssets.plan.glp1,
  tirzepatide: uiAssets.plan.glp1,
  mazdutide: uiAssets.plan.glp1,
  unknown: uiAssets.feature.record,
}

function getPickerIndex(options: string[], value: string, fallback: number) {
  if (!value) return fallback
  const index = options.findIndex((item) => item.startsWith(value))
  return index >= 0 ? index : fallback
}

function stripUnit(value: string) {
  return value.replace(/[^\d.]/g, '')
}

function getGlp1DateTime(value: string) {
  const [date = '', time = ''] = value.split(' ')
  return { date, time }
}

function joinGlp1DateTime(date: string, time: string) {
  return [date, time].filter(Boolean).join(' ')
}

function getFastingTargetHours(window: FastingWindow) {
  if (window === '18_6') return 18
  if (window === '16_8') return 16
  if (window === '14_10') return 14
  if (window === '12_12') return 12
  return 14
}

function getFastingWindowText(startTime: string, targetHours: number) {
  const [hour = '10', minute = '00'] = startTime.split(':')
  const startHour = Number(hour) || 10
  const eatingHours = 24 - targetHours
  const endHour = (startHour + eatingHours) % 24
  return `${startTime}-${String(endHour).padStart(2, '0')}:${minute || '00'}`
}

function getSuggestedTargetWeight(weightText: string, pace: FatLossPace) {
  const weight = Number(weightText)
  if (!weight) return ''
  const delta = fatLossPaceOptions.find((item) => item.id === pace)?.weightDelta || 4
  return Math.max(40, Number((weight - delta).toFixed(1))).toString()
}

function getStepHeader(step: Step, goal: ShilyGoal, selectedGoalLabel: string) {
  if (step !== 2) return stepMeta[step]
  if (goal === 'fasting') return { title: '轻断食怎么落地', desc: '先选断食/进食节律，再选第一餐时间。新手建议从 12:12 或 14:10 开始。' }
  if (goal === 'carb') return { title: '控碳 / 生酮怎么落地', desc: '先确定碳水边界，再计算蛋白、脂肪和热量。' }
  if (goal === 'glp1_support') return { title: 'GLP-1 药物支持怎么落地', desc: '只记录医嘱节奏，重点保护蛋白、饮水和舒适感。' }
  return { title: `${selectedGoalLabel}怎么落地`, desc: '按推荐热量减法温和缺口，蛋白优先达标。' }
}

export default function Onboarding() {
  const [step, setStep] = useState<Step>(0)
  const [nickname, setNickname] = useState('小禾')
  const [gender, setGender] = useState<ShilyGender>('female')
  const [ageRange, setAgeRange] = useState<ShilyAgeRange>('25_34')
  const [activityLevel, setActivityLevel] = useState<NonNullable<ShilyProfile['activityLevel']>>('light')
  const [goal, setGoal] = useState<ShilyGoal>('fat_loss')
  const [heightCm, setHeightCm] = useState('160')
  const [weightKg, setWeightKg] = useState('55')
  const [targetWeightKg, setTargetWeightKg] = useState('51')
  const [selectedCycleWeeks, setSelectedCycleWeeks] = useState<4 | 8 | 12 | 16>(12)
  const [fatLossPace, setFatLossPace] = useState<FatLossPace>('steady')
  const [fastingWindow, setFastingWindow] = useState<FastingWindow>('14_10')
  const [fastingStartTime, setFastingStartTime] = useState('10:00')
  const [carbMode, setCarbMode] = useState<CarbMode>('moderate')
  const [glp1Medication, setGlp1Medication] = useState<Glp1Medication>('unknown')
  const [glp1Dose, setGlp1Dose] = useState('')
  const [glp1Frequency, setGlp1Frequency] = useState<Glp1Frequency>('weekly')
  const [glp1NextDoseDate, setGlp1NextDoseDate] = useState('')
  const [strategy, setStrategy] = useState<ShilyReminderStrategy>('gentle')

  const selectedGoal = goalOptions.find((item) => item.id === goal) || goalOptions[0]
  const cycleWeeks = selectedCycleWeeks

  const config: ShilyStrategyConfig = {
    goal,
    planId: inferPlanId({
      goal,
      fatLossPace,
      fastingWindow,
      fastingStartTime,
      carbMode,
      glp1: {
        medication: glp1Medication,
        doseText: glp1Dose,
        frequency: glp1Frequency,
        nextDoseDate: glp1NextDoseDate,
      },
    }),
    cycleWeeks,
    targetWeightKg: Number(targetWeightKg) || undefined,
    fatLossPace,
    fastingWindow,
    fastingStartTime,
    carbMode,
    glp1: {
      medication: glp1Medication,
      doseText: glp1Dose,
      frequency: glp1Frequency,
      nextDoseDate: glp1NextDoseDate,
    },
  }
  const selectedPlan = getShilyPlan(config.planId)
  const stepHeader = getStepHeader(step, goal, selectedGoal.label)

  const chooseFatLossPace = (pace: FatLossPace) => {
    setFatLossPace(pace)
    if (!targetWeightKg) setTargetWeightKg(getSuggestedTargetWeight(weightKg, pace))
  }

  const glp1DateTime = getGlp1DateTime(glp1NextDoseDate)

  const finish = () => {
    const cleanName = nickname.trim() || '小禾'
    Taro.setStorageSync('shilyProfile', {
      nickname: cleanName,
      goal,
      gender,
      ageRange,
      heightCm: Number(heightCm) || undefined,
      weightKg: Number(weightKg) || undefined,
      targetWeightKg: Number(targetWeightKg) || undefined,
      activityLevel,
      completedAt: Date.now(),
    })
    Taro.setStorageSync('shilyPlan', config.planId)
    Taro.setStorageSync('shilyStrategy', config)
    Taro.setStorageSync('shilyReminderStrategy', strategy)
    Taro.setStorageSync('shilyOnboardingDone', true)
    Taro.reLaunch({ url: '/pages/index/index' })
  }

  const next = () => {
    setStep((current) => Math.min(current + 1, 3) as Step)
  }
  const back = () => setStep((current) => Math.max(current - 1, 0) as Step)

  return (
    <View className='page onboarding-page'>
      <CustomNavBar title='食律 Shily' showBack={step > 0} />

      <View className={`page-content onboarding-content onboarding-content--step-${step}`}>
        <View className='onboarding-top'>
          <Text className='step-kicker'>{step + 1} / 4</Text>
          <View className='onboarding-top-row'>
            <View className='onboarding-top-copy'>
              <Text className='step-title'>{stepHeader.title}</Text>
              <Text className='step-desc'>{stepHeader.desc}</Text>
            </View>
            {step === 0 && (
              <View className='onboarding-hero-figure'>
                <Image className='onboarding-hero-image' src={uiAssets.shily.leaf} mode='aspectFit' />
                <View className='onboarding-leaf onboarding-leaf--one' />
                <View className='onboarding-leaf onboarding-leaf--two' />
              </View>
            )}
          </View>
        </View>

        {step === 0 && (
          <GlassCard className='onboarding-card onboarding-card--profile'>
            <View className='card-section-title'>
              <AppIcon name='user' size={26} tone='deep' />
              <Text>基础信息</Text>
            </View>

            <View className='input-block'>
              <Text className='field-title'>昵称</Text>
              <Input
                className='text-input'
                value={nickname}
                placeholder='Shily 怎么称呼你'
                maxlength={12}
                onInput={(event) => setNickname(event.detail.value)}
              />
            </View>

            <View className='name-chip-grid name-chip-grid--simple'>
              {nicknamePresets.map((name) => (
                <View key={name} className={`name-chip ${nickname === name ? 'name-chip--active' : ''}`} onClick={() => setNickname(name)}>
                  <Text>{name}</Text>
                </View>
              ))}
            </View>

            <View className='form-block'>
              <Text className='field-title'>性别</Text>
              <View className='inline-option-grid inline-option-grid--gender'>
                {genderOptions.map((item) => (
                  <View key={item.id} className={`mini-option ${gender === item.id ? 'mini-option--active' : ''}`} onClick={() => setGender(item.id)}>
                    <Text>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className='form-block'>
              <Text className='field-title'>年龄</Text>
              <View className='inline-option-grid inline-option-grid--age'>
                {ageOptions.map((item) => (
                  <View key={item.id} className={`mini-option ${ageRange === item.id ? 'mini-option--active' : ''}`} onClick={() => setAgeRange(item.id)}>
                    <Text>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className='metric-form'>
              <Picker
                mode='selector'
                range={heightOptions}
                value={getPickerIndex(heightOptions, heightCm, defaultHeightIndex)}
                onChange={(event) => setHeightCm(stripUnit(heightOptions[Number(event.detail.value)]))}
              >
                <View className='picker-field'>
                  <Text className='picker-label'>身高</Text>
                  <Text className={`picker-value ${heightCm ? '' : 'picker-value--empty'}`}>{heightCm ? `${heightCm} cm` : '选择身高'}</Text>
                </View>
              </Picker>
              <Picker
                mode='selector'
                range={weightOptions}
                value={getPickerIndex(weightOptions, weightKg, defaultWeightIndex)}
                onChange={(event) => {
                  const nextWeight = stripUnit(weightOptions[Number(event.detail.value)])
                  setWeightKg(nextWeight)
                  if (!targetWeightKg) setTargetWeightKg(getSuggestedTargetWeight(nextWeight, fatLossPace))
                }}
              >
                <View className='picker-field'>
                  <Text className='picker-label'>当前体重</Text>
                  <Text className={`picker-value ${weightKg ? '' : 'picker-value--empty'}`}>{weightKg ? `${weightKg} kg` : '选择体重'}</Text>
                </View>
              </Picker>
              <Picker
                mode='selector'
                range={targetWeightOptions}
                value={getPickerIndex(targetWeightOptions, targetWeightKg, Math.max(0, defaultWeightIndex - 8))}
                onChange={(event) => setTargetWeightKg(stripUnit(targetWeightOptions[Number(event.detail.value)]))}
              >
                <View className='picker-field'>
                  <Text className='picker-label'>目标体重</Text>
                  <Text className={`picker-value ${targetWeightKg ? '' : 'picker-value--empty'}`}>{targetWeightKg ? `${targetWeightKg} kg` : '选择目标体重'}</Text>
                </View>
              </Picker>
              <Picker
                mode='selector'
                range={cycleOptions.map((item) => item.label)}
                value={cycleOptions.findIndex((item) => item.value === selectedCycleWeeks)}
                onChange={(event) => setSelectedCycleWeeks(cycleOptions[Number(event.detail.value)].value)}
              >
                <View className='picker-field'>
                  <Text className='picker-label'>目标周期</Text>
                  <Text className='picker-value'>{selectedCycleWeeks} 周</Text>
                </View>
              </Picker>
            </View>

            <View className='inline-option-grid inline-option-grid--activity'>
              {activityOptions.map((item) => (
                <View key={item.id} className={`mini-option ${activityLevel === item.id ? 'mini-option--active' : ''}`} onClick={() => setActivityLevel(item.id)}>
                  <Text>{item.label}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        )}

        {step === 1 && (
          <View className='option-list option-list--strategy'>
            {goalOptions.map((item) => (
              <View
                key={item.id}
                className={`option-card option-card--with-icon ${goal === item.id ? 'option-card--active' : ''}`}
                onClick={() => setGoal(item.id)}
              >
                <View className='option-icon'>
                  <Image className='option-illustration' src={goalIllustrationMap[item.id]} mode='aspectFit' />
                </View>
                <View className='option-copy'>
                  <Text className='option-title'>{item.label}</Text>
                  <Text className='option-desc'>{item.desc}</Text>
                </View>
                {goal === item.id && <View className='option-check'><AppIcon name='check' size={24} tone='white' /></View>}
              </View>
            ))}
          </View>
        )}

        {step === 2 && (
          <View className='step-two-body'>
            {goal === 'fat_loss' && (
              <View className='option-list option-list--detail'>
                {fatLossPaceOptions.map((item) => (
                  <View key={item.id} className={`option-card option-card--with-icon ${fatLossPace === item.id ? 'option-card--active' : ''}`} onClick={() => chooseFatLossPace(item.id)}>
                    <View className='option-icon'><Image className='option-illustration' src={fatLossIllustrationMap[item.id]} mode='aspectFit' /></View>
                    <View className='option-copy'>
                      <Text className='option-title'>{item.label}</Text>
                      <Text className='option-desc'>{item.desc}</Text>
                    </View>
                    {fatLossPace === item.id && <View className='option-check'><AppIcon name='check' size={24} tone='white' /></View>}
                  </View>
                ))}
              </View>
            )}

            {goal === 'fasting' && (
              <>
                <View className='option-list option-list--detail'>
                  {starterFastingWindowOptions.map((item) => (
                    <View key={item.id} className={`option-card option-card--with-icon ${fastingWindow === item.id ? 'option-card--active' : ''}`} onClick={() => setFastingWindow(item.id)}>
                      <View className='option-icon'><Image className='option-illustration' src={fastingIllustrationMap[item.id]} mode='aspectFit' /></View>
                      <View className='option-copy'>
                        <View className='option-title-row'>
                          <Text className='option-title'>{item.label}</Text>
                          {item.id === '14_10' && <Text className='option-badge'>推荐</Text>}
                          {item.id === '18_6' && <Text className='option-badge option-badge--quiet'>进阶</Text>}
                        </View>
                        <Text className='option-desc'>{item.desc}</Text>
                      </View>
                      {fastingWindow === item.id && <View className='option-check'><AppIcon name='check' size={24} tone='white' /></View>}
                    </View>
                  ))}
                </View>
                <GlassCard className='strategy-target strategy-target--compact'>
                  <Text className='strategy-target-title'>第一餐 / 窗口开始</Text>
                  <Text className='strategy-target-desc'>{getFastingWindowText(fastingStartTime, getFastingTargetHours(fastingWindow))} 会显示在首页，打开就知道现在该喝水还是进食。</Text>
                  <Picker
                    mode='selector'
                    range={fastingStartTimeOptions}
                    value={Math.max(0, fastingStartTimeOptions.indexOf(fastingStartTime))}
                    onChange={(event) => setFastingStartTime(fastingStartTimeOptions[Number(event.detail.value)])}
                  >
                    <View className='picker-field picker-field--inside'>
                      <Text className='picker-label'>开始</Text>
                      <Text className='picker-value'>{fastingStartTime}</Text>
                    </View>
                  </Picker>
                </GlassCard>
              </>
            )}

            {goal === 'carb' && (
              <View className='option-list option-list--detail'>
                {carbModeOptions.map((item) => (
                  <View key={item.id} className={`option-card option-card--with-icon ${carbMode === item.id ? 'option-card--active' : ''}`} onClick={() => setCarbMode(item.id)}>
                    <View className='option-icon'><Image className='option-illustration' src={carbIllustrationMap[item.id]} mode='aspectFit' /></View>
                    <View className='option-copy'>
                      <Text className='option-title'>{item.label}</Text>
                      <Text className='option-desc'>{item.desc}</Text>
                    </View>
                    {carbMode === item.id && <View className='option-check'><AppIcon name='check' size={24} tone='white' /></View>}
                  </View>
                ))}
              </View>
            )}

            {goal === 'glp1_support' && (
              <>
                <View className='option-list option-list--glp1'>
                  {glp1MedicationOptions.map((item) => (
                    <View key={item.id} className={`option-card option-card--with-icon ${glp1Medication === item.id ? 'option-card--active' : ''}`} onClick={() => setGlp1Medication(item.id)}>
                      <View className='option-icon'><Image className='option-illustration' src={glp1IllustrationMap[item.id]} mode='aspectFit' /></View>
                      <View className='option-copy'>
                        <Text className='option-title'>{item.label}</Text>
                        <Text className='option-desc'>{item.desc}</Text>
                      </View>
                      {glp1Medication === item.id && <View className='option-check'><AppIcon name='check' size={24} tone='white' /></View>}
                    </View>
                  ))}
                </View>
                <GlassCard className='strategy-target strategy-target--form'>
                  <Text className='strategy-target-title'>记录医嘱节奏</Text>
                  <Input className='text-input' value={glp1Dose} placeholder='当前剂量，例如 0.5mg / 2.5mg' onInput={(event) => setGlp1Dose(event.detail.value)} />
                  <View className='date-picker-grid'>
                    <Picker
                      mode='date'
                      value={glp1DateTime.date}
                      onChange={(event) => setGlp1NextDoseDate(joinGlp1DateTime(String(event.detail.value), glp1DateTime.time || '20:00'))}
                    >
                      <View className='picker-field picker-field--inside'>
                        <Text className='picker-label'>下次用药日</Text>
                        <Text className={`picker-value ${glp1DateTime.date ? '' : 'picker-value--empty'}`}>{glp1DateTime.date || '选择日期'}</Text>
                      </View>
                    </Picker>
                    <Picker
                      mode='time'
                      value={glp1DateTime.time}
                      onChange={(event) => setGlp1NextDoseDate(joinGlp1DateTime(glp1DateTime.date, String(event.detail.value)))}
                    >
                      <View className='picker-field picker-field--inside'>
                        <Text className='picker-label'>时间</Text>
                        <Text className={`picker-value ${glp1DateTime.time ? '' : 'picker-value--empty'}`}>{glp1DateTime.time || '选择时间'}</Text>
                      </View>
                    </Picker>
                  </View>
                  <View className='inline-option-grid inline-option-grid--frequency'>
                    {frequencyOptions.map((item) => (
                      <View key={item.id} className={`mini-option ${glp1Frequency === item.id ? 'mini-option--active' : ''}`} onClick={() => setGlp1Frequency(item.id)}>
                        <Text>{item.label}</Text>
                      </View>
                    ))}
                  </View>
                </GlassCard>
              </>
            )}

            {goal !== 'glp1_support' && (
              <View className='onboarding-tip-card'>
                <View className='tip-copy'>
                  <Text>目标是长期可持续地变好，不用短期极端地变瘦。</Text>
                </View>
                <Image className='summary-card-image' src={uiAssets.shily.main} mode='aspectFit' />
              </View>
            )}
          </View>
        )}

        {step === 3 && (
          <View className='summary-layout'>
            <GlassCard className='summary-panel'>
              <View className='summary-cloud'>
                <Image className='summary-shily-image' src={uiAssets.shily.heart} mode='aspectFit' />
              </View>
              <View className='summary-row'>
                <Text className='summary-label'>称呼</Text>
                <Text className='summary-value'>{nickname.trim() || '小禾'}</Text>
              </View>
              <View className='summary-row'>
                <Text className='summary-label'>节律方案</Text>
                <Text className='summary-value'>{getStrategySummary(config)}</Text>
              </View>
              <View className='summary-row'>
                <Text className='summary-label'>今日重点会偏向</Text>
                <Text className='summary-value'>{selectedPlan.focus}</Text>
              </View>
              <View className='summary-row'>
                <Text className='summary-label'>基础测算</Text>
                <Text className='summary-value'>{heightCm}cm · {weightKg}kg → {targetWeightKg}kg · {cycleWeeks} 周</Text>
              </View>
              <View className='summary-row'>
                <Text className='summary-label'>下一步</Text>
                <Text className='summary-value'>首页看数据，Shily 给建议</Text>
              </View>
            </GlassCard>

            <GlassCard className='gain-card'>
              <View className='gain-icon'><Image className='gain-illustration' src={uiAssets.feature.nutrition} mode='aspectFit' /></View>
              <View className='gain-copy'>
                <Text className='gain-title'>你将获得</Text>
                <Text className='gain-item'>每日热量和营养目标</Text>
                <Text className='gain-item'>饮食与运动的智能建议</Text>
                <Text className='gain-item'>进度追踪与节奏调整</Text>
              </View>
            </GlassCard>
          </View>
        )}

        <View className={`onboarding-actions ${step > 0 ? 'onboarding-actions--split' : ''}`}>
          {step > 0 && <SecondaryButton onClick={back}>上一步</SecondaryButton>}
          <PrimaryButton onClick={step === 3 ? finish : next}>
            {step === 3 ? '看首页数据' : '继续'}
          </PrimaryButton>
        </View>
      </View>
    </View>
  )
}
