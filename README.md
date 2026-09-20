# NumFill by Mengleangyoeun

A lightweight, zero-storage Chrome extension built with **Manifest V3 + TypeScript + React 19 + Vite**. It automatically detects editable form inputs on any active webpage and sequentially fills them with generated ranges (2-digit, PINs, etc.) or custom lists.

---

## 1. Project Structure

```text
numfill/
├── dist/                      # Built extension ready to load in Chrome
│   ├── manifest.json
│   ├── popup.html
│   ├── background.js
│   ├── content.js             # Self-contained IIFE script
│   ├── icons/
│   └── assets/
├── public/                    # Static assets copied directly to dist/
│   ├── manifest.json
│   └── icons/
│       ├── icon-16.png
│       ├── icon-48.png
│       └── icon-128.png
├── src/
│   ├── background/
│   │   └── background.ts      # Minimal MV3 service worker
│   ├── components/
│   │   ├── FieldPreview.tsx   # Compact collapsible detected field inspector
│   │   ├── Header.tsx         # Compact extension header & active host pill
│   │   ├── RandomGenerator.tsx # Min-max range, presets & 1-click autofill
│   │   └── StatusBanner.tsx   # Feedback alerts (success, warning, error)
│   ├── config/
│   │   └── siteConfigs.ts     # Extensible site-specific selector overrides
│   ├── content/
│   │   ├── content.ts         # Content script message coordinator
│   │   ├── detector.ts        # DOM input detection & visibility filtering
│   │   ├── filler.ts          # Framework-compatible value setter & dispatcher
│   │   └── highlighter.ts     # Temporary non-destructive visual outlining
│   ├── popup/
│   │   ├── App.tsx            # Main React popup UI & business logic
│   │   ├── main.tsx           # React entry point
│   │   └── styles.css         # Modern, high-density developer tool styling
│   ├── types/
│   │   └── index.ts           # Shared TypeScript interfaces & messaging contracts
│   └── utils/
│       ├── messaging.ts       # Tab querying, injection, and message wrappers
│       ├── parser.ts          # Multiline whitespace/empty line parser
│       ├── random.ts          # Random number range generation with uniqueness
│       └── storage.ts         # Pure ephemeral session utility (zero disk/cloud storage)
├── index.html                 # Development hub (/popup.html & /test-page.html)
├── popup.html                 # Extension action popup entry HTML
├── test-page.html             # Form sandbox for local testing
├── vite.config.ts             # Vite multi-input build for popup & background
├── vite.content.config.ts     # Dedicated standalone IIFE bundler for content script
├── tsconfig.json
└── package.json
```

---

## 2. Installation & Setup

Ensure Node.js (>= 18) and `pnpm` (or `npm`) are installed:

```bash
# Install dependencies
pnpm install
# (or with npm)
npm install
```

---

## 3. Build Commands

Compile TypeScript and bundle the extension into `dist/`:

```bash
# Production build
pnpm run build
# (or with npm)
npm run build
```

This generates:
1. `dist/manifest.json`
2. `dist/popup.html` and its React JS/CSS assets
3. `dist/background.js` (service worker)
4. `dist/content.js` (standalone IIFE with zero external imports)
5. `dist/icons/` (16x16, 48x48, 128x128 icons)

To run the local Vite preview / dev hub:

```bash
pnpm run dev
```

---

## 4. How to Load the Extension into Google Chrome

1. Open Google Chrome.
2. In the address bar, navigate to:
   ```text
   chrome://extensions
   ```
3. Enable **Developer mode** toggle in the top-right corner.
4. Click the **Load unpacked** button in the top-left corner.
5. Select the **`dist/`** directory located inside `/home/zackerinnit/Projects/numfill/dist`.
6. Pin **NumFill** from the puzzle icon in Chrome's toolbar for easy access.

> **Note:** Whenever you make code changes and rebuild (`npm run build`), click the **Reload icon (↻)** on the NumFill card in `chrome://extensions`.

---

## 5. How to Test It

### Using the Built-in Test Sandbox
1. In Chrome, open `test-page.html` by opening the file directly:
   ```text
   file:///home/zackerinnit/Projects/numfill/test-page.html
   ```
   *(Ensure "Allow access to file URLs" is checked in chrome://extensions -> NumFill -> Details if using `file://` scheme, or serve via `pnpm run dev` and open `http://localhost:5173/`).*
2. Click the **NumFill** extension icon in the Chrome toolbar.
3. Observe the popup:
   - It immediately detects the **5 primary target inputs**.
   - It ignores password, disabled, readonly, and hidden inputs.
4. Click **Inspect Fields ▼** to inspect the field names, IDs, and placeholders.
5. Click **Detect**:
   - Notice the matching inputs on the page flash with a temporary blue outline that cleanly disappears after 2.5 seconds.
6. Enter numbers in the textarea:
   ```text
   123456
   789012
   345678
   901234
   567890
   ```
7. Click **Fill Fields** (or press <kbd>Ctrl</kbd> + <kbd>Enter</kbd>):
   - Fields 1 through 5 are filled in exact order.
   - The green success highlight flashes.
   - The live event log in Section 2 confirms that `input`, `change`, and `blur` events fired properly.
8. Close the popup and reopen it:
   - Your entered numbers remain saved locally via `chrome.storage.local`.
9. Click **Clear** to wipe the numbers.

---

## 6. How to Debug

### Debugging the Popup UI
1. Click the extension icon to open the popup.
2. **Right-click anywhere inside the popup** window.
3. Select **Inspect**.
4. Chrome DevTools opens dedicated to `popup.html`:
   - Inspect elements, styles, React components.
   - View console messages (`console.log`, errors).
   - Check the **Application** tab -> **Storage** -> **Local Storage / Extension Storage** to inspect `chrome.storage.local`.

### Debugging the Content Script
1. Open any regular webpage (e.g. `test-page.html` or any website with forms).
2. Open Chrome DevTools for the webpage (<kbd>F12</kbd> or right-click on the page -> **Inspect**).
3. In DevTools:
   - Go to the **Console** tab: Logs prefixed with `[AutoFill Numbers]` appear here.
   - Filter logs by choosing the context dropdown (top left of the console, usually saying `top`) and selecting **AutoFill Numbers** to run commands directly in the content script context.
   - Go to the **Sources** tab -> Expand `Content scripts` in the left panel -> Expand `AutoFill Numbers` -> `content.js` to set breakpoints directly inside the detector, highlighter, or filler functions.

### Debugging the Background Service Worker
1. Go to `chrome://extensions`.
2. Find the **AutoFill Numbers** card.
3. Click the link that says **service worker** (next to "Inspect views").
4. A dedicated DevTools window opens for the background script.

---

## 7. Framework Compatibility Details

React, Next.js, Vue, and Angular track `<input>` values using JavaScript property descriptors and synthetic event systems (`_valueTracker` in React). Simply setting `element.value = '123'` does not trigger state re-renders in framework-controlled components.

NumFill overcomes this in [src/content/filler.ts](file:///home/zackerinnit/Projects/numfill/src/content/filler.ts) by:
1. Accessing the original prototype property setter via `Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set`.
2. Calling the native prototype setter directly on the element.
3. Resetting `element._valueTracker` if present.
4. Dispatching standard `input` and `change` events with `bubbles: true, composed: true`.
5. Dispatching a `blur` event for schema validation libraries (Formik, React Hook Form, Zod).

---

## 8. Site-Specific Selectors

To customize field targeting for a specific domain, add a rule to [src/config/siteConfigs.ts](file:///home/zackerinnit/Projects/numfill/src/config/siteConfigs.ts):

```typescript
export const siteConfigs: Record<string, SiteRule> = {
  'my-internal-tool.company.com': {
    selector: 'input.data-input, input[name^="batch_"]',
    excludeSelector: '.search-bar',
    description: 'Target only batch inputs and exclude search bar',
  },
};
```
