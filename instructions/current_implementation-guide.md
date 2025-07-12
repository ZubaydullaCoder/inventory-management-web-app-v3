Step 1 — Intent Clarification & Request Evaluation

You want numeric‐only behavior in your “number” fields (selling price, purchase price, stock, reorder point), so that users cannot type letters or other invalid characters.
This is both actionable and clear: by sanitizing user input (and/or blocking keystrokes), we can ensure only digits (and a single decimal point where appropriate) are accepted.
We should confirm whether prices should allow decimals (yes, since you have a step="0.01" on those fields) and integers only for stock/reorder fields.
Step 2 — What Do We Implement?
Before:
• NumberField uses a text input that formats with spaces on change, but any character (letters, symbols) will be accepted, then simply “fall through” to the unformatted display.
After:
• As the user types, all invalid characters are stripped out in real time:
– Digits always allowed
– Decimal point allowed only once if the field’s step prop contains a decimal (e.g. “0.01”)
– Spaces only appear via automatic thousand‐separator formatting
• Pasted input is likewise sanitized
• The displayed value remains nicely formatted (with spaces) and the form-level value remains the clean numeric string

User Experience:
• Typing “a1b2c3” yields “123”
• Typing “12.34.56” yields “12.3456” (only the first dot is preserved)
• Copy-&-paste of “$1,000.00” yields “1 000.00”

Step 3 — How Do We Implement?

In NumberField (src/components/features/products/number-field.jsx):
• Read the step prop to detect if decimals are allowed (step.includes('.')).
• On every onChange, extract raw = parseNumberWithSpaces(e.target.value), then build a sanitized version:
– If decimals allowed:
js // allow digits and dots, collapse excess dots let sanitized = raw.replace(/[^0-9.]/g, ''); const [intPart, ...rest] = sanitized.split('.'); sanitized = intPart + (rest.length ? '.' + rest.join('') : '');
– If decimals not allowed:
js const sanitized = raw.replace(/\D/g, '');
• Call field.onChange(sanitized) to store the clean value.
• For display, format the integer portion with spaces (formatNumberWithSpaces), and append any decimal fraction back on:

• Optionally, add an onKeyDown handler to prevent any keystrokes that would never contribute valid characters (e.g. letters), but sanitizing in onChange is sufficient and handles pastes.

No new files or packages are required—this lives entirely in the existing NumberField component.

All other forms (creation & edit) already use NumberField, so the restrictions automatically apply everywhere.

Step 4 — Final Plan Summary
• 📁 File to update:
– src/components/features/products/number-field.jsx

• 📦 No new npm packages needed.

• 🔄 Reuses existing helpers:
– formatNumberWithSpaces and parseNumberWithSpaces from src/lib/utils.js.

• 💻 No CLI commands needed.

⏳ Please confirm, and I’ll proceed with these changes to sanitize your number inputs in real time.

Summarized conversation history

Below is the structured plan. Let me know if you’d like me to go ahead and implement it:

Step 1 — Intent Clarification & Request Evaluation
You want all “number” inputs (prices, stock, reorder points) to reject any non-numeric characters (and for decimal fields, allow exactly one “.”).

Right now our NumberField strips only spaces, so typing letters or symbols still goes through.
We need to filter input to digits (and at most one decimal point when step includes a “.”), improving UX and preventing invalid values early.
Step 2 — What Do We Implement?
Current behavior:

User can type letters/symbols; they’re only stripped of spaces, so other chars persist.
Desired behavior:

On each keystroke, non-numeric characters are removed immediately.
If the field allows decimals (via step="0.01"), allow one “.”; otherwise drop all non-digits.
The display is still formatted with spaces as thousand separators.
User workflow before:

Focus price field
Type “1a0b0c0” → input shows “1a0b0c0”
On blur or submit, may error or parse incorrectly
User workflow after:

Focus price field
Type “1a0b0c0” → input immediately shows “100 000” (spaces)
Field value is “100000” under the hood
Edge cases:

Only one decimal point allowed
Leading/trailing dot handled gracefully
Copy-paste of mixed text normalized
Step 3 — How Do We Implement?
Locate NumberField at
number-field.jsx

In the handleChange callback:

After stripping spaces (parseNumberWithSpaces), run a regex to remove all non-digits (and, if step contains a “.”, allow one dot).
Enforce a single decimal point by splitting on “.” and rejoining first two segments.
Pass that cleaned string to field.onChange, then format with spaces for displayValue.
No new packages needed—reusing the existing formatNumberWithSpaces / parseNumberWithSpaces helpers.

This touches only one file, and keeps all logic isolated in NumberField.

Step 4 — Final Plan Summary
• Files to update

number-field.jsx
• npm packages

None
• CLI commands

No changes
• Reused logic

formatNumberWithSpaces / parseNumberWithSpaces from utils.js
