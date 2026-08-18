import { localProvider } from './localProvider';
import { remoteProvider } from './remoteProvider';
import type { AiCapability, AiProvider, AiRequest, AiResult } from './types';

export const providers: AiProvider[] = [localProvider, remoteProvider];

export function getProvider(id: string): AiProvider {
  return providers.find((provider) => provider.id === id) ?? localProvider;
}

export function providersFor(capability: AiCapability): AiProvider[] {
  return providers.filter((provider) => provider.capabilities.includes(capability));
}

export async function runSuggestion(providerId: string, request: AiRequest): Promise<AiResult> {
  return getProvider(providerId).run(request);
}

export { localProvider, remoteProvider };
export * from './types';
export {
  readRemoteSettings,
  writeRemoteSettings,
  clearRemoteSettings,
  defaultRemoteSettings,
} from './remoteProvider';
export type { RemoteSettings } from './remoteProvider';
