import { useState } from 'react';
import { HomeView } from './components/HomeView';
import { InstallDialog } from './components/InstallDialog';
import { SettingsDialog } from './components/SettingsDialog';
import { Toaster } from './components/Toaster';
import { WorkspaceView } from './components/WorkspaceView';
import { Button } from './components/primitives';
import { useApp } from './state/hooks';

export function App() {
  const { route, updateReady, applyUpdate } = useApp();
  const [showSettings, setShowSettings] = useState(false);
  const [showInstall, setShowInstall] = useState(false);

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      {updateReady ? (
        <div
          className="banner"
          role="status"
          style={{ margin: 'var(--sp-3)', marginBottom: 0 }}
        >
          <span className="banner__text">
            A new version of Sparkboard is ready. Your work is already saved.
          </span>
          <Button size="sm" variant="primary" onClick={applyUpdate}>
            Reload
          </Button>
        </div>
      ) : null}

      {route.name === 'home' ? (
        <HomeView
          onOpenSettings={() => setShowSettings(true)}
          onOpenInstall={() => setShowInstall(true)}
        />
      ) : (
        <WorkspaceView onOpenSettings={() => setShowSettings(true)} />
      )}

      {showSettings ? <SettingsDialog onClose={() => setShowSettings(false)} /> : null}
      {showInstall ? <InstallDialog onClose={() => setShowInstall(false)} /> : null}
      <Toaster />
    </div>
  );
}
