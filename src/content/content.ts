import type {
  ExtensionRequest,
  DetectFieldsResponse,
  FillFieldsResponse,
  ClearFieldsResponse,
  ClearHighlightsResponse,
  PingResponse,
} from '../types';
import { detectFields } from './detector';
import { clearHighlights, highlightElements } from './highlighter';
import { fillFieldsSequentially, setNativeValue } from './filler';

// Mark initialization on window to avoid duplicate execution
const CONTENT_SCRIPT_KEY = '__AUTOFILL_NUMBERS_LOADED__';
if ((window as unknown as Record<string, boolean>)[CONTENT_SCRIPT_KEY]) {
  // Already initialized
} else {
  (window as unknown as Record<string, boolean>)[CONTENT_SCRIPT_KEY] = true;

  chrome.runtime.onMessage.addListener(
    (
      request: ExtensionRequest,
      _sender: chrome.runtime.MessageSender,
      sendResponse: (
        response:
          | DetectFieldsResponse
          | FillFieldsResponse
          | ClearFieldsResponse
          | ClearHighlightsResponse
          | PingResponse
      ) => void
    ) => {
      try {
        switch (request.action) {
          case 'PING': {
            sendResponse({ success: true, version: '1.0.0' });
            break;
          }

          case 'DETECT_FIELDS': {
            const { elements, info } = detectFields(document);

            if (request.highlight !== false && elements.length > 0) {
              highlightElements(elements, 'detect', 2500);
            }

            sendResponse({
              success: true,
              count: elements.length,
              fields: info,
              url: window.location.href,
              hostname: window.location.hostname,
            });
            break;
          }

          case 'FILL_FIELDS': {
            const { elements } = detectFields(document);

            if (elements.length === 0) {
              sendResponse({
                success: false,
                totalInputsDetected: 0,
                filledCount: 0,
                unusedValuesCount: request.values.length,
                remainingInputsCount: 0,
                filledFields: [],
                error: 'No editable input fields found on this page.',
              });
              break;
            }

            const result = fillFieldsSequentially(elements, request.values);

            if (request.highlight !== false && result.filledCount > 0) {
              const filledElements = elements.slice(0, result.filledCount);
              highlightElements(filledElements, 'success', 2000);
            }

            sendResponse(result);
            break;
          }

          case 'CLEAR_FIELDS': {
            const { elements } = detectFields(document);
            for (const el of elements) {
              setNativeValue(el, '');
            }
            clearHighlights();
            sendResponse({
              success: true,
              clearedCount: elements.length,
            });
            break;
          }

          case 'CLEAR_HIGHLIGHTS': {
            clearHighlights();
            sendResponse({ success: true });
            break;
          }

          default:
            break;
        }
      } catch (error) {
        console.error('[AutoFill Numbers] Content script error:', error);
        sendResponse({
          success: false,
          totalInputsDetected: 0,
          filledCount: 0,
          unusedValuesCount: 0,
          remainingInputsCount: 0,
          filledFields: [],
          error:
            error instanceof Error
              ? error.message
              : 'Unknown error occurred while interacting with page.',
        } as unknown as FillFieldsResponse);
      }

      // Return true to indicate asynchronous response compatibility
      return true;
    }
  );
}
