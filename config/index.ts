import type { UserConfig } from '@tarojs/cli'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadLocalEnv() {
  const envPath = resolve(__dirname, '../.env')
  if (!existsSync(envPath)) return

  readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .forEach((line) => {
      const index = line.indexOf('=')
      if (index < 0) return
      const key = line.slice(0, index).trim()
      const value = line.slice(index + 1).trim()
      if (key && process.env[key] === undefined) {
        process.env[key] = value
      }
    })
}

loadLocalEnv()

const config: UserConfig = {
  projectName: 'shily',
  date: '2026-04-29',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: ['@tarojs/plugin-platform-h5'],
  defineConstants: {
    SHILY_CHAT_ENDPOINT: JSON.stringify(process.env.SHILY_CHAT_ENDPOINT || ''),
  },
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
