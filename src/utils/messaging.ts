import type { ExtensionRequest, FieldInfo } from '../types';

/**
 * Checks whether the code is running inside a real Chrome Extension context
 * with access to chrome.tabs and chrome.runtime.
 */
export function isExtensionEnvironment(): boolean {
  return (
    typeof chrome !== 'undefined' &&
    Boolean(chrome.runtime?.id) &&
    Boolean(chrome.tabs?.query)
  );
}

/**
 * Checks if a URL is a restricted internal browser URL where extensions
 * are prohibited from executing scripts.
 */
export function isRestrictedUrl(url?: string): boolean {
  if (!url) return true;
  const restrictedProtocols = [
    'chrome://',
    'chrome-extension://',
    'edge://',
    'about:',
    'view-source:',
    'devtools://',
    'data:',
  ];
  return restrictedProtocols.some((protocol) => url.startsWith(protocol));
}

/**
 * Mock fields for local browser preview testing when not running as an unpacked extension.
 */
const MOCK_DEMO_FIELDS: FieldInfo[] = [
  { index: 0, tagName: 'input', type: 'text', id: 'core-1', name: 'phone_number_1', placeholder: 'Expected: 123456', ariaLabel: '', currentValue: '', isVisible: true, isEnabled: true },
  { index: 1, tagName: 'input', type: 'text', id: 'core-2', name: 'order_id_2', placeholder: 'Expected: 789012', ariaLabel: '', currentValue: '', isVisible: true, isEnabled: true },
  { index: 2, tagName: 'input', type: 'text', id: 'core-3', name: 'reference_3', placeholder: 'Expected: 345678', ariaLabel: '', currentValue: '', isVisible: true, isEnabled: true },
  { index: 3, tagName: 'input', type: 'text', id: 'core-4', name: 'serial_4', placeholder: 'Expected: 901234', ariaLabel: '', currentValue: '', isVisible: true, isEnabled: true },
  { index: 4, tagName: 'input', type: 'text', id: 'core-5', name: 'final_notes_5', placeholder: 'Expected: 567890', ariaLabel: '', currentValue: '', isVisible: true, isEnabled: true },
];

/**
 * Retrieves the current active tab in the current window.
 */
export async function getActiveTab(): Promise<chrome.tabs.Tab> {
  if (!isExtensionEnvironment()) {
    // Graceful fallback for browser tab preview (e.g. localhost:5173/popup.html)
    return {
      id: 9999,
      url: window.location.href,
      title: 'Dev Browser Preview',
      active: true,
      highlighted: true,
      incognito: false,
      pinned: false,
      windowId: 1,
      index: 0,
      selected: true,
      discarded: false,
      autoDiscardable: false,
      groupId: -1,
    } as unknown as chrome.tabs.Tab;
  }

  const [activeTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (!activeTab || activeTab.id === undefined) {
    throw new Error('No active browser tab detected.');
  }

  if (isRestrictedUrl(activeTab.url)) {
    throw new Error(
      'Extensions cannot run on internal browser pages (e.g. chrome:// or extensions gallery). Please open a regular webpage.'
    );
  }

  return activeTab;
}

/**
 * Ensures the content script is active in the target tab.
 */
export async function ensureContentScriptLoaded(tabId: number): Promise<void> {
  if (!isExtensionEnvironment()) {
    return;
  }

  // 1. Check if content script is already listening
  try {
    const pingResponse = await chrome.tabs.sendMessage(tabId, { action: 'PING' });
    if (pingResponse?.success) {
      return;
    }
  } catch {
    // Content script did not respond yet
  }

  // 2. Programmatically inject content.js if available
  if (chrome.scripting?.executeScript) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js'],
      });
    } catch (err) {
      console.warn('[AutoFill Numbers] Dynamic injection failed:', err);
      throw new Error(
        'Unable to communicate with the webpage. Please refresh the page and try again.',
        { cause: err }
      );
    }

    // 3. Retry pinging until content script is confirmed ready
    for (let i = 0; i < 5; i++) {
      await new Promise((resolve) => setTimeout(resolve, 80));
      try {
        const pingResponse = await chrome.tabs.sendMessage(tabId, { action: 'PING' });
        if (pingResponse?.success) {
          return;
        }
      } catch {
        // keep polling
      }
    }
    return;
  }

  throw new Error('Content script unavailable. Please refresh the webpage.');
}

/**
 * Sends a message to the active tab's content script.
 * In non-extension browser preview, provides a seamless simulation.
 */
export async function sendMessageToActiveTab<T>(
  message: ExtensionRequest
): Promise<T> {
  if (!isExtensionEnvironment()) {
    // Dev Preview Simulation
    if (message.action === 'DETECT_FIELDS') {
      return {
        success: true,
        count: MOCK_DEMO_FIELDS.length,
        fields: MOCK_DEMO_FIELDS,
        url: window.location.href,
        hostname: window.location.hostname || 'localhost',
      } as unknown as T;
    }

    if (message.action === 'FILL_FIELDS') {
      const fillLimit = Math.min(MOCK_DEMO_FIELDS.length, message.values.length);
      const filledFields = MOCK_DEMO_FIELDS.slice(0, fillLimit).map((f, i) => ({
        index: i,
        nameOrId: f.id || f.name,
        value: message.values[i],
      }));

      return {
        success: true,
        totalInputsDetected: MOCK_DEMO_FIELDS.length,
        filledCount: fillLimit,
        unusedValuesCount: Math.max(0, message.values.length - MOCK_DEMO_FIELDS.length),
        remainingInputsCount: Math.max(0, MOCK_DEMO_FIELDS.length - message.values.length),
        filledFields,
      } as unknown as T;
    }

    if (message.action === 'CLEAR_FIELDS') {
      return {
        success: true,
        clearedCount: MOCK_DEMO_FIELDS.length,
      } as unknown as T;
    }

    return { success: true } as unknown as T;
  }

  const tab = await getActiveTab();
  const tabId = tab.id!;

  await ensureContentScriptLoaded(tabId);

  return new Promise<T>((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      const lastError = chrome.runtime.lastError;
      if (lastError) {
        reject(new Error(lastError.message || 'Failed to communicate with tab.'));
        return;
      }
      resolve(response as T);
    });
  });
}
