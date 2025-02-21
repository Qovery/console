import { createContext } from 'react'

export const AssistantContext = createContext({
  assistantOpen: false,
  message: '',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setAssistantOpen: (_assistantOpen: boolean) => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setMessage: (_message: string) => {},
})

export default AssistantContext
