export interface Hotkey {
  keys: string;
  description: string;
  group: 'Capture' | 'Navigate' | 'Edit' | 'View';
}

/** Single source of truth for the shortcuts sheet and the handlers in
 *  `useHotkeys`, so the help dialog can never drift from reality. */
export const HOTKEYS: Hotkey[] = [
  { keys: 'N', description: 'Focus the quick-capture field', group: 'Capture' },
  { keys: 'Enter', description: 'Add the idea and stay in the field', group: 'Capture' },
  { keys: 'Shift + Enter', description: 'New line inside a note or idea', group: 'Capture' },
  { keys: '/', description: 'Focus search', group: 'Navigate' },
  { keys: '1 / 2 / 3', description: 'Switch to canvas, list or actions', group: 'View' },
  { keys: 'Esc', description: 'Close the panel, clear search or deselect', group: 'Navigate' },
  { keys: 'Arrow keys', description: 'Move between ideas', group: 'Navigate' },
  { keys: 'Enter', description: 'Open the selected idea', group: 'Edit' },
  { keys: 'F', description: 'Favourite / unfavourite the selection', group: 'Edit' },
  { keys: 'D', description: 'Duplicate the selection', group: 'Edit' },
  { keys: 'G', description: 'Group the selection', group: 'Edit' },
  { keys: 'A', description: 'Send the selection to the action list', group: 'Edit' },
  { keys: 'Delete / Backspace', description: 'Delete the selection', group: 'Edit' },
  { keys: 'Ctrl/⌘ + Z', description: 'Undo', group: 'Edit' },
  { keys: 'Ctrl/⌘ + Shift + Z', description: 'Redo', group: 'Edit' },
  { keys: 'Ctrl/⌘ + A', description: 'Select all visible ideas', group: 'Edit' },
  { keys: '?', description: 'Show this shortcut list', group: 'Navigate' },
];

/** True when focus is inside a text field, so global single-key shortcuts
 *  never steal characters from someone who is typing. */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}
