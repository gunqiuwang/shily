import { View, Text } from '@tarojs/components'
import type { ReactNode } from 'react'
import './index.scss'

export interface NavMetrics {
  statusBarHeight: number
  navBarHeight: number
  headerHeight: number
  menuRight: number
  menuWidth: number
  menuHeight: number
  menuTop: number
  windowWidth: number
}

const FALLBACK_NAV_BAR_HEIGHT = 44
const FALLBACK_HEADER_HEIGHT = 88

export function getNavMetrics(): NavMetrics {
  try {
    const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : undefined
    const appBaseInfo = wx.getAppBaseInfo ? wx.getAppBaseInfo() : undefined
    const deviceInfo = wx.getDeviceInfo ? wx.getDeviceInfo() : undefined
    const menu = wx.getMenuButtonBoundingClientRect()
    const statusBarHeight = windowInfo?.statusBarHeight || appBaseInfo?.statusBarHeight || 0
    const windowWidth = windowInfo?.windowWidth || deviceInfo?.screenWidth || 375
    const hasMenu = Boolean(menu && menu.width && menu.height)
    const navBarHeight = hasMenu
      ? (menu.top - statusBarHeight) * 2 + menu.height
      : FALLBACK_NAV_BAR_HEIGHT
    const headerHeight = statusBarHeight + navBarHeight

    return {
      statusBarHeight,
      navBarHeight,
      headerHeight,
      menuRight: hasMenu ? windowWidth - menu.right : 8,
      menuWidth: hasMenu ? menu.width : 0,
      menuHeight: hasMenu ? menu.height : 32,
      menuTop: hasMenu ? menu.top : statusBarHeight + 6,
      windowWidth,
    }
  } catch (error) {
    return {
      statusBarHeight: 44,
      navBarHeight: FALLBACK_NAV_BAR_HEIGHT,
      headerHeight: FALLBACK_HEADER_HEIGHT,
      menuRight: 8,
      menuWidth: 0,
      menuHeight: 32,
      menuTop: 50,
      windowWidth: 375,
    }
  }
}

interface CustomNavBarProps {
  title?: string
  showBack?: boolean
  onBack?: () => void
  rightContent?: ReactNode
  transparent?: boolean
}

export default function CustomNavBar({
  title = '',
  showBack = false,
  onBack,
  rightContent,
  transparent = false,
}: CustomNavBarProps) {
  const metrics = getNavMetrics()
  const menuReserve = metrics.menuWidth + metrics.menuRight + 12

  const handleBack = () => {
    if (onBack) {
      onBack()
      return
    }
    wx.navigateBack()
  }

  return (
    <>
      <View
        className={`custom-nav ${transparent ? 'custom-nav--transparent' : ''}`}
        style={{
          height: `${metrics.headerHeight}px`,
          paddingTop: `${metrics.statusBarHeight}px`,
        }}
      >
        <View
          className='nav-inner'
          style={{
            height: `${metrics.navBarHeight}px`,
            paddingLeft: `${metrics.menuRight}px`,
            paddingRight: `${menuReserve}px`,
          }}
        >
          <View className='nav-left'>
            {showBack && (
              <View className='nav-back' onClick={handleBack}>
                <Text className='nav-back-icon'>‹</Text>
              </View>
            )}
          </View>
          <Text className='nav-title' numberOfLines={1}>{title}</Text>
          <View className='nav-right'>{rightContent}</View>
        </View>
      </View>
      <View className='custom-nav-spacer' style={{ height: `${metrics.headerHeight}px` }} />
    </>
  )
}
