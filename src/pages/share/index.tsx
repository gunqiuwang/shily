import { Button, Image, View, Text } from '@tarojs/components'
import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import AppIcon from '../../components/AppIcon'
import CustomNavBar from '../../components/CustomNavBar'
import GlassCard from '../../components/GlassCard'
import PrimaryButton from '../../components/PrimaryButton'
import { uiAssets } from '../../shily/uiAssets'
import './index.scss'

const shareCardImage = '/assets/brand/shily-share-card.png'
const searchQrImage = '/assets/brand/shily-search-qr.png'

const shareSections = [
  {
    title: '下一餐',
    desc: '早餐、午餐、晚餐轻松规划',
    icon: 'egg',
    image: uiAssets.feature.meal,
  },
  {
    title: '喝水提醒',
    desc: '打开首页就能看到缺口',
    icon: 'droplet',
    image: uiAssets.feature.water,
  },
  {
    title: '进食窗口',
    desc: '轻断食时间一目了然',
    icon: 'clock',
    image: uiAssets.feature.window,
  },
  {
    title: '营养与蛋白',
    desc: '热量、蛋白、碳水清晰掌握',
    icon: 'chart',
    image: uiAssets.feature.nutrition,
  },
  {
    title: '记录节奏',
    desc: '饮食、运动、情绪轻松记录',
    icon: 'notebook',
    image: uiAssets.feature.record,
  },
  {
    title: '按方案执行',
    desc: '结合目标与数据给建议',
    icon: 'flag',
    image: uiAssets.feature.plan,
  },
] as const

const shareCard = {
  title: '下一餐、喝水、进食窗口和记录节奏，打开就能看到。',
  desc: '适合 GLP-1、轻断食、控碳和日常减脂。',
  shareTitle: '我在用食律 Shily 做饮食和节律选择',
}

export default function Share() {
  useShareAppMessage(() => ({
    title: shareCard.shareTitle,
    path: '/pages/index/index?from=share&card=all',
    imageUrl: '/assets/shily/happy.png',
  }))

  useShareTimeline(() => ({
    title: '食律 Shily',
    query: 'from=timeline',
    imageUrl: '/assets/shily/happy.png',
  }))

  const saveShareCard = () => {
    Taro.getImageInfo({
      src: shareCardImage,
      success: ({ path }) => {
        Taro.saveImageToPhotosAlbum({
          filePath: path,
          success: () => Taro.showToast({ title: '已保存到相册', icon: 'none' }),
          fail: () => Taro.showToast({ title: '保存失败，请打开相册权限', icon: 'none' }),
        })
      },
      fail: () => Taro.showToast({ title: '分享卡生成失败', icon: 'none' }),
    })
  }

  return (
    <View className='page share-page'>
      <CustomNavBar title='分享卡' showBack />

      <View className='page-content share-content'>
        <GlassCard className='share-card' variant='hero'>
          <View className='share-card-hero'>
            <View className='share-card-head'>
              <View className='share-brand-row'>
                <Text className='share-kicker'>食律 Shily</Text>
                <View className='share-leaf' />
              </View>
              <Text className='share-brand-subtitle'>饮食和生活节律助手</Text>
              <Text className='share-title'>{shareCard.title}</Text>
              <Text className='share-desc'>{shareCard.desc}</Text>
            </View>

            <View className='share-shily'>
              <Image className='share-shily-image' src={uiAssets.shily.leaf} mode='aspectFit' />
              <View className='share-spark share-spark--one' />
              <View className='share-spark share-spark--two' />
            </View>
          </View>

          <View className='share-card-footer'>
            <View className='share-feature-grid'>
              {shareSections.map((item) => (
                <View className='share-feature' key={item.title}>
                  <View className='share-feature-icon'>
                    <Image className='share-feature-illustration' src={item.image} mode='aspectFit' />
                  </View>
                  <View className='share-feature-copy'>
                    <Text className='share-feature-title'>{item.title}</Text>
                    <Text className='share-feature-desc'>{item.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View className='share-search-panel'>
              <Image className='share-search-qr' src={searchQrImage} mode='aspectFit' />
              <View className='share-search-copy'>
                <View className='share-search-head'>
                  <Text className='share-search-mark'>✳</Text>
                  <Text className='share-search-title'>微信搜一搜</Text>
                </View>
                <View className='share-search-pill'>
                  <Text className='share-search-icon'>⌕</Text>
                  <Text>食律Shily</Text>
                </View>
                <Text className='share-search-desc'>长按识别二维码，体验食律 Shily</Text>
              </View>
              <View className='share-search-avatar'>
                <Image className='share-search-avatar-image' src={uiAssets.shily.heart} mode='aspectFit' />
              </View>
            </View>
          </View>
        </GlassCard>

        <View className='share-actions'>
          <PrimaryButton onClick={saveShareCard} size='large' className='share-button' icon='bookmark' iconTone='deep'>
            保存分享卡
          </PrimaryButton>
          <Button className='mini-share-button' openType='share'>
            <View className='mini-share-content'>
              <AppIcon name='send' size={32} tone='white' />
              <View className='mini-share-copy'>
                <Text className='mini-share-title'>分享给朋友</Text>
                <Text className='mini-share-sub'>一起变好</Text>
              </View>
            </View>
          </Button>
        </View>
        <Text className='share-safe-note'>分享生活节律，传递温柔力量。卡片不会展示体重、热量和私人记录。</Text>
      </View>
    </View>
  )
}
