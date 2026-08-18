import { HOTKEYS } from '../lib/hotkeys';
import type { Hotkey } from '../lib/hotkeys';
import { Dialog } from './primitives';

const GROUPS: Array<Hotkey['group']> = ['Capture', 'Navigate', 'Edit', 'View'];

export function ShortcutsDialog({ onClose }: { onClose: () => void }) {
  return (
    <Dialog
      title="Keyboard shortcuts"
      description="Available on desktop whenever you are not typing in a field."
      onClose={onClose}
    >
      <div className="stack">
        {GROUPS.map((group) => {
          const rows = HOTKEYS.filter((hotkey) => hotkey.group === group);
          if (rows.length === 0) return null;
          return (
            <section key={group}>
              <h3 className="listgroup__title" style={{ marginTop: 0 }}>
                {group}
              </h3>
              <div className="kbd-grid">
                {rows.map((hotkey) => (
                  <div className="kbd-row" key={`${group}-${hotkey.keys}-${hotkey.description}`}>
                    <span className="muted">{hotkey.description}</span>
                    <kbd>{hotkey.keys}</kbd>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </Dialog>
  );
}
