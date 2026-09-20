interface SavedStyle {
  outline: string;
  outlineOffset: string;
  boxShadow: string;
  transition: string;
}

const originalStyles = new WeakMap<HTMLElement, SavedStyle>();
let activeTimer: number | null = null;
let activeElements: HTMLElement[] = [];

/**
 * Removes active highlights and restores original element styles.
 */
export function clearHighlights(): void {
  if (activeTimer !== null) {
    window.clearTimeout(activeTimer);
    activeTimer = null;
  }

  for (const el of activeElements) {
    const saved = originalStyles.get(el);
    if (saved) {
      el.style.outline = saved.outline;
      el.style.outlineOffset = saved.outlineOffset;
      el.style.boxShadow = saved.boxShadow;
      el.style.transition = saved.transition;
      originalStyles.delete(el);
    } else {
      el.style.outline = '';
      el.style.outlineOffset = '';
      el.style.boxShadow = '';
    }
  }

  activeElements = [];
}

/**
 * Temporarily highlights elements visually using a clear outline.
 * Automatically removes the highlight after `durationMs`.
 */
export function highlightElements(
  elements: HTMLElement[],
  type: 'detect' | 'success' = 'detect',
  durationMs = 2500
): void {
  clearHighlights();

  const outlineColor = type === 'success' ? '#16a34a' : '#2563eb';
  const shadowColor =
    type === 'success' ? 'rgba(22, 163, 74, 0.25)' : 'rgba(37, 99, 235, 0.25)';

  activeElements = [...elements];

  for (const el of activeElements) {
    if (!originalStyles.has(el)) {
      originalStyles.set(el, {
        outline: el.style.outline,
        outlineOffset: el.style.outlineOffset,
        boxShadow: el.style.boxShadow,
        transition: el.style.transition,
      });
    }

    el.style.transition =
      'outline 0.15s ease-in-out, box-shadow 0.15s ease-in-out';
    el.style.outline = `2px solid ${outlineColor}`;
    el.style.outlineOffset = '2px';
    el.style.boxShadow = `0 0 0 4px ${shadowColor}`;
  }

  activeTimer = window.setTimeout(() => {
    clearHighlights();
  }, durationMs);
}
