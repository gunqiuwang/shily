import { View, Text } from '@tarojs/components'
import { useEffect, useState } from 'react'
import { colors } from '../../styles/tokens'
import './index.scss'

const tabs = [
  { key: 'home', label: '首页', icon: '◈' },
  { key: 'record', label: '记录', icon: '⊕' },
  { key: 'shily', label: 'Shily', icon: '◇' },
  { key: 'data', label: '数据', icon: '◎' },
  { key: 'mine', label: '我的', icon: '◉' },
]

export default function BottomTabBar() {
  const [active, setActive] = useState('home')

  useEffect(() => {
    const pages = getCurrentPages()
    if (pages.length > 0) {
      const route = pages[pages.length - 1].route
      if (route.includes('index')) setActive('home')
      else if (route.includes('record')) setActive('record')
      else if (route.includes('chat')) setActive('shily')
      else if (route.includes('data')) setActive('data')
      else if (route.includes('mine')) setActive('mine')
    }
  }, [])

  const handleTabClick = (key: string, path: string) => {
    setActive(key)
    if (key === 'shily') {
      wx.switchTab({ url: '/pages/chat/index' })
    } else {
      wx.switchTab({ url: path })
    }
  }

  return (
    <View className='bottom-tab-bar'>
      {tabs.map((tab) => (
        <View
          key={tab.key}
          className={`tab-item ${active === tab.key ? 'tab-item--active' : ''}`}
          onClick={() => handleTabClick(tab.key, `/pages/${tab.key}/index`)}
        >
          <Text className='tab-icon' style={{ color: active === tab.key ? colors.primary : colors.tabInactive }}>
            {tab.icon}
          </Text>
          <Text className='tab-label' style={{ color: active === tab.key ? colors.primary : colors.tabInactive }}>
            {tab.label}
          </Text>
        </View>
      ))}
    </View>
  )
}
