import { View, Text, Switch } from '@tarojs/components'
import { useState } from 'react'
import GlassCard from '../../components/GlassCard'
import './index.scss'

const reminders = [
  { id: 1, icon: '💧', label: '喝水提醒', desc: '每2小时提醒一次', enabled: true },
  { id: 2, icon: '🍽️', label: '用餐提醒', desc: '早8:00 / 午12:30 / 晚18:30', enabled: true },
  { id: 3, icon: '🏃', label: '运动提醒', desc: '每天 19:00', enabled: false },
  { id: 4, icon: '📝', label: '记录提醒', desc: '每天 21:00', enabled: true },
  { id: 5, icon: '😴', label: '睡眠提醒', desc: '每天 22:30', enabled: false },
]

const history = [
  { time: '08:00', title: '喝水提醒', completed: true },
  { time: '12:30', title: '午餐提醒', completed: true },
  { time: '15:00', title: '喝水提醒', completed: false },
  { time: '19:00', title: '运动提醒', completed: false },
]

export default function Reminder() {
  const [reminderList, setReminderList] = useState(reminders)

  const toggleReminder = (id: number) => {
    setReminderList(list =>
      list.map(item =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    )
  }

  return (
    <View className='reminder-page'>
      <View className='reminder-page__header'>
        <Text className='reminder-page__title'>习惯与提醒</Text>
      </View>

      <View className='reminder-page__list'>
        {reminderList.map((item) => (
          <GlassCard key={item.id} className='reminder-item'>
            <View className='reminder-item__left'>
              <Text className='reminder-item__icon'>{item.icon}</Text>
              <View className='reminder-item__info'>
                <Text className='reminder-item__label'>{item.label}</Text>
                <Text className='reminder-item__desc'>{item.desc}</Text>
              </View>
            </View>
            <Switch
              checked={item.enabled}
              onChange={() => toggleReminder(item.id)}
              color='#7BC89C'
            />
          </GlassCard>
        ))}
      </View>

      <View className='reminder-page__history'>
        <Text className='reminder-page__section-title'>提醒记录</Text>
        {history.map((item, idx) => (
          <View key={idx} className='reminder-page__history-item'>
            <View className='reminder-page__history-left'>
              <View className={`reminder-page__history-dot ${item.completed ? 'reminder-page__history-dot--done' : ''}`} />
              <Text className='reminder-page__history-time'>{item.time}</Text>
              <Text className='reminder-page__history-title'>{item.title}</Text>
            </View>
            <Text className={`reminder-page__history-status ${item.completed ? 'reminder-page__history-status--done' : ''}`}>
              {item.completed ? '已完成' : '待完成'}
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}
