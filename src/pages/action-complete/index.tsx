import { Text, View } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import CustomNavBar from '../../components/CustomNavBar'
import GlassCard from '../../components/GlassCard'
import PrimaryButton from '../../components/PrimaryButton'
import ShilySuccess from '../../components/ShilySuccess'
import './index.scss'

type FlowType = 'glp1' | 'fasting' | 'carb' | 'muscle'

const completeCopy: Record<FlowType, { title: string; message: string }> = {
  glp1: {
    title: '这次状态已记录。',
    message: 'Shily 会把这次感受放进今天判断。\n接下来优先保住水分和一份容易入口的蛋白。',
  },
  fasting: {
    title: '今天这样就可以。',
    message: '窗口只是辅助。\n能稳定下来，比硬撑更重要。',
  },
  carb: {
    title: '这个选择挺稳的。',
    message: '主食压力轻一点，蛋白和蔬菜留住。\n不用一下子做得很严格。',
  },
  muscle: {
    title: '这一步已经算数。',
    message: '增肌不是只看训练。\n吃稳一点，恢复也要被算进去。',
  },
}

function normalizeType(type?: string): FlowType {
  if (type === 'glp1' || type === 'fasting' || type === 'carb' || type === 'muscle') return type
  return 'glp1'
}

export default function ActionComplete() {
  const router = useRouter()
  const type = normalizeType(router.params.type)
  const copy = completeCopy[type]

  return (
    <View className='page action-complete-page'>
      <CustomNavBar title='' />

      <View className='page-content action-complete-content'>
        <GlassCard className='action-complete-card' variant='tint'>
          <ShilySuccess title={copy.title} message={copy.message} mood='happy' />
        </GlassCard>

        <Text className='action-complete-note'>首页会按这次记录更新今天的重点，不会反复催你做同一件事。</Text>

        <View className='action-complete-primary'>
          <PrimaryButton onClick={() => Taro.reLaunch({ url: '/pages/index/index' })}>回到首页</PrimaryButton>
        </View>
      </View>
    </View>
  )
}
