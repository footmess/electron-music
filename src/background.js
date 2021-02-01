"use strict";

import { app, protocol, BrowserWindow } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
// The globalShortcut module can register/unregister a global keyboard shortcut with the operating system so that you can customize the operations for various shortcuts
const { ipcMain, globalShortcut } = require("electron");
const isDevelopment = process.env.NODE_ENV !== "production";
// 获取实例锁
const appLock = app.requestSingleInstanceLock();
let win;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
]);

async function createWindow() {
  // Create the browser window. 
  // https://www.electronjs.org/docs/api/browser-window
  win = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    frame: false,
    resizable: false,
    titleBarStyle: "hidden",
    backgroundColor: "#2B3871",
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: true,
      // preload: `${__static}/preload.js`
    }
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }

  win.on("closed", () => {
    // 解除引用
    win = null;
  })
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
if (!appLock) {
  app.quit()
} else {
  // 主进程监听是否有第二个实例
  // https://www.electronjs.org/docs/api/app#apprequestsingleinstancelock
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    // console.log({ event, commandLine, workingDirectory });
    // Send an asynchronous message to the renderer process via channel, along with arguments
    win.webContents.send("path", `${commandLine[commandLine.length - 1]}`);
    // Someone tried to run a second instance, we should focus our window.
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  })
  app.on("ready", async () => {
    // if (isDevelopment && !process.env.IS_TEST) {
    //   // Install Vue Devtools
    //   try {
    //     await installExtension(VUEJS_DEVTOOLS);
    //   } catch (e) {
    //     console.error("Vue Devtools failed to install:", e.toString());
    //   }
    // }
    // 注册快捷方式
    globalShortcut.register("CommandOrControl+K", function () {
      win.webContents.openDevTools();
    })
    createWindow();
  });
}

// 主进程监听渲染进程传来的事件
ipcMain.on("close", () => {
  win.close();
  app.quit();
});

ipcMain.on("minimize", () => {
  win.minimize();
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", data => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
