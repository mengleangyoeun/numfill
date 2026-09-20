# ⚡ NumFill

<p align="center">
  <strong>A lightweight, privacy-first Chrome Extension for sequential form field auto-filling and random number range generation.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-blue?style=flat-square" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178c6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8.3-646cff?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Storage-Zero%20Persistence-green?style=flat-square" alt="Zero Storage" />
  <img src="https://img.shields.io/badge/Author-Mengleangyoeun-orange?style=flat-square" alt="Author" />
</p>

---

## 🌟 Overview

**NumFill** is a developer and QA productivity tool designed to automate filling multi-input forms on any webpage. Whether you are testing multi-digit verification codes, account numbers, order serials, or form sequences, NumFill detects all visible, editable inputs on the active tab and populates them sequentially in one click.

Created by **Mengleangyoeun**.

---

## ✨ Features

- ⚡ **Sequential Autofill:** Maps numbers one-by-one into detected form inputs in precise DOM order.
- 🎲 **Random Range Generator:** Generates random integer numbers within any custom `[Min, Max]` range.
  - **Quick Presets:** `2-digit` (`10`–`99`), `4-digit PIN` (`1000`–`9999`), `6-digit PIN` (`100000`–`999999`), `8-digit Phone`, `1-100`.
  - **Unique Toggle:** Guarantees zero duplicate numbers in generated batches.
- 🎯 **Automatic Field Detection:** Detects and counts `<input>` and `<textarea>` fields automatically.
  - Safely ignores non-fillable elements (`password`, `disabled`, `readonly`, `hidden`, `submit`, `button`, `checkbox`, `radio`).
  - Verifies true visibility (checks computed styles, layout dimensions, opacity, and `aria-hidden`).
- ⚛️ **Modern Framework Compatible:** Uses native prototype property setters (`HTMLInputElement.prototype`) and dispatches synthetic `input`, `change`, and `blur` events so **React, Next.js, Vue, and Angular** reactive states update instantly without getting stuck.
- 🔒 **Zero Data Storage & 100% Privacy:**
  - Pure in-memory ephemeral automation.
  - Leaves zero trace on disk, uses no `chrome.storage`, no cookies, no analytics, no external network requests.
  - Requests only minimal Chrome permissions (`activeTab`, `scripting`).
- 🧹 **1-Click Webpage Clear:** Wipes detected form fields on the active webpage cleanly and triggers framework state resets.
- 🔍 **Visual Highlighting:** Flashes non-destructive outline highlights on detected fields that auto-clear after 2.5 seconds.
- 📱 **Ultra-Compact UI:** High-density, segmented power-tool interface (~320px wide) designed to fit any display without vertical scrolling.

---

## 🚀 Installation

### Option 1: Quick Install (Pre-built ZIP — No Node.js Needed)

1. Go to the [Releases](https://github.com/mengleangyoeun/numfill/releases) page and download **`numfill.zip`**.
2. **Extract / Unzip** `numfill.zip` to a folder on your computer.
3. Open Google Chrome (or any Chromium browser like Brave, Edge, Opera).
4. In the address bar, navigate to:
   ```text
   chrome://extensions
   ```
5. In the top-right corner, turn on **Developer mode**.
6. In the top-left corner, click **Load unpacked**.
7. Select the unzipped `numfill` folder.
8. Pin **NumFill** to your Chrome toolbar! 🎉

---

### Option 2: Build from Source (For Developers)

```bash
# 1. Clone the repository
git clone https://github.com/mengleangyoeun/numfill.git
cd numfill

# 2. Install dependencies
pnpm install
# or: npm install

# 3. Build the production extension
pnpm run build
# or: npm run build

# 4. (Optional) Package to zip
npm run package
```

Then load the **`dist/`** directory in `chrome://extensions` via **Load unpacked**.

---

## 📖 How to Use

### 1. Random Range Mode (Default)
1. Open any webpage containing form inputs (e.g. registration, verification, or multi-field forms).
2. Click the **⚡ NumFill** icon in your Chrome toolbar.
3. The popup automatically detects the number of inputs (e.g. `● 5 inputs`).
4. Click any preset chip (e.g. **`2-digit`**, **`4-digit PIN`**, or enter custom Min/Max).
5. Click **`⚡ Fill X Fields Now`**:
   - The fields on your active tab populate immediately with random numbers within your range.
   - The inputs flash green to confirm success.

### 2. Manual List Mode
1. Click the **✍ Manual List** tab in the segmented switcher.
2. Enter your custom numbers (one number per line).
3. Click **`Fill Fields`** (or press <kbd>Ctrl</kbd> + <kbd>Enter</kbd>).

### 3. Utility Tools
- **Clear Page:** Click `🧹 Clear Page` in the bottom bar to reset all inputs on the active webpage.
- **Highlight:** Click `🔍 Highlight` (or the top count pill) to flash blue outlines on all detected fields.
- **Inspect Fields:** Click `▾ Inspect Fields` to expand the field drawer and see element IDs, names, and types.

---

## 🧪 Built-in Test Sandbox

NumFill includes an interactive test sandbox to test all features locally without needing external websites:

1. In your terminal, run:
   ```bash
   pnpm run dev
   # or: npm run dev
   ```
2. Open **[http://localhost:5173/](http://localhost:5173/)** in Chrome.
3. The sandbox includes:
   - **Scenario 1:** Core 5 inputs with real-time reactive state viewer.
   - **Scenario 2:** 10 batch fields.
   - **Scenario 3:** Excluded field tests (passwords, disabled, readonly, hidden inputs).
   - **Live Event Console:** Logs `INPUT`, `CHANGE`, and `BLUR` events in real-time.

---

## 🛠️ Project Structure

```text
numfill/
├── dist/                      # Compiled production extension
├── public/
│   ├── manifest.json          # Chrome Manifest V3 configuration
│   └── icons/                 # Extension icons (16, 48, 128)
├── src/
│   ├── background/
│   │   └── background.ts      # Minimal service worker
│   ├── components/
│   │   ├── FieldPreview.tsx   # Collapsible field inspector drawer
│   │   ├── Header.tsx         # Compact header & live input badge
│   │   ├── RandomGenerator.tsx# Range inputs, presets & 1-click fill
│   │   └── StatusBanner.tsx   # Toast notification alerts
│   ├── config/
│   │   └── siteConfigs.ts     # Per-domain custom selector overrides
│   ├── content/
│   │   ├── content.ts         # Content script message coordinator
│   │   ├── detector.ts        # Intelligent DOM scanner & visibility filter
│   │   ├── filler.ts          # Framework-compatible prototype value setter
│   │   └── highlighter.ts     # Temporary visual outline utility
│   ├── popup/
│   │   ├── App.tsx            # Main React popup UI & state controller
│   │   ├── main.tsx           # React root mounter
│   │   └── styles.css         # High-density developer-tool styling
│   ├── types/
│   │   └── index.ts           # Shared TypeScript interfaces & message types
│   └── utils/
│       ├── messaging.ts       # Tab querying & handshake protocol
│       ├── parser.ts          # Whitespace & line parser
│       ├── random.ts          # Random number range generation
│       └── storage.ts         # Ephemeral session utility (zero storage)
├── index.html                 # Interactive test sandbox
├── popup.html                 # Popup HTML template
├── test-page.html             # Standalone test page
├── vite.config.ts             # Popup & background bundler
└── vite.content.config.ts     # Standalone IIFE bundler for content script
```

---

## 🔐 Permissions & Privacy

NumFill strictly adheres to the principle of least privilege:

| Permission | Why It's Needed |
| :--- | :--- |
| `activeTab` | Temporary access to the currently active tab when the extension icon is clicked. Does **not** grant access to browsing history or other tabs. |
| `scripting` | Allows programmatic injection of the content script if a webpage was opened before the extension was reloaded. |

- ❌ **No storage permission:** Data is strictly ephemeral and kept in active React state only.
- ❌ **No host permissions (`<all_urls>`):** Extension only operates on the specific tab you invoke it on.
- ❌ **No tracking or analytics:** Zero network requests, telemetry, or external APIs.

---

## 👤 Author

Developed by **Mengleangyoeun**  
- GitHub: [@mengleangyoeun](https://github.com/mengleangyoeun)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
