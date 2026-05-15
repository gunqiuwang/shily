export type ShilyFlowType =
  | 'protein_flow'
  | 'water_flow'
  | 'sleep_flow'
  | 'mood_flow'
  | 'move_flow'
  | 'rhythm_flow'

export type ShilyMotionMood =
  | 'normal'
  | 'happy'
  | 'tired'
  | 'low_energy'
  | 'stressed'
  | 'puffy'
  | 'protein'
  | 'success'

export const shilyMotion = {
  duration: {
    slow: 3.2,
    normal: 2.4,
    quick: 0.8,
    micro: 0.35,
  },
  ease: [0.22, 1, 0.36, 1],
  avatar: {
    normal: { y: -4, scale: 1.01, duration: 3.2 },
    happy: { y: -6, scale: 1.02, duration: 2.8 },
    tired: { y: 3, scale: 0.99, duration: 3.8 },
    low_energy: { y: 5, scale: 0.965, duration: 4.2 },
    stressed: { y: -2, scale: 1, duration: 2.2 },
    puffy: { y: -3, scale: 1.055, duration: 3.4 },
    protein: { y: -5, scale: 1.02, duration: 2.8 },
    success: { y: -10, scale: 1.045, duration: 0.9 },
  },
  page: {
    initial: { opacity: 0, y: 12 },
    enter: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    duration: 0.35,
  },
  card: {
    initial: { opacity: 0, y: 12, scale: 0.98 },
    enter: { opacity: 1, y: 0, scale: 1 },
    duration: 0.35,
    stagger: 0.08,
  },
  flow: {
    protein_flow: {
      avatarMotion: 'protein',
      action: 'progress-grow',
      completion: 'brighten',
    },
    water_flow: {
      avatarMotion: 'normal',
      action: 'water-increment',
      completion: 'button-settle',
    },
    sleep_flow: {
      avatarMotion: 'tired',
      action: 'dim-background',
      completion: 'slow-breath',
    },
    mood_flow: {
      avatarMotion: 'low_energy',
      action: 'text-fade',
      completion: 'quiet-background',
    },
    move_flow: {
      avatarMotion: 'happy',
      action: 'counter-grow',
      completion: 'settle',
    },
    rhythm_flow: {
      avatarMotion: 'normal',
      action: 'idle',
      completion: 'soft-copy',
    },
  } satisfies Record<ShilyFlowType, { avatarMotion: ShilyMotionMood; action: string; completion: string }>,
} as const
