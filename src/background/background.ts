/**
 * Background Service Worker for AutoFill Numbers Extension (Manifest V3)
 *
 * Permissions rationale:
 * - "activeTab": Gives the extension temporary host permission for the current active tab
 *   when invoked, without needing blanket access to all URLs or browsing history.
 * - "scripting": Enables programmatically injecting the content script into an existing
 *   tab if that tab was opened before the extension was installed or reloaded.
 * (Zero storage permissions: all automation is ephemeral and kept in memory only)
 */

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[AutoFill Numbers] Extension installed successfully.');
  } else if (details.reason === 'update') {
    console.log('[AutoFill Numbers] Extension updated to version', chrome.runtime.getManifest().version);
  }
});
