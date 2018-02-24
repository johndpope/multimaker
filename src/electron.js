// @ts-check

import url from 'url'
import path from 'path'
import { app, BrowserWindow } from 'electron'
import { enableLiveReload } from 'electron-compile'

const isDevelopment = process.env.NODE_ENV !== 'production'

if (!process.argv[2]) {
  console.error('No project specified')
  process.exit(1)
}

let mainWindow

function createMainWindow() {
  if (isDevelopment) {
    BrowserWindow.addDevToolsExtension(
      // TODO: Generalize this so it works on other hosts and with other users
      "C:\\Users\\brad\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\fmkadmapgofadopljbjfkapdkoienihi\\2.5.2_0"
    );
  }
  mainWindow = new BrowserWindow({
    width: 800,
    height: 550,
    autoHideMenuBar: true,
    backgroundColor: '#000000',
    webPreferences: {
      experimentalFeatures: true
    }
  })
  
  if (isDevelopment) {
    mainWindow.webContents.openDevTools({ mode: "undocked" })
    enableLiveReload()
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
