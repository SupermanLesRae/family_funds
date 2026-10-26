// FamilyFunds Mac shell: loads the deployed web app. No secrets live here; the URL is public.
const { app, BrowserWindow, shell } = require("electron");
const path = require("node:path");

const APP_URL = process.env.FAMILYFUNDS_URL || require("./config.json").url;
const origin = new URL(APP_URL).origin;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 380,
    title: "FamilyFunds",
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });

  // Anything outside the app's own origin opens in the default browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (e, url) => {
    if (new URL(url).origin !== origin && !url.startsWith("file://")) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });
  // Offline / unreachable: show a page with a Retry button.
  win.webContents.on("did-fail-load", (_e, code, _desc, _url, isMainFrame) => {
    if (isMainFrame && code !== -3) win.loadFile(path.join(__dirname, "offline.html"), { query: { url: APP_URL } });
  });

  win.loadURL(APP_URL);
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => BrowserWindow.getAllWindows().length === 0 && createWindow());
});
app.on("window-all-closed", () => process.platform !== "darwin" && app.quit());
