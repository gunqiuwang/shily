import { Image, View, Text, Input, Picker } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState } from 'react'
import CustomNavBar from '../../components/CustomNavBar'
import GlassCard from '../../components/GlassCard'
import PrimaryButton from '../../components/PrimaryButton'
import SecondaryButton from '../../components/SecondaryButton'
import AppIcon from '../../components/AppIcon'
import { readSteps, writeMoodRecord, writeSteps } from '../../shily/dailyMetrics'
import { MealType, appendTodayMealRecord } from '../../shily/mealRecords'
import { readShilyProfile } from '../../shily/profile'
import { uiAssets } from '../../shily/uiAssets'
import { MealEstimateResult, estimateMealWithAI } from '../../services/mealEstimate'
import './index.scss'

type QuickLogMode = 'manual' | 'weight' | 'mood' | 'steps' | 'feeling'

const mealTypes: MealType[] = ['早餐', '午餐', '加餐', '晚餐']
const moodOptions = ['还可以', '有点累', '有点焦虑', '食欲低', '胃有点胀', '有点恶心', '排便偏少', '身体有点沉']
const weightOptions = Array.from({ length: 261 }, (_, index) => (35 + index * 0.5).toFixed(1))
const stepOptions = Array.from({ length: 41 }, (_, index) => String(index * 500))

function getModeTitle(mode: QuickLogMode) {
  if (mode === 'weight') return '记录体重'
  if (mode === 'mood') return '记录状态'
  if (mode === 'steps') return '记录步数'
  if (mode === 'feeling') return '记录感受'
  return '记录饮食'
}

export default function QuickLog() {
  const router = useRouter()
  const mode = ((router.params.mode as QuickLogMode) || 'manual') as QuickLogMode
  const [mealType, setMealType] = useState<MealType>('午餐')
  const [mealText, setMealText] = useState('')
  const [mealEstimate, setMealEstimate] = useState<MealEstimateResult | null>(null)
  const [isEstimating, setIsEstimating] = useState(false)
  const [weight, setWeight] = useState(() => {
    const profile = readShilyProfile()
    return profile.weightKg ? profile.weightKg.toFixed(1) : '55.0'
  })
  const [mood, setMood] = useState('还可以')
  const [note, setNote] = useState('')
  const [steps, setSteps] = useState(() => String(readSteps() || 6000))
  const title = getModeTitle(mode)

  const handleMealTextInput = (value: string) => {
    setMealText(value)
    if (mealEstimate) setMealEstimate(null)
  }

  const handleEstimateMeal = async () => {
    const text = mealText.trim()
    if (!text) {
      Taro.showToast({ title: '先写下这餐吃了什么', icon: 'none' })
      return null
    }

    setIsEstimating(true)
    try {
      const estimate = await estimateMealWithAI(text, mealType)
      setMealEstimate(estimate)
      return estimate
    } finally {
      setIsEstimating(false)
    }
  }

  const handleSave = async () => {
    if (mode === 'weight') {
      const value = Number(weight)
      if (!value || value < 30 || value > 200) {
        Taro.showToast({ title: '先填一个大概体重', icon: 'none' })
        return
      }

      const profile = readShilyProfile()
      Taro.setStorageSync('shilyProfile', {
        ...profile,
        weightKg: value,
      })
      Taro.setStorageSync('shilyWeightLog', {
        value,
        createdAt: Date.now(),
      })
      Taro.setStorageSync('shilyLastActionFlow', {
        type: 'weight',
        option: { title: '记录了一次体重' },
        createdAt: Date.now(),
      })
      Taro.showToast({ title: '体重已记录', icon: 'none' })
      setTimeout(() => Taro.navigateBack(), 450)
      return
    }

    if (mode === 'mood' || mode === 'feeling') {
      if (mode === 'feeling' && !note.trim()) {
        Taro.showToast({ title: '先写一句感受', icon: 'none' })
        return
      }

      writeMoodRecord({
        value: mood,
        note: note.trim(),
        source: mode,
      })
      Taro.setStorageSync('shilyLastActionFlow', {
        type: mode,
        option: { title: mode === 'feeling' ? '记录了一句感受' : `记录了状态：${mood}` },
        note: note.trim(),
        createdAt: Date.now(),
      })
      Taro.showToast({ title: mode === 'feeling' ? '感受已记录' : '状态已记录', icon: 'none' })
      setTimeout(() => Taro.navigateBack(), 450)
      return
    }

    if (mode === 'steps') {
      const value = Number(steps)
      if (!Number.isFinite(value) || value < 0 || value > 50000) {
        Taro.showToast({ title: '先填一个大概步数', icon: 'none' })
        return
      }

      writeSteps(value)
      Taro.setStorageSync('shilyLastActionFlow', {
        type: 'steps',
        option: { title: `记录了 ${Math.round(value)} 步` },
        createdAt: Date.now(),
      })
      Taro.showToast({ title: '步数已记录', icon: 'none' })
      setTimeout(() => Taro.navigateBack(), 450)
      return
    }

    const estimate = mealEstimate || await handleEstimateMeal()
    if (!estimate) return

    appendTodayMealRecord({
      mealType,
      sourceText: mealText.trim(),
      calories: estimate.calories,
      proteinG: estimate.proteinG,
      carbG: estimate.carbG,
      fatG: estimate.fatG,
      source: estimate.source,
    })
    Taro.setStorageSync('shilyLastActionFlow', {
      type: 'manual_food',
      option: { title: `记录了${mealType}` },
      note: mealText.trim(),
      createdAt: Date.now(),
    })
    Taro.showToast({ title: '这餐记好了', icon: 'none' })
    setTimeout(() => Taro.navigateBack(), 450)
  }

  const handleSecondaryAction = () => {
    if (mode === 'manual' && mealEstimate) {
      setMealEstimate(null)
      return
    }
    Taro.navigateBack()
  }

  return (
    <View className='page quick-log-page'>
      <CustomNavBar title={title} showBack />

      <View className='page-content quick-log-content'>
        <GlassCard className='quick-log-hero' variant='tint'>
          <View className='quick-log-hero-copy'>
            <Text className='quick-log-kicker'>快速记录</Text>
            <Text className='quick-log-title'>
              {mode === 'weight'
                ? '记录今天的体重趋势。'
                : mode === 'mood'
                  ? '记录现在的身体和情绪。'
                  : mode === 'feeling'
                    ? '写一句今天的感受。'
                    : mode === 'steps'
                      ? '填一个大概步数。'
                      : '一句话记这一餐。'}
            </Text>
            <Text className='quick-log-desc'>
              {mode === 'manual' ? '不用选来选去，写你刚吃了什么。' : '不用追求完美，记个大概就够。'}
            </Text>
          </View>
          <Image className='quick-log-hero-image' src={mode === 'manual' ? uiAssets.shily.state.happy : uiAssets.shily.leaf} mode='aspectFit' />
        </GlassCard>

        {mode === 'manual' && (
          <>
            <View className='meal-tabs'>
              {mealTypes.map((item) => (
                <View
                  key={item}
                  className={`meal-tab ${mealType === item ? 'meal-tab--active' : ''}`}
                  onClick={() => setMealType(item)}
                >
                  <Text>{item}</Text>
                </View>
              ))}
            </View>

            <GlassCard className='sentence-card sentence-card--simple'>
              <View className='sentence-head'>
                <View className='sentence-icon'>
                  <AppIcon name='send' size={30} tone='deep' />
                </View>
                <View className='sentence-copy'>
                  <Text className='sentence-title'>一句话，Shily 来估算</Text>
                  <Text className='sentence-desc'>写自然一点就行，比如：一碗米饭、两个鸡蛋、一杯牛奶</Text>
                </View>
              </View>
              <View className='sentence-input-row'>
                <Input
                  className='sentence-input'
                  value={mealText}
                  placeholder='这餐吃了什么'
                  onInput={(event) => handleMealTextInput(String(event.detail.value))}
                />
                <View className={`sentence-action ${isEstimating ? 'sentence-action--disabled' : ''}`} onClick={handleEstimateMeal}>
                  <Text>{isEstimating ? '估算中' : '估算'}</Text>
                </View>
              </View>
              <View className={`ai-estimate-strip ${mealEstimate ? 'ai-estimate-strip--hidden' : ''}`}>
                <View className='ai-estimate-mark'>
                  <Image className='ai-estimate-cloud' src={uiAssets.shily.state.happy} mode='aspectFit' />
                </View>
                <View className='ai-estimate-copy'>
                  <Text className='ai-estimate-title'>AI 会自动拆成热量、蛋白、碳水和脂肪</Text>
                  <Text className='ai-estimate-desc'>不用手选食材，先记大概，Shily 后面按记录给建议。</Text>
                </View>
              </View>
            </GlassCard>

            {mealEstimate && (
              <GlassCard className='meal-estimate-card meal-estimate-card--ai'>
                <View className='estimate-head'>
                  <Text className='estimate-title'>Shily 估了一下</Text>
                  <Text className='estimate-count'>{mealEstimate.source === 'hunyuan' ? 'AI' : '粗估'}</Text>
                </View>
                <Text className='estimate-source'>{mealText.trim()}</Text>
                <View className='estimate-grid'>
                  <View className='estimate-item'>
                    <Text className='estimate-value'>{mealEstimate.calories}</Text>
                    <Text className='estimate-label'>kcal</Text>
                  </View>
                  <View className='estimate-item'>
                    <Text className='estimate-value'>{mealEstimate.proteinG}g</Text>
                    <Text className='estimate-label'>蛋白</Text>
                  </View>
                  <View className='estimate-item'>
                    <Text className='estimate-value'>{mealEstimate.carbG}g</Text>
                    <Text className='estimate-label'>碳水</Text>
                  </View>
                  <View className='estimate-item'>
                    <Text className='estimate-value'>{mealEstimate.fatG}g</Text>
                    <Text className='estimate-label'>脂肪</Text>
                  </View>
                </View>
                <Text className='estimate-note'>{mealEstimate.note || '不准也没关系，先记个大概。'}</Text>
              </GlassCard>
            )}
          </>
        )}

        {mode === 'weight' && (
          <GlassCard className='quick-section'>
            <Text className='quick-section-title'>今天体重</Text>
            <Picker
              mode='selector'
              range={weightOptions}
              value={Math.max(0, weightOptions.indexOf(weight || '55.0'))}
              onChange={(event) => setWeight(weightOptions[Number(event.detail.value)] || '55.0')}
            >
              <View className='weight-picker-row'>
                <Text className={`weight-picker-value ${weight ? '' : 'weight-picker-value--placeholder'}`}>
                  {weight || '选择一个大概体重'}
                </Text>
                <Text className='weight-unit'>kg</Text>
              </View>
            </Picker>
            <Text className='quick-muted'>体重只看趋势，不用因为单日波动调整判断。</Text>
          </GlassCard>
        )}

        {(mode === 'mood' || mode === 'feeling') && (
          <GlassCard className='quick-section'>
            <Text className='quick-section-title'>{mode === 'feeling' ? '今天想记什么' : '现在感觉'}</Text>
            {mode === 'mood' && (
              <View className='mood-grid'>
                {moodOptions.map((item) => (
                  <View
                    key={item}
                    className={`mood-chip ${mood === item ? 'mood-chip--active' : ''}`}
                    onClick={() => setMood(item)}
                  >
                    <Text>{item}</Text>
                  </View>
                ))}
              </View>
            )}
            <Input
              className='mood-input'
              value={note}
              placeholder={mode === 'feeling' ? '比如：今天没胃口，但想好好吃晚饭' : '也可以补一句，很短就好'}
              onInput={(event) => setNote(String(event.detail.value))}
            />
          </GlassCard>
        )}

        {mode === 'steps' && (
          <GlassCard className='quick-section'>
            <Text className='quick-section-title'>今天步数</Text>
            <Picker
              mode='selector'
              range={stepOptions}
              value={Math.max(0, stepOptions.indexOf(steps || '6000'))}
              onChange={(event) => setSteps(stepOptions[Number(event.detail.value)] || '6000')}
            >
              <View className='weight-picker-row'>
                <Text className={`weight-picker-value ${steps ? '' : 'weight-picker-value--placeholder'}`}>
                  {steps || '选择大概步数'}
                </Text>
                <Text className='weight-unit'>步</Text>
              </View>
            </Picker>
            <Text className='quick-muted'>没有微信运动授权时，先手动估算也可以。</Text>
          </GlassCard>
        )}

        <View className='quick-actions'>
          <PrimaryButton onClick={handleSave}>
            {mode === 'manual'
              ? mealEstimate
                ? '确认记录'
                : isEstimating
                  ? '估算中'
                  : '估算这一餐'
              : '确认记录'}
          </PrimaryButton>
          <SecondaryButton onClick={handleSecondaryAction}>{mode === 'manual' && mealEstimate ? '重新写' : '先不记了'}</SecondaryButton>
        </View>

        {mode === 'manual' && !mealEstimate && (
          <View className='quick-log-tail'>
            <View className='quick-log-tail-head'>
              <Image className='quick-log-tail-image' src={uiAssets.shily.heart} mode='aspectFit' />
              <View className='quick-log-tail-copy'>
                <Text className='quick-log-tail-title'>不用写得像菜单</Text>
                <Text className='quick-log-tail-desc'>按你平时说话写，Shily 会自己估个大概。</Text>
              </View>
            </View>
            <View className='quick-log-examples'>
              <Text className='quick-log-example'>半碗饭，一点青菜，几块鸡肉</Text>
              <Text className='quick-log-example'>便利店饭团加无糖豆浆</Text>
              <Text className='quick-log-example'>没怎么吃，就喝了杯牛奶</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  )
}
