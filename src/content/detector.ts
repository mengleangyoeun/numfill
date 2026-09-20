import type { FieldInfo } from '../types';
import { getSiteRule } from '../config/siteConfigs';

/**
 * Types of input fields to strictly exclude from automatic filling.
 */
const EXCLUDED_INPUT_TYPES = new Set([
  'hidden',
  'submit',
  'button',
  'reset',
  'checkbox',
  'radio',
  'file',
  'password',
  'image',
]);

/**
 * Determines whether an element is visible on the webpage.
 */
export function isElementVisible(el: HTMLElement): boolean {
  // Check display: none, visibility: hidden, opacity: 0
  const style = window.getComputedStyle(el);
  if (
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    style.visibility === 'collapse' ||
    parseFloat(style.opacity) === 0
  ) {
    return false;
  }

  // Check aria-hidden
  if (el.getAttribute('aria-hidden') === 'true') {
    return false;
  }

  // Check layout dimensions
  const rects = el.getClientRects();
  if (rects.length === 0) {
    return false;
  }

  const rect = el.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) {
    return false;
  }

  return true;
}

/**
 * Determines whether an input or textarea is editable by a human user.
 */
export function isElementEditable(
  el: HTMLInputElement | HTMLTextAreaElement
): boolean {
  if (el.disabled || el.readOnly) {
    return false;
  }

  if (el.hasAttribute('disabled') || el.hasAttribute('readonly')) {
    return false;
  }

  if (el.getAttribute('contenteditable') === 'false') {
    return false;
  }

  return true;
}

/**
 * Validates whether an HTML element is a targetable input or textarea.
 */
export function isValidTargetField(
  el: Element
): el is HTMLInputElement | HTMLTextAreaElement {
  if (el instanceof HTMLInputElement) {
    const inputType = (el.type || 'text').toLowerCase();
    if (EXCLUDED_INPUT_TYPES.has(inputType)) {
      return false;
    }
    return isElementVisible(el) && isElementEditable(el);
  }

  if (el instanceof HTMLTextAreaElement) {
    return isElementVisible(el) && isElementEditable(el);
  }

  return false;
}

/**
 * Detects all eligible input fields on the page.
 * Respects site-specific configuration overrides when available.
 */
export function detectFields(doc: Document = document): {
  elements: (HTMLInputElement | HTMLTextAreaElement)[];
  info: FieldInfo[];
} {
  const hostname = window.location.hostname;
  const siteRule = getSiteRule(hostname);

  let candidateElements: (HTMLInputElement | HTMLTextAreaElement)[] = [];

  if (siteRule?.selector) {
    try {
      const queried = Array.from(doc.querySelectorAll(siteRule.selector));
      candidateElements = queried.filter(isValidTargetField);
    } catch (err) {
      console.warn(
        `[AutoFill Numbers] Failed to execute site selector "${siteRule.selector}":`,
        err
      );
    }
  }

  // Default / fallback detection
  if (candidateElements.length === 0) {
    const allInputsAndTextareas = Array.from(
      doc.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
        'input, textarea'
      )
    );
    candidateElements = allInputsAndTextareas.filter(isValidTargetField);
  }

  // Apply excludeSelector if configured
  if (siteRule?.excludeSelector) {
    try {
      const excludes = new Set(doc.querySelectorAll(siteRule.excludeSelector));
      candidateElements = candidateElements.filter((el) => !excludes.has(el));
    } catch (err) {
      console.warn(
        `[AutoFill Numbers] Exclude selector failed "${siteRule.excludeSelector}":`,
        err
      );
    }
  }

  // Build field metadata
  const info: FieldInfo[] = candidateElements.map((el, index) => {
    const tagName = el.tagName.toLowerCase() as 'input' | 'textarea';
    const type = el instanceof HTMLInputElement ? el.type || 'text' : 'textarea';
    const id = el.id || '';
    const name = el.name || '';
    const placeholder = el.placeholder || '';
    const ariaLabel =
      el.getAttribute('aria-label') ||
      el.getAttribute('aria-labelledby') ||
      '';

    return {
      index,
      tagName,
      type,
      id,
      name,
      placeholder,
      ariaLabel,
      currentValue: el.value || '',
      isVisible: true,
      isEnabled: true,
    };
  });

  return {
    elements: candidateElements,
    info,
  };
}
