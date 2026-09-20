import type { FilledFieldDetail, FillFieldsResponse } from '../types';

/**
 * Sets the value of an input or textarea in a manner compatible with
 * vanilla HTML and modern frameworks (React, Next.js, Vue, Angular).
 *
 * Frameworks like React track input value changes by intercepting the native
 * HTMLInputElement / HTMLTextAreaElement prototype value setter. Calling the
 * prototype setter directly bypasses React's lock and triggers synthetic
 * state updates when 'input' and 'change' events are dispatched.
 */
export function setNativeValue(
  element: HTMLInputElement | HTMLTextAreaElement,
  value: string
): void {
  const previousValue = element.value;

  const prototype =
    element instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;

  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
  const nativeSetter = descriptor?.set;

  // If React's internal value tracker is present, reset it so React detects the update
  const valueTracker = (element as unknown as { _valueTracker?: { setValue: (val: string) => void } })._valueTracker;
  if (valueTracker) {
    valueTracker.setValue(previousValue);
  }

  if (nativeSetter) {
    nativeSetter.call(element, value);
  } else {
    element.value = value;
  }

  // Dispatch standard input event (React, Vue listen to this)
  element.dispatchEvent(
    new Event('input', {
      bubbles: true,
      composed: true,
      cancelable: true,
    })
  );

  // Dispatch change event (Angular, plain forms listen to this)
  element.dispatchEvent(
    new Event('change', {
      bubbles: true,
      composed: true,
      cancelable: true,
    })
  );

  // Dispatch blur event to trigger validations
  element.dispatchEvent(
    new Event('blur', {
      bubbles: true,
      composed: true,
    })
  );
}

/**
 * Fills detected fields sequentially with parsed values.
 */
export function fillFieldsSequentially(
  elements: (HTMLInputElement | HTMLTextAreaElement)[],
  values: string[]
): FillFieldsResponse {
  const totalInputsDetected = elements.length;
  const valuesToFill = values;
  const filledFields: FilledFieldDetail[] = [];

  const fillLimit = Math.min(totalInputsDetected, valuesToFill.length);

  for (let i = 0; i < fillLimit; i++) {
    const el = elements[i];
    const val = valuesToFill[i];

    setNativeValue(el, val);

    const nameOrId =
      el.id ||
      el.name ||
      el.getAttribute('placeholder') ||
      el.getAttribute('aria-label') ||
      `Input #${i + 1}`;

    filledFields.push({
      index: i,
      nameOrId,
      value: val,
    });
  }

  const unusedValuesCount = Math.max(0, valuesToFill.length - totalInputsDetected);
  const remainingInputsCount = Math.max(0, totalInputsDetected - valuesToFill.length);

  return {
    success: true,
    totalInputsDetected,
    filledCount: fillLimit,
    unusedValuesCount,
    remainingInputsCount,
    filledFields,
  };
}
