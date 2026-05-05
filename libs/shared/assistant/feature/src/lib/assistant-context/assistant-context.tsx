import { type PropsWithChildren, createContext, useCallback, useContext, useMemo, useState } from 'react'

type AssistantActionsContextValue = {
  setAssistantOpen: (assistantOpen: boolean) => void
  toggleAssistantOpen: () => void
}

const AssistantOpenContext = createContext(false)
const AssistantActionsContext = createContext<AssistantActionsContextValue>({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setAssistantOpen: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  toggleAssistantOpen: () => {},
})

export function AssistantProvider({ children }: PropsWithChildren) {
  const [assistantOpen, setAssistantOpen] = useState(false)

  const toggleAssistantOpen = useCallback(() => {
    setAssistantOpen((currentAssistantOpen) => !currentAssistantOpen)
  }, [])

  const actionsValue = useMemo(
    () => ({
      setAssistantOpen,
      toggleAssistantOpen,
    }),
    [toggleAssistantOpen]
  )

  return (
    <AssistantActionsContext.Provider value={actionsValue}>
      <AssistantOpenContext.Provider value={assistantOpen}>{children}</AssistantOpenContext.Provider>
    </AssistantActionsContext.Provider>
  )
}

export function useAssistantOpen() {
  return useContext(AssistantOpenContext)
}

export function useSetAssistantOpen() {
  return useContext(AssistantActionsContext).setAssistantOpen
}

export function useToggleAssistantOpen() {
  return useContext(AssistantActionsContext).toggleAssistantOpen
}

export default AssistantProvider
