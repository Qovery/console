// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import {
  useClickAway,
  useCopyToClipboard,
  useDebounce,
  useDocumentTitle,
  useLocalStorage,
  useNetworkState,
} from '@uidotdev/usehooks'

// NOTE: if you export from `@uidotdev/usehooks`, you need to mock it on the `mocks.ts` file for tests
export { useDocumentTitle, useClickAway, useCopyToClipboard, useDebounce, useLocalStorage, useNetworkState }

export * from './lib/use-format-hotkeys/use-format-hotkeys'
