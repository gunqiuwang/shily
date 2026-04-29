import { View, Text, Image } from '@tarojs/components'
import { colors } from '../../styles/tokens'
import GlassCard from '../../components/GlassCard'
import BottomTabBar from '../../components/BottomTabBar'
import './index.scss'

const menuItems = [
  { icon: '📊', label: '我的数据', path: '/pages/data/index' },
  { icon: '📝', label: '我的记录', path: '/pages/record/index' },
  { icon: '🎯', label: '我的目标', path: '/pages/goal/index' },
  { icon: '🔔', label: '我的提醒', path: '/pages/reminder/index' },
  { icon: '⭐', label: '我的收藏', path: '' },
  { icon: '⚙️', label: '设置与帮助', path: '' },
]

export default function Mine() {
  return (
    <View className='mine-page'>
      {/* 用户信息 */}
      <View className='mine-page__header'>
        <View className='mine-page__avatar'>
          <Text className='mine-page__avatar-text'>郭</Text>
        </View>
        <View className='mine-page__info'>
          <Text className='mine-page__name'>郭瑶</Text>
          <Text className='mine-page__days'>Shily 陪伴你 23 天</Text>
        </View>
      </View>

      {/* 会员卡片 */}
      <GlassCard className='mine-page__vip-card'>
        <View className='mine-page__vip-content'>
          <Text className='mine-page__vip-title'>会员中心</Text>
          <Text className='mine-page__vip-desc'>解锁更懂你的 Shily</Text>
        </View>
        <View className='mine-page__vip-btn'>
          <Text>立即开通</Text>
        </View>
      </GlassCard>

      {/* 菜单列表 */}
      <View className='mine-page__menu'>
        {menuItems.map((item) => (
          <View
            key={item.label}
            className='mine-page__menu-item'
            onClick={() => item.path && wx.navigateTo({ url: item.path })}
          >
            <View className='mine-page__menu-left'>
              <Text className='mine-page__menu-icon'>{item.icon}</Text>
              <Text className='mine-page__menu-label'>{item.label}</Text>
            </View>
            <Text className='mine-page__menu-arrow'>›</Text>
          </View>
        ))}
      </View>

      <BottomTabBar />
    </View>
  )
}
