
Build a production-quality Chrome Extension using **Manifest V3 + TypeScript + React + Vite**.

## Goal

I want a personal Chrome extension that automatically fills multiple input fields on the **currently active webpage** with a list of numbers.

Example:

The webpage contains:

```html
<input>
<input>
<input>
<input>
<input>
```

The extension should allow me to enter:

```text
123456
789012
345678
901234
567890
```

Then click **Fill Fields**, and the extension should fill the detected input fields in order:

```text
Input 1 → 123456
Input 2 → 789012
Input 3 → 345678
Input 4 → 901234
Input 5 → 567890
```

## Core Requirements

### 1. Extension architecture

Use:

* Manifest V3
* TypeScript
* React
* Vite
* Chrome Extensions APIs
* Content script
* Service worker/background script only when actually necessary

Use a clean, maintainable architecture.

Suggested structure:

```text
src/
├── popup/
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── content/
│   └── content.ts
├── background/
│   └── background.ts
├── components/
├── utils/
├── types/
└── manifest.ts
```

Adjust the structure if there is a better architecture.

### 2. Popup UI

Create a clean modern popup.

It should contain:

* Extension name
* Multiline textarea for numbers
* One number per line
* "Fill Fields" button
* "Clear" button
* Number of detected inputs
* Status/result message

Example:

```text
┌──────────────────────────────────┐
│  AutoFill Numbers                 │
│                                  │
│  Numbers                         │
│  ┌────────────────────────────┐  │
│  │ 123456                     │  │
│  │ 789012                     │  │
│  │ 345678                     │  │
│  │ 901234                     │  │
│  └────────────────────────────┘  │
│                                  │
│  4 inputs detected               │
│                                  │
│  [ Fill Fields ]    [ Clear ]    │
│                                  │
│  ✓ Filled 4 fields               │
└──────────────────────────────────┘
```

Make the UI polished and responsive.

### 3. Input detection

The content script should detect appropriate form fields on the current webpage.

Initially support:

```css
input
textarea
```

But do NOT blindly fill every input.

Ignore:

```text
type="hidden"
type="submit"
type="button"
type="reset"
type="checkbox"
type="radio"
type="file"
type="password"
```

Prefer fields that are:

* visible
* enabled
* editable
* not readonly
* not disabled

Also inspect useful attributes such as:

```text
name
id
placeholder
aria-label
autocomplete
type
```

Design the detection logic so it can later be customized for specific websites.

### 4. Fill values in order

The numbers from the textarea should be parsed line-by-line.

Ignore empty lines.

Trim whitespace.

For example:

```text
123456

789012
 345678
```

becomes:

```text
["123456", "789012", "345678"]
```

Fill detected fields sequentially.

If there are:

* more numbers than inputs → report that some numbers were unused
* fewer numbers than inputs → fill what is available and report how many fields remain
* equal numbers and inputs → report success

### 5. Framework compatibility

IMPORTANT:

The extension must work with normal HTML forms AND modern JavaScript frameworks such as:

* React
* Next.js
* Vue
* Angular

Do not only assign:

```js
element.value = value;
```

because React-controlled inputs may not update correctly.

Implement proper value-setting and event dispatching.

For example, trigger appropriate:

```text
input
change
blur
```

events when necessary.

Use a robust approach for native inputs and framework-controlled inputs.

### 6. Preserve user control

Before filling, show how many fields were detected.

Do not automatically submit the form.

Do not click unrelated buttons.

Do not navigate the page.

The extension should ONLY fill fields when the user explicitly clicks:

**Fill Fields**

### 7. Remember numbers

Use:

```text
chrome.storage.local
```

to save the user's number list.

When the popup opens again, restore the previous list.

Add a clear/reset option.

Do not send the numbers to any external server.

All data should remain local.

### 8. Current tab communication

When the user clicks **Fill Fields**:

```text
Popup
  ↓
Chrome messaging
  ↓
Content script in active tab
  ↓
Detect inputs
  ↓
Fill values
  ↓
Return result
  ↓
Popup displays result
```

Handle cases where:

* the content script isn't available
* the page is a Chrome internal page
* the tab cannot be accessed
* there are no matching inputs

Show useful error messages instead of failing silently.

### 9. Preview / detection

Add a **Detect Fields** button.

When clicked:

* scan the current webpage
* count matching inputs
* optionally highlight detected fields temporarily
* return information about each field

Example:

```text
Detected 5 fields

1. phone
2. phone
3. phone
4. phone
5. phone
```

For debugging, allow the extension to identify each field using:

```text
id
name
placeholder
aria-label
```

without exposing sensitive page content.

### 10. Optional field highlighting

When detecting fields, temporarily highlight them visually.

Use a clear outline such as:

```css
outline: 2px solid;
```

Remove the highlight after a few seconds.

Do not permanently modify the webpage styling.

### 11. Site-specific selectors

Design the code so I can later configure custom selectors for specific websites.

For example:

```ts
const siteConfigs = {
  "example.com": {
    selector: 'input[name="phone"]'
  }
}
```

The generic detector should remain the default.

Make this architecture easy to extend.

### 12. Security/privacy

This is a personal utility extension.

Requirements:

* No backend
* No analytics
* No tracking
* No external API
* No network requests
* Store numbers locally
* Request the minimum Chrome permissions necessary
* Do not collect or transmit webpage contents

Avoid `<all_urls>` if a narrower permission strategy can accomplish the functionality.

Explain in comments why each permission is needed.

### 13. Error handling

Handle:

```text
No active tab
No editable inputs
Too many numbers
Too few numbers
Content script unavailable
Permission errors
Chrome internal pages
Unexpected DOM changes
```

The popup should always give the user a clear status.

### 14. UX details

Make it feel like a polished small developer tool.

Use:

* clean spacing
* keyboard-friendly controls
* disabled states
* loading state
* success/error states
* responsive popup
* accessible labels
* sensible typography

Do not overcomplicate the UI.

## Development requirements

First create the complete project.

Then provide:

1. Installation commands
2. Project structure
3. All required source files
4. Build command
5. How to load the extension into Chrome
6. How to test it
7. How to debug the popup
8. How to debug the content script

The final project must build successfully with:

```bash
npm install
npm run build
```

The generated extension should be loadable through:

```text
chrome://extensions
→ Developer mode
→ Load unpacked
→ select dist/
```

## Important

Do not just give me a simplified demo.

Build the actual working extension architecture.

Keep the code modular so I can add features later such as:

* multiple saved number sets
* custom field selectors
* drag-and-drop field mapping
* keyboard shortcuts
* per-site configurations
* import/export configurations
* auto-detecting repeated form fields
* fill sequences
* configurable delays between fields

Start by implementing the core working version first, then explain how each part works.
