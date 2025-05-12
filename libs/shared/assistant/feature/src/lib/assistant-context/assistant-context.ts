import { createContext } from 'react'

export const AssistantContext = createContext({
  assistantOpen: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setAssistantOpen: (_assistantOpen: boolean) => {},
})

export default AssistantContext
