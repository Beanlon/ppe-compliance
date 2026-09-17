export {}

declare global {
  interface Window {
    gearsightDesktop?: {
      platform: NodeJS.Platform
      isDesktop: boolean
    }
  }
}
