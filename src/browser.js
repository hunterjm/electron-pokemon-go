import electron from 'electron';
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

import fs from 'fs';
import os from 'os';
import path from 'path';

process.env.NODE_PATH = path.join(__dirname, 'node_modules');
process.env.RESOURCES_PATH = path.join(__dirname, '/../resources');
if (process.platform !== 'win32') {
  process.env.PATH = `/usr/local/bin:${process.env.PATH}`;
}

let size = {};
try {
  size = JSON.parse(fs.readFileSync(path.join(app.getPath('userData'), 'size')));
} catch (err) {
  // continue regardless of error
}

app.on('ready', () => {
  const mainWindow = new BrowserWindow({
    width: size.width || 1080,
    height: size.height || 680,
    minWidth: os.platform() === 'win32' ? 400 : 700,
    minHeight: os.platform() === 'win32' ? 260 : 500,
    standardWindow: true,
    resizable: true,
    frame: true,
    show: false,
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.openDevTools({ detach: true });
  }

  mainWindow.loadURL(path.normalize(`file://${path.join(__dirname, 'index.html')}`));

  app.on('activate-with-no-open-windows', () => {
    if (mainWindow) {
      mainWindow.show();
    }
    return false;
  });

  if (os.platform() === 'win32') {
    mainWindow.on('close', () => {
      mainWindow.webContents.send('application:quitting');
      return true;
    });

    app.on('window-all-closed', () => {
      app.quit();
    });
  } else if (os.platform() === 'darwin') {
    app.on('before-quit', () => {
      mainWindow.webContents.send('application:quitting');
    });
  }

  mainWindow.webContents.on('new-window', (e) => {
    e.preventDefault();
  });

  mainWindow.webContents.on('will-navigate', (e, url) => {
    if (url.indexOf('build/index.html#') < 0) {
      e.preventDefault();
    }
  });

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.setTitle('Pokemon Go');
    mainWindow.show();
    mainWindow.focus();
  });
});
