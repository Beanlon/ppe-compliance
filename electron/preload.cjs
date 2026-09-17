const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('gearsightDesktop', {
  platform: process.platform,
  isDesktop: true,
})
