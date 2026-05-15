export type ShilyPlanId =
  | 'fat_loss'
  | 'muscle_gain'
  | 'fasting_12_12'
  | 'fasting_14_10'
  | 'fasting_16_8'
  | 'fasting_18_6'
  | 'fasting_5_2'
  | 'keto_standard'
  | 'low_carb'
  | 'glp1_semaglutide'
  | 'glp1_tirzepatide'
  | 'glp1_mazdutide'
  | 'glp1_unspecified'

export interface ShilyPlan {
  id: ShilyPlanId
  group: 'body' | 'fasting' | 'carb' | 'glp1'
  title: string
  desc: string
  focus: string
  actionHint: string
  safetyNote?: string
}

export const DEFAULT_SHILY_PLAN: ShilyPlanId = 'fat_loss'

export const shilyPlans: ShilyPlan[] = [
  {
    id: 'fat_loss',
    group: 'body',
    title: '温和减脂',
    desc: '以可坚持的小行动为主，不做高压管理。',
    focus: '蛋白质',
    actionHint: '先把蛋白、水分和记录节奏稳住。',
  },
  {
    id: 'muscle_gain',
    group: 'body',
    title: '增肌塑形',
    desc: '优先蛋白、训练日恢复和稳定进食，不吃得太少。',
    focus: '蛋白与恢复',
    actionHint: '训练日前后先照顾蛋白和恢复。',
  },
  {
    id: 'fasting_12_12',
    group: 'fasting',
    title: '12:12 轻节律',
    desc: '适合刚开始调整进食时间的人。',
    focus: '进食窗口',
    actionHint: '今天先把进食时间稳定下来。',
  },
  {
    id: 'fasting_14_10',
    group: 'fasting',
    title: '14:10 温和轻断食',
    desc: '比 16:8 更柔和，适合多数日常场景。',
    focus: '进食窗口',
    actionHint: '今天先守住 10 小时进食窗口就好。',
  },
  {
    id: 'fasting_16_8',
    group: 'fasting',
    title: '16:8 轻断食',
    desc: '关注 8 小时进食窗口，也要保证营养够。',
    focus: '进食窗口',
    actionHint: '窗口内先把蛋白和水分补稳。',
  },
  {
    id: 'fasting_18_6',
    group: 'fasting',
    title: '18:6 进阶窗口',
    desc: '更紧的窗口，需要更注意能量和舒适度。',
    focus: '进食窗口',
    actionHint: '如果今天身体发虚，就不要硬卡窗口。',
    safetyNote: '不适合孕期、进食障碍风险或需要规律进食的人群。',
  },
  {
    id: 'fasting_5_2',
    group: 'fasting',
    title: '5:2 温和管理',
    desc: '更像周节律，不适合频繁临时切换。',
    focus: '周节律',
    actionHint: '今天只需要确认是不是轻量日。',
    safetyNote: '轻量日不应自行极端节食，有疾病或用药情况需咨询医生。',
  },
  {
    id: 'keto_standard',
    group: 'carb',
    title: '生酮友好',
    desc: '更关注碳水边界、脂肪来源和真实饱腹感。',
    focus: '碳水节奏',
    actionHint: '下一餐选简单、低碳水一点的组合。',
  },
  {
    id: 'low_carb',
    group: 'carb',
    title: '轻控碳',
    desc: '不用极端，只让碳水更有分寸。',
    focus: '碳水节奏',
    actionHint: '主食少一点，蛋白和蔬菜稳一点。',
  },
  {
    id: 'glp1_semaglutide',
    group: 'glp1',
    title: 'GLP-1 司美格鲁肽类',
    desc: '食欲降低时，优先照顾少量蛋白、水分和胃部舒适。',
    focus: '少量蛋白',
    actionHint: '先吃一点温和蛋白，别硬撑。',
    safetyNote: '仅做饮食节奏辅助，不提供用药剂量、注射安排或医疗判断。',
  },
  {
    id: 'glp1_tirzepatide',
    group: 'glp1',
    title: 'GLP-1/GIP 替尔泊肽类',
    desc: '关注食欲低、恶心、进食不足时的轻量补充。',
    focus: '少量蛋白',
    actionHint: '如果吃不下，先选一小份更容易入口的蛋白。',
    safetyNote: '仅做饮食节奏辅助，不提供用药剂量、注射安排或医疗判断。',
  },
  {
    id: 'glp1_mazdutide',
    group: 'glp1',
    title: 'GLP-1/GCGR 玛仕度肽类',
    desc: '关注水分、蛋白和胃肠舒适度，避免过度进食压力。',
    focus: '少量蛋白',
    actionHint: '今天先把水分和一点蛋白照顾到。',
    safetyNote: '仅做饮食节奏辅助，不提供用药剂量、注射安排或医疗判断。',
  },
  {
    id: 'glp1_unspecified',
    group: 'glp1',
    title: 'GLP-1 支持（不指定药物）',
    desc: '适合不想记录具体药物，只需要饮食陪伴的人。',
    focus: '少量蛋白',
    actionHint: '先吃一点温和蛋白，别硬撑。',
    safetyNote: '仅做饮食节奏辅助，不提供用药剂量、注射安排或医疗判断。',
  },
]

export function getShilyPlan(id?: string): ShilyPlan {
  return shilyPlans.find((plan) => plan.id === id) || shilyPlans[0]
}
