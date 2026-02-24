import { type MutableRefObject, createContext } from 'react'

export const DevopsCopilotContext = createContext({
  devopsCopilotOpen: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setDevopsCopilotOpen: (_devopsCopilotOpen: boolean) => {},
  // sendMessageRef always creates a new thread - use it for contextual auto-sending (sparkles, banners)
  sendMessageRef: undefined as MutableRefObject<((message: string) => void) | null> | undefined,
})

export default DevopsCopilotContext
