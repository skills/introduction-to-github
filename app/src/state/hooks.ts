import { use } from 'react';
import { AppContext } from './context';
import type { AppContextValue } from './context';

export function useApp(): AppContextValue {
  const value = use(AppContext);
  if (!value) throw new Error('useApp must be used inside <StoreProvider>.');
  return value;
}
