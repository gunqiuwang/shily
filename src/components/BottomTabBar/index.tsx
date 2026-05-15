import { View, Text } from '@tarojs/components'
import AppIcon, { AppIconName } from '../AppIcon'
import './index.scss'

interface TabItem {
  key: string
  label: string
  route: string
  url: string
  icon: AppIconName
}

const tabs: TabItem[] = [
  { key: 'home', label: '首页', route: 'pages/index/index', url: '/pages/index/index', icon: 'home' },
  { key: 'shily', label: 'Shily', route: 'pages/chat/index', url: '/pages/chat/index', icon: 'cloud' },
  { key: 'mine', label: '我的', route: 'pages/mine/index', url: '/pages/mine/index', icon: 'user' },
]

function getCurrentRoute() {
  const pages = getCurrentPages()
  return pages[pages.length - 1]?.route || ''
}

export default function BottomTabBar() {
  const currentRoute = getCurrentRoute()
  const activeKey = tabs.find((tab) => tab.route === currentRoute)?.key

  const handleTap = (tab: TabItem) => {
    if (tab.route === currentRoute) return
    wx.reLaunch({ url: tab.url })
  }

  return (
    <View className='bottom-tab'>
      <View className='bottom-tab__inner'>
        {tabs.map((tab) => {
          const isActive = activeKey === tab.key
          return (
            <View
              key={tab.key}
              className={`tab-item tab-item--${tab.key} ${isActive ? 'tab-item--active' : ''}`}
              onClick={() => handleTap(tab)}
            >
              <AppIcon
                className='tab-icon'
                name={tab.icon}
                size={54}
                tone={isActive ? 'active' : 'muted'}
              />
              <Text className='tab-label'>{tab.label}</Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}
