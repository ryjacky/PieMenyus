import {app, BrowserWindow, Menu, screen, Tray} from 'electron';
import {initElectronAPI, initLoggerForRenderer} from "./src/ipcBridge";
import {Log} from "pielette-core";
import {PieletteAddonManager} from "./src/plugin/PieletteAddonManager";
import {PieMenuWindow} from "./src/pieletteWindows/PieMenuWindow";
import {EditorWindow} from "./src/pieletteWindows/EditorWindow";
import {PieEditorWindow} from "./src/pieletteWindows/PieEditorWindow";
import {PieletteEnv} from "pielette-core/lib/PieletteEnv";
import {SplashScreenWindow} from "./src/pieletteWindows/SplashScreenWindow";

// ------------------------------- Global Variables -------------------------------
let pieMenuWindow: PieMenuWindow | undefined;
let editorWindow: EditorWindow | undefined;
let splashScreenWindow: SplashScreenWindow | undefined;
app.setPath("userData", PieletteEnv.DEFAULT_DATA_PATH);

let tray = null;

// ------------------------------- Main -------------------------------
// Added 400 ms to fix the black background issue while using transparent window.
// More details at https://github.com/electron/electron/issues/15947
app.on('ready', () => setTimeout(openSplashScreen, 400));

// Note: windows-all-closed listener is removed
// because we want to keep the app running in the background

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (editorWindow === null) {
    openSplashScreen();
  }
});

// Initialization
// User data is initialized in app.component.ts and can only be initialized there (with minimal code).

initElectronAPI();
initLoggerForRenderer();

PieletteAddonManager.loadPlugins().then(() => {
  splashScreenWindow?.close();

  pieMenuWindow = new PieMenuWindow();
  editorWindow = new EditorWindow();

  initSystemTray();

  new PieEditorWindow(1);
});

// ------------------------------- Helper Functions -------------------------------
function openSplashScreen(): BrowserWindow {
  splashScreenWindow = new SplashScreenWindow();
  return splashScreenWindow;
}

function initSystemTray() {
  tray = new Tray(__dirname + '/assets/favicon.ico')
  const contextMenu = Menu.buildFromTemplate([
    {label: 'AutoHotPie', type: "normal", enabled: false},
    {type: "separator"},
    {
      label: 'Setting', type: "normal", click: () => {
        editorWindow?.show();
      }
    },
    {
      label: 'Restart', type: "normal", click: () => {
        // TODO: IMPLEMENTATION
        Log.main.warn("Item1 clicked")
      }
    },
    {
      label: 'Reload Service', type: "normal", click: () => {
        // TODO: IMPLEMENTATION
        Log.main.warn("Item1 clicked")
      }
    },
    {
      label: 'Exit', type: "normal", click: () => {
        app.exit();
      }
    },
  ])
  tray.setToolTip('Pie menyuuus!')
  tray.setContextMenu(contextMenu)
}


export function disablePieMenu() {
  pieMenuWindow?.disable();
}
export function enablePieMenu() {
  pieMenuWindow?.enable();
}

export function hidePieMenu() {
  pieMenuWindow?.hide();
}
