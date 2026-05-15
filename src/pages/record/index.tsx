import { Image, View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useMemo, useState } from 'react'
import GlassCard from '../../components/GlassCard'
import BottomTabBar from '../../components/BottomTabBar'
import CustomNavBar from '../../components/CustomNavBar'
import PrimaryButton from '../../components/PrimaryButton'
import { AppIconName } from '../../components/AppIcon'
import { readMoodRecord, readSteps, readWaterCups, writeWaterCups } from '../../shily/dailyMetrics'
import { readTodayMealRecords } from '../../shily/mealRecords'
import { uiAssets } from '../../shily/uiAssets'
import './index.scss'

interface MealRecord {
  id: number
  type: string
  time: string
  foods: string[]
  calories: number
}

const recordActions: Array<{ type: string; label: string; desc: string; icon: AppIconName; path?: string }> = [
  { type: 'manual', label: '饮食', desc: '记录一餐或加餐的大概内容', icon: 'notebook' },
  { type: 'water', label: '喝水', desc: '更新今天的饮水杯数', icon: 'droplet' },
  { type: 'steps', label: '步数', desc: '手动填今天大概步数', icon: 'activity' },
  { type: 'weight', label: '体重', desc: '只记录趋势，不做评价', icon: 'target' },
  { type: 'mood', label: '状态', desc: '记录食欲、疲惫或身体反馈', icon: 'moon' },
  { type: 'feeling', label: '感受', desc: '补一句今天的真实感受', icon: 'sparkle' },
]

const recordIllustrationMap: Record<string, string> = {
  manual: uiAssets.feature.record,
  water: uiAssets.feature.water,
  steps: uiAssets.feature.movement,
  weight: uiAssets.plan.carb,
  mood: uiAssets.feature.mood,
  feeling: uiAssets.shily.leaf,
}

interface RecordStatus {
  key: string
  label: string
  desc: string
  value: string
  note: string
  icon: AppIconName
  done: boolean
  type: string
}

export default function Record() {
  const [selectedDate] = useState(new Date())
  const [sheetOpen, setSheetOpen] = useState(false)
  const [mealRecords, setMealRecords] = useState(readTodayMealRecords())
  const [waterCups, setWaterCups] = useState(0)
  const [steps, setSteps] = useState(0)
  const [weightLog, setWeightLog] = useState<{ value?: number } | null>(null)
  const [moodLog, setMoodLog] = useState<{ value?: string; note?: string; source?: string } | null>(null)

  useDidShow(() => {
    setMealRecords(readTodayMealRecords())
    setWaterCups(readWaterCups())
    setSteps(readSteps())
    setWeightLog(Taro.getStorageSync('shilyWeightLog') || null)
    setMoodLog(readMoodRecord())
  })

  const records = useMemo<MealRecord[]>(() => {
    return mealRecords.map((meal, index) => ({
      id: meal.createdAt || index,
      type: meal.mealType,
      time: '刚刚',
      foods: [meal.sourceText || '这一餐'],
      calories: meal.calories,
    }))
  }, [mealRecords])

  const recordStatuses = useMemo<RecordStatus[]>(() => {
    const mealDone = records.length > 0
    const moodValue = moodLog?.note || moodLog?.value || ''
    return [
      {
        key: 'meal',
        label: '饮食',
        desc: '早餐、午餐、加餐或晚餐',
        value: mealDone ? `${records.length} 餐` : '未记录',
        note: mealDone ? '已同步到建议' : '先记一餐即可',
        icon: 'notebook',
        done: mealDone,
        type: 'manual',
      },
      {
        key: 'water',
        label: '喝水',
        desc: '每点一次记一杯',
        value: waterCups ? `${waterCups} 杯` : '未记录',
        note: waterCups ? '首页已同步' : '待补充',
        icon: 'droplet',
        done: Boolean(waterCups),
        type: 'water',
      },
      {
        key: 'steps',
        label: '步数',
        desc: '没有同步时手动估算',
        value: steps ? `${steps} 步` : '待估算',
        note: steps ? '已记录' : '可手填',
        icon: 'activity',
        done: Boolean(steps),
        type: 'steps',
      },
      {
        key: 'weight',
        label: '体重',
        desc: '只看趋势，不做评价',
        value: weightLog?.value ? `${weightLog.value} kg` : '未记录',
        note: weightLog?.value ? '趋势已更新' : '可跳过',
        icon: 'target',
        done: Boolean(weightLog?.value),
        type: 'weight',
      },
      {
        key: 'mood',
        label: '状态',
        desc: '食欲、疲惫、胃胀等',
        value: moodValue || '未记录',
        note: moodLog?.source === 'mood' ? '状态已记录' : '可补充',
        icon: 'moon',
        done: Boolean(moodValue),
        type: 'mood',
      },
      {
        key: 'feeling',
        label: '感受',
        desc: '写一句今天真实反馈',
        value: moodLog?.source === 'feeling' && moodValue ? '已记录' : '未记录',
        note: moodLog?.source === 'feeling' ? moodValue : '可写一句',
        icon: 'sparkle',
        done: moodLog?.source === 'feeling' && Boolean(moodValue),
        type: 'feeling',
      },
    ]
  }, [records, waterCups, steps, weightLog, moodLog])
  const frequentRecords = recordStatuses.filter((item) => ['meal', 'water', 'steps', 'mood'].includes(item.key))
  const occasionalRecords = recordStatuses.filter((item) => ['weight', 'feeling'].includes(item.key))
  const nextRecord = frequentRecords.find((item) => !item.done) || occasionalRecords.find((item) => !item.done) || recordStatuses[0]
  const nextRecordAction = recordActions.find((item) => item.type === nextRecord.type) || recordActions[0]
  const nextRecordTitle = nextRecord.done ? '今天记录够用了' : `下一步：补${nextRecord.label}`
  const nextRecordDesc = nextRecord.done
    ? '先不用继续补，回首页看建议或问 Shily 下一餐。'
    : nextRecord.key === 'meal'
      ? '先记一餐，首页和 Shily 的判断会马上更贴近今天。'
      : nextRecord.key === 'water'
        ? '水分会直接影响 GLP-1、轻断食和晚餐建议。'
        : nextRecord.key === 'steps'
          ? '没有自动步数时，填一个大概数就够。'
          : nextRecord.key === 'mood'
            ? '记录饥饿、疲惫或胃胀，比单看热量更有用。'
            : '这项可跳过，但补了会让趋势更清楚。'

  const formatDate = (date: Date) => {
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    return `${month}月${day}日 · 周${weekdays[date.getDay()]}`
  }

  const handleRecordAction = (item: (typeof recordActions)[number]) => {
    setSheetOpen(false)

    if (item.path) {
      Taro.navigateTo({ url: item.path })
      return
    }

    if (item.type === 'water') {
      const current = readWaterCups()
      const next = Math.min(12, current + 1)
      writeWaterCups(next)
      setWaterCups(next)
      Taro.setStorageSync('shilyLastActionFlow', {
        type: 'water',
        option: { title: '喝了一杯水' },
        createdAt: Date.now(),
      })
      Taro.showToast({ title: `饮水已更新：${next}杯`, icon: 'none' })
      return
    }

    Taro.navigateTo({ url: `/pages/quick-log/index?mode=${item.type}` })
  }

  const handleSummaryAction = () => {
    if (nextRecord.done) {
      Taro.reLaunch({ url: '/pages/index/index' })
      return
    }

    handleRecordAction(nextRecordAction)
  }

  return (
    <View className='page record-page'>
      <CustomNavBar
        title='今日记录'
      />

      <View className='page-content record-content'>
        <View className='date-row'>
          <Text className='date-text'>{formatDate(selectedDate)}</Text>
          <Text className='date-sub'>饮食、喝水、步数、体重、状态和感受都在这里。</Text>
        </View>

        <View className='record-summary' onClick={handleSummaryAction}>
          <View className='record-summary-copy'>
            <Text className='record-summary-title'>{nextRecordTitle}</Text>
            <Text className='record-summary-desc'>{nextRecordDesc}</Text>
          </View>
          <Text className='record-summary-cta'>{nextRecord.done ? '去首页' : '去记录'}</Text>
        </View>

        <View className='record-section'>
          <View className='record-section-head'>
            <Text className='record-section-title'>高频记录</Text>
            <Text className='record-section-desc'>每天看这四项就够</Text>
          </View>
          <View className='record-grid'>
            {frequentRecords.map((item) => {
            const action = recordActions.find((recordAction) => recordAction.type === item.type) || recordActions[0]
            return (
              <GlassCard key={item.key} className={`record-status-card ${item.done ? 'record-status-card--done' : ''}`} onClick={() => handleRecordAction(action)}>
                <View className='record-status-card-head'>
                  <View className='record-status-icon'>
                    <Image className='record-status-illustration' src={recordIllustrationMap[item.type]} mode='aspectFit' />
                  </View>
                </View>
                <Text className='record-status-label'>{item.label}</Text>
                <Text className='record-status-value'>{item.value}</Text>
                <View className='record-status-meta'>
                  <Text className='record-status-note'>{item.note}</Text>
                  <Text className={`record-status-pill ${item.done ? 'record-status-pill--done' : ''}`}>
                    {item.done ? '已记录' : '待补'}
                  </Text>
                </View>
              </GlassCard>
            )
          })}
          </View>
        </View>

        <View className='record-section record-section--occasional'>
          <View className='record-section-head'>
            <Text className='record-section-title'>低频补充</Text>
            <Text className='record-section-desc'>体重偶尔记录趋势即可</Text>
          </View>
          <View className='record-grid record-grid--occasional'>
            {occasionalRecords.map((item) => {
              const action = recordActions.find((recordAction) => recordAction.type === item.type) || recordActions[0]
              return (
                <GlassCard key={item.key} className={`record-status-card record-status-card--small ${item.done ? 'record-status-card--done' : ''}`} onClick={() => handleRecordAction(action)}>
                  <View className='record-status-card-head'>
                  <View className='record-status-icon'>
                    <Image className='record-status-illustration' src={recordIllustrationMap[item.type]} mode='aspectFit' />
                  </View>
                  </View>
                  <Text className='record-status-label'>{item.label}</Text>
                  <Text className='record-status-value'>{item.value}</Text>
                  <View className='record-status-meta'>
                    <Text className='record-status-note'>{item.note}</Text>
                    <Text className={`record-status-pill ${item.done ? 'record-status-pill--done' : ''}`}>
                      {item.done ? '已记录' : '可跳过'}
                    </Text>
                  </View>
                </GlassCard>
              )
            })}
          </View>
        </View>

        <View className='record-primary-wrap'>
          <PrimaryButton icon='plus' onClick={() => setSheetOpen(true)}>
            添加记录
          </PrimaryButton>
        </View>
      </View>

      {sheetOpen && (
        <View className='record-sheet-mask' onClick={() => setSheetOpen(false)}>
          <View className='record-sheet' onClick={(event) => event.stopPropagation()}>
            <View className='record-sheet-handle' />
            <Text className='record-sheet-title'>添加记录</Text>
            <Text className='record-sheet-subtitle'>饮食、饮水、步数和身体状态都可以从这里补。</Text>
            <View className='record-action-list'>
              {recordActions.map((item) => (
                <View
                  key={item.label}
                  className='record-action'
                  onClick={() => handleRecordAction(item)}
                >
                  <View className='record-action-icon'>
                    <Image className='record-action-illustration' src={recordIllustrationMap[item.type]} mode='aspectFit' />
                  </View>
                  <View>
                    <Text className='record-action-label'>{item.label}</Text>
                    <Text className='record-action-desc'>{item.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      <BottomTabBar />
    </View>
  )
}
