// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useClickAway, useCopyToClipboard, useDebounce, useDocumentTitle } from '@uidotdev/usehooks'
import { MyHistoryProvider, useMyHistory } from './lib/use-my-history/use-my-history'

// NOTE: if you export from `@uidotdev/usehooks`, you need to mock it on the `mocks.ts` file for tests
export { useDocumentTitle, useClickAway, useCopyToClipboard, useDebounce, useMyHistory, MyHistoryProvider }
