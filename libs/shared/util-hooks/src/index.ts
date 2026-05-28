// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useClickAway, useCopyToClipboard, useDebounce, useDocumentTitle, useNetworkState } from '@uidotdev/usehooks'

// NOTE: if you export from `@uidotdev/usehooks`, you need to mock it on the `mocks.ts` file for tests
export { useDocumentTitle, useClickAway, useCopyToClipboard, useDebounce, useNetworkState }

export * from './lib/use-format-hotkeys/use-format-hotkeys'
export * from './lib/use-local-storage/use-local-storage'
export * from './lib/use-support-chat/use-support-chat'
export * from './lib/use-pod-color/use-pod-color'
export * from './lib/use-terminal-readiness/use-terminal-readiness'
export * from './lib/use-interval-tick/use-interval-tick'
export * from './lib/use-utm-params/use-utm-params'
export * from './lib/use-os/use-os'
