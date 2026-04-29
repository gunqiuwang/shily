import { View, Text } from '@tarojs/components'
import GlassCard from '../../components/GlassCard'
import PrimaryButton from '../../components/PrimaryButton'
import './index.scss'

const tasks = [
  { label: '记录每日饮食', completed: true },
  { label: '每日饮水 8 杯', completed: true },
  { label: '运动 4 次', completed: false },
  { label: '睡眠 ≥ 7 小时', completed: false },
]

export default function Goal() {
  return (
    <View className='goal-page'>
      <View className='goal-page__header'>
        <Text className='goal-page__title'>阶段与目标</Text>
      </View>

      {/* 当前阶段卡片 */}
      <GlassCard className='goal-page__stage-card'>
        <Text className='goal-page__stage-label'>当前阶段</Text>
        <Text className='goal-page__stage-name'>轻盈生活阶段</Text>
        <Text className='goal-page__stage-progress'>第 2 周 / 共 8 周</Text>

        <View className='goal-page__progress-bar'>
          <View className='goal-page__progress-fill' style={{ width: '25%' }} />
        </View>

        <Text className='goal-page__stage-goal'>建立稳定饮食和作息节奏</Text>
      </GlassCard>

      {/* 阶段任务 */}
      <View className='goal-page__tasks'>
        <Text className='goal-page__section-title'>阶段任务</Text>
        {tasks.map((task, idx) => (
          <View key={idx} className='goal-page__task-item'>
            <View className={`goal-page__task-check ${task.completed ? 'goal-page__task-check--done' : ''}`}>
              {task.completed && <Text>✓</Text>}
            </View>
            <Text className={`goal-page__task-label ${task.completed ? 'goal-page__task-label--done' : ''}`}>
              {task.label}
            </Text>
          </View>
        ))}
      </View>

      {/* 底部按钮 */}
      <View className='goal-page__footer'>
        <SecondaryButton>查看阶段报告</SecondaryButton>
      </View>
    </View>
  )
}

function SecondaryButton({ children }: { children: React.ReactNode }) {
  return (
    <View className='goal-page__secondary-btn'>
      <Text>{children}</Text>
    </View>
  )
}
