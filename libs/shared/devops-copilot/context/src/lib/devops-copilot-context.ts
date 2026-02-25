import { type MutableRefObject, createContext } from 'react'

export const DevopsCopilotContext = createContext({
  devopsCopilotOpen: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setDevopsCopilotOpen: (_devopsCopilotOpen: boolean) => {},
  sendMessageRef: undefined as MutableRefObject<((message: string) => void) | null> | undefined,
})

export default DevopsCopilotContext
