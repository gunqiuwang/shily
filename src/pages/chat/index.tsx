import { View, Text, Textarea, ScrollView } from '@tarojs/components'
import { useState } from 'react'
import { colors } from '../../styles/tokens'
import ShilyAvatar from '../../components/ShilyAvatar'
import PrimaryButton from '../../components/PrimaryButton'
import BottomTabBar from '../../components/BottomTabBar'
import './index.scss'

interface Message {
  id: number
  type: 'user' | 'ai'
  content: string
}

const quickActions = [
  '饮食建议',
  '外卖推荐',
  '记录分析',
  '心情聊聊',
]

export default function Chat() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      content: '我看了你今天的记录，节奏还不错。',
    },
    {
      id: 2,
      type: 'ai',
      content: '蛋白稍微少了一点，午餐可以考虑补一点。',
    },
  ])

  const handleSend = () => {
    if (!input.trim()) return
    setMessages([...messages, { id: Date.now(), type: 'user', content: input }])
    setInput('')
    // 模拟 AI 回复
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'ai',
          content: '我看了一下你今天的记录，蛋白好像有点少。如果方便的话，午餐可以补一点鸡蛋、鱼肉或豆制品。不用复杂，简单一点反而更稳。',
        },
      ])
    }, 1000)
  }

  return (
    <View className='chat-page'>
      {/* 顶部 */}
      <View className='chat-page__header'>
        <Text className='chat-page__back'>←</Text>
        <Text className='chat-page__title'>和 Shily 聊聊</Text>
        <Text className='chat-page__settings'>⚙</Text>
      </View>

      {/* Shily 状态 */}
      <View className='chat-page__shily-status'>
        <ShilyAvatar status='happy' size='small' />
        <Text className='chat-page__shily-message'>"我看了你今天的记录，节奏还不错。"</Text>
      </View>

      {/* 聊天区域 */}
      <ScrollView
        className='chat-page__messages'
        scrollY
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            className={`message message--${msg.type}`}
          >
            {msg.type === 'ai' && <ShilyAvatar status='happy' size='small' />}
            <View className='message__content'>
              <Text>{msg.content}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* 快捷按钮 */}
      <View className='chat-page__quick-actions'>
        {quickActions.map((action) => (
          <View key={action} className='chat-page__quick-btn'>
            <Text>{action}</Text>
          </View>
        ))}
      </View>

      {/* 输入框 */}
      <View className='chat-page__input-area'>
        <Textarea
          className='chat-page__input'
          placeholder='有什么想问的，告诉 Shily 吧～'
          value={input}
          onInput={(e) => setInput(e.detail.value)}
        />
        <View className='chat-page__send-btn' onClick={handleSend}>
          <Text>➤</Text>
        </View>
      </View>

      <BottomTabBar />
    </View>
  )
}
