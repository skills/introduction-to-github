import { useApp } from '../state/hooks';
import { Button, IconButton } from './primitives';

export function Toaster() {
  const { toasts, dismissToast } = useApp();
  if (toasts.length === 0) return null;
  return (
    <div className="toaster" role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast ${toast.tone === 'danger' ? 'toast--danger' : ''}`}
          role="status"
          aria-live="polite"
        >
          <span className="toast__message">{toast.message}</span>
          {toast.actionLabel ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                toast.onAction?.();
                dismissToast(toast.id);
              }}
            >
              {toast.actionLabel}
            </Button>
          ) : null}
          <IconButton icon="close" label="Dismiss" onClick={() => dismissToast(toast.id)} size={15} />
        </div>
      ))}
    </div>
  );
}
