import { Image, Text, View } from '@tarojs/components'
import { useEffect, useMemo, useRef, useState } from 'react'
import { DailyInput, ShilyMood, ShilyVisual } from '../../shily/types'
import { calculateShilyVisual, getDefaultDailyInput } from '../../shily/visualCalculator'
import { ShilyMotionMood, shilyMotion } from '../../shily/motion'
import './index.scss'

export type ShilyAvatarMood = 'normal' | 'happy' | 'tired' | 'puffy' | 'low_energy' | 'stressed'

interface ShilyAvatarProps {
  input?: DailyInput
  status?: 'happy' | 'encourage' | 'thinking' | 'tired' | 'surprised' | 'cheer'
  mood?: ShilyAvatarMood
  size?: 'small' | 'medium' | 'large'
  message?: string
  showMessage?: boolean
  showScore?: boolean
  motion?: ShilyMotionMood
}

const statusToMood: Record<NonNullable<ShilyAvatarProps['status']>, ShilyMood> = {
  happy: 'clear',
  encourage: 'clear',
  thinking: 'stressed',
  tired: 'tired',
  surprised: 'puffy',
  cheer: 'clear',
}

const chatMoodToVisualMood: Record<ShilyAvatarMood, ShilyMood> = {
  normal: 'clear',
  happy: 'clear',
  tired: 'tired',
  puffy: 'puffy',
  low_energy: 'low_energy',
  stressed: 'stressed',
}

const sizeConfig = {
  small: { wrapper: 132, imageW: 148, imageH: 125 },
  medium: { wrapper: 238, imageW: 264, imageH: 223 },
  large: { wrapper: 342, imageW: 372, imageH: 314 },
}

const moodAssets: Record<ShilyMood, string> = {
  balanced: '/assets/shily/normal.png',
  clear: '/assets/shily/happy.png',
  tired: '/assets/shily/tired.png',
  puffy: '/assets/shily/puffy.png',
  low_energy: '/assets/shily/low-energy.png',
  stressed: '/assets/shily/stressed.png',
}

const moodAssetScale: Record<ShilyMood, number> = {
  balanced: 1,
  clear: 1,
  tired: 1.16,
  puffy: 1.08,
  low_energy: 1.2,
  stressed: 1.15,
}

interface RenderLayer {
  key: string
  src: string
  scale: number
  active: boolean
}

export default function ShilyAvatar({
  input,
  status = 'happy',
  mood,
  size = 'medium',
  message,
  showMessage = false,
  showScore = false,
  motion,
}: ShilyAvatarProps) {
  const visual = useMemo<ShilyVisual>(() => {
    if (input) return calculateShilyVisual(input)
    const base = calculateShilyVisual(getDefaultDailyInput())
    return { ...base, mood: mood ? chatMoodToVisualMood[mood] : statusToMood[status] }
  }, [input, mood, status])

  const config = sizeConfig[size]
  const finalMessage = message || visual.message
  const shilyAsset = moodAssets[visual.mood] || moodAssets.balanced
  const assetScale = moodAssetScale[visual.mood] || 1
  const motionKey = motion || (mood || 'normal')
  const motionConfig = shilyMotion.avatar[motionKey] || shilyMotion.avatar.normal
  const activeKey = `${visual.mood}-${shilyAsset}`
  const previousLayerRef = useRef<RenderLayer | null>(null)
  const cleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [previousLayer, setPreviousLayer] = useState<RenderLayer | null>(null)

  useEffect(() => {
    const lastLayer = previousLayerRef.current

    if (lastLayer && lastLayer.key !== activeKey) {
      setPreviousLayer({ ...lastLayer, active: false })
      if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current)
      cleanupTimerRef.current = setTimeout(() => {
        setPreviousLayer(null)
        cleanupTimerRef.current = null
      }, 420)
    }

    previousLayerRef.current = {
      key: activeKey,
      src: shilyAsset,
      scale: assetScale,
      active: true,
    }
  }, [activeKey, assetScale, shilyAsset])

  useEffect(() => {
    return () => {
      if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current)
    }
  }, [])

  return (
    <View
      className={`shily-avatar shily-${size} shily-${visual.mood} shily-status-${status} shily-motion-${motionKey}`}
      style={{
        width: `${config.wrapper}rpx`,
        height: showMessage || message ? 'auto' : `${config.wrapper}rpx`,
        '--shily-image-w': `${config.imageW}rpx`,
        '--shily-image-h': `${config.imageH}rpx`,
        '--shily-float-y': `${visual.floatY}rpx`,
        '--shily-scale': visual.scale,
        '--shily-opacity': visual.opacity,
        '--shily-brightness': visual.brightness,
        '--shily-saturation': visual.saturation,
        '--shily-blur': `${visual.blur}rpx`,
        '--shily-duration': `${motionConfig.duration || visual.breathSpeed}s`,
        '--shily-motion-y': `${motionConfig.y}rpx`,
        '--shily-motion-scale': motionConfig.scale,
        '--shily-asset-scale': assetScale,
      } as any}
    >
      <View className='shily-glow' />
      <View className='shily-shadow' />
      <View className='shily-stage'>
        {previousLayer && (
          <Image
            key={`previous-${previousLayer.key}`}
            className='shily-image shily-image--previous'
            src={previousLayer.src}
            mode='aspectFit'
            style={{ '--shily-layer-scale': previousLayer.scale } as any}
          />
        )}
        <Image
          key={`current-${activeKey}`}
          className='shily-image shily-image--current'
          src={shilyAsset}
          mode='aspectFit'
          style={{ '--shily-layer-scale': assetScale } as any}
        />
      </View>
      {showScore && (
        <View className='shily-score'>
          <Text>{Math.round(visual.opacity * 100)}</Text>
        </View>
      )}
      {(showMessage || message) && <Text className='shily-message'>{finalMessage}</Text>}
    </View>
  )
}
