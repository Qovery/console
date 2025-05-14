import { createContext } from 'react'

export const DevopsCopilotContext = createContext({
  devopsCopilotOpen: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setDevopsCopilotOpen: (_devopsCopilotOpen: boolean) => {},
})

export default DevopsCopilotContext
