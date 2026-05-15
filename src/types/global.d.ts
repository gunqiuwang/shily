declare const wx: {
  getSystemInfoSync?: () => {
    statusBarHeight?: number
    windowWidth: number
  }
  getWindowInfo?: () => {
    statusBarHeight?: number
    windowWidth?: number
  }
  getAppBaseInfo?: () => {
    statusBarHeight?: number
  }
  getDeviceInfo?: () => {
    screenWidth?: number
  }
  getMenuButtonBoundingClientRect: () => {
    top: number
    right: number
    width: number
    height: number
  }
  navigateTo: (options: { url: string }) => void
  reLaunch: (options: { url: string }) => void
  navigateBack: () => void
  cloud?: {
    init: (options: { env: string; traceUser?: boolean }) => void
    extend?: {
      AI?: {
        createModel: (provider: string) => {
          streamText: (options: {
            data: {
              model: string
              messages: Array<{
                role: 'system' | 'user' | 'assistant'
                content: string
              }>
            }
          }) => Promise<{
            eventStream?: AsyncIterable<{
              data?: string
            }>
          }>
        }
      }
    }
    callFunction: <T = unknown>(options: {
      name: string
      data?: Record<string, unknown>
      config?: {
        env?: string
      }
    }) => Promise<{ result?: T }>
  }
}

declare const SHILY_CHAT_ENDPOINT: string

declare function getCurrentPages(): Array<{
  route?: string
}>

declare module 'react-dom/client' {
  import type { ReactNode } from 'react'

  export function createRoot(container: Element | DocumentFragment): {
    render(children: ReactNode): void
    unmount(): void
  }
}

declare module '*.png' {
  const src: string
  export default src
}

interface ImportMeta {
  glob: (pattern: string, options?: Record<string, unknown>) => Record<string, string>
}
