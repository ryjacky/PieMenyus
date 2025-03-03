import {BrowserWindow} from "electron";
import * as path from "path";
import * as fs from "fs";
import {PieletteAddonManager} from "../addon/PieletteAddonManager";
import {globalHotkeyService} from "../../main";
import {IGlobalKeyDownMap, IGlobalKeyEvent} from "node-global-key-listener";
import * as activeWindow from "active-win";

export class EditorWindow extends BrowserWindow {
  private readonly prefix = '../../';

  static readonly DEFAULT_WINDOW_WIDTH = 1080;
  static readonly DEFAULT_WINDOW_HEIGHT = 720;
  constructor() {
    super({
      minWidth: EditorWindow.DEFAULT_WINDOW_WIDTH,
      minHeight: EditorWindow.DEFAULT_WINDOW_HEIGHT,
      width: EditorWindow.DEFAULT_WINDOW_WIDTH,
      height: EditorWindow.DEFAULT_WINDOW_HEIGHT,
      titleBarStyle: 'hidden',
      titleBarOverlay: {
        color: '#1f2122',
        symbolColor: '#74b1be',

        // !!! IMPORTANT !!!
        // --title-bar-height should also be updated in styles.scss when you change the height
        // 2px is subtracted from the height because of the border
        height: 42 - 2
      },
      webPreferences: {
        nodeIntegration: false,
        preload: path.join(__dirname, '../../preload.js'),
        contextIsolation: true,  // false if you want to run e2e test with Spectron
      },
    });

    globalHotkeyService.addListener((e: IGlobalKeyEvent, down: IGlobalKeyDownMap) => {
      switch (e.state) {
        case "DOWN":
          this.webContents.send(
            'system.onKeyDown',
            "",
            down["LEFT CTRL"] || down["RIGHT CTRL"],
            down["LEFT ALT"] || down["RIGHT ALT"],
            down["LEFT SHIFT"] || down["RIGHT SHIFT"],
            e.rawKey.name);
          break;
        case "UP":
          this.webContents.send('system.onKeyUp')
          break;
      }
    });

    this.loadEditorURL();
    this.preventClose();
  }

  private loadEditorURL() {
    // Path when running electron executable
    let editorWindowPath = this.prefix + './index.html';

    if (fs.existsSync(path.join(__dirname, this.prefix + '../dist/index.html'))) {
      // Path when running electron in local folder
      editorWindowPath = this.prefix + '../dist/index.html';
    }

    const editorWindowURL = new URL(path.join('file:', __dirname, editorWindowPath));
    this.loadURL(editorWindowURL.href);
  }

  private preventClose() {
    this.on('close', (event) => {
      event.preventDefault();
      this.hide();
    });
  }
}
