// @ts-check

import { app, BrowserWindow } from 'electron'
import url from 'url'
import path from 'path'

const isDevelopment = process.env.NODE_ENV !== 'production'

let mainWindow

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 550,
    autoHideMenuBar: true,
  })
  
  const url_ = isDevelopment ?
    `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}` :
    url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    })
  
  if (isDevelopment) {
    mainWindow.webContents.openDevTools({ mode: "detach" })
  }
  
  mainWindow.loadURL(url_)

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
