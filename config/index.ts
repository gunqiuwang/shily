import type { UserConfig } from '@tarojs/cli'

const config: UserConfig = {
  projectName: 'shily',
  date: '2026-04-29',
  designWidth: 390,
  deviceRatio: {
    '390:844': 1,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: ['@tarojs/plugin-platform-h5'],
  defineConstants: {},
  framework: 'react',
  compiler: 'vite',
  cacheDirectory: '.temp',
  mini: {
    compile: {
      exclude: ['src/assets/**'],
    },
  },
  h5: {
    esnextModules: ['@tarojs/plugin-platform-weapp'],
  },
}

export default config
