import { Image, View } from '@tarojs/components'
import './index.scss'

export type AppIconName =
  | 'home'
  | 'plus'
  | 'sparkle'
  | 'chart'
  | 'user'
  | 'droplet'
  | 'egg'
  | 'flag'
  | 'activity'
  | 'clock'
  | 'cloud'
  | 'send'
  | 'settings'
  | 'bell'
  | 'target'
  | 'bookmark'
  | 'group'
  | 'notebook'
  | 'route'
  | 'shirt'
  | 'moon'
  | 'sun'
  | 'chevron-right'
  | 'calendar'
  | 'camera'
  | 'close'
  | 'arrow-left'
  | 'check'

interface AppIconProps {
  name: AppIconName
  size?: number
  color?: string
  tone?: IconTone
  strokeWidth?: number
  className?: string
}

export type IconTone = 'muted' | 'active' | 'deep' | 'white'

const colorToneMap: Record<string, IconTone> = {
  '#6b7c76': 'muted',
  '#9aa8a2': 'muted',
  '#7bc89c': 'active',
  '#2f6b4f': 'deep',
  '#f8faf7': 'white',
}

const toneColorMap: Record<IconTone, string> = {
  muted: '#6B7C76',
  active: '#7BC89C',
  deep: '#2F6B4F',
  white: '#F8FAF7',
}

function getTone(color?: string): IconTone {
  if (!color) return 'muted'
  return colorToneMap[color.toLowerCase()] || 'muted'
}

function getIconSrc(name: AppIconName, tone: IconTone) {
  return `/assets/icons/${name}-${tone}.png`
}

export default function AppIcon({
  name,
  size = 24,
  color,
  tone,
  className = '',
}: AppIconProps) {
  const iconTone = tone || getTone(color)
  const src = getIconSrc(name, iconTone)
  const colorVar = color || toneColorMap[iconTone]

  return (
    <View
      className={`app-icon ${className}`}
      style={{
        width: `${size}rpx`,
        height: `${size}rpx`,
        '--app-icon-color': colorVar,
      } as any}
    >
      <Image className='app-icon__image' src={src} mode='aspectFit' />
    </View>
  )
}
