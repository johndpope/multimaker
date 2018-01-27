// @ts-check

import { app, BrowserWindow } from 'electron'
import { enableLiveReload } from 'electron-compile'
import url from 'url'
import path from 'path'

const isDevelopment = process.env.NODE_ENV !== 'production'

let mainWindow

function createMainWindow() {
  enableLiveReload()
  mainWindow = new BrowserWindow({
    width: 800,
    height: 550,
    autoHideMenuBar: true,
  })
  
  if (isDevelopment) {
    mainWindow.webContents.openDevTools({ mode: "detach" })
  }
  
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.on('devtools-opened', () => {
    mainWindow.focus()
    setImmediate(() => {
      mainWindow.focus()
    })
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow()
  }
})

app.on('ready', createMainWindow)
