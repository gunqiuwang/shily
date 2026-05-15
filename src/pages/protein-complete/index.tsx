import { View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import CustomNavBar from '../../components/CustomNavBar'
import GlassCard from '../../components/GlassCard'
import PrimaryButton from '../../components/PrimaryButton'
import ShilySuccess from '../../components/ShilySuccess'
import './index.scss'

export default function ProteinComplete() {
  useDidShow(() => {
    Taro.setStorageSync('shilyProteinBoostDone', true)
  })

  return (
    <View className='page protein-complete-page'>
      <CustomNavBar title='' />

      <View className='page-content protein-complete-content shily-flow-page'>
        <GlassCard className='complete-card' variant='tint'>
          <ShilySuccess
            title='这样就很好。'
            message={`蛋白已经补上了一点，\n不用一下子做到很多。`}
          />
        </GlassCard>

        <View className='complete-primary-wrap'>
          <PrimaryButton onClick={() => Taro.reLaunch({ url: '/pages/index/index' })}>
            回到首页
          </PrimaryButton>
        </View>
      </View>
    </View>
  )
}
