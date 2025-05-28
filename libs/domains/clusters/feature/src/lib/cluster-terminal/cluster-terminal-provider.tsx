import { type PropsWithChildren, createContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export const ClusterTerminalContext = createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setOpen: () => {},
})

export const ClusterTerminalProvider = ({ children }: PropsWithChildren) => {
  const { state } = useLocation()
  const [open, setOpen] = useState(false)

  // If the state has a hasShell property, set the open state to true
  useEffect(() => {
    if (state?.hasShell) {
      setOpen(true)
    }
  }, [state?.hasShell])

  return (
    <ClusterTerminalContext.Provider
      value={{
        open,
        setOpen,
      }}
    >
      {children}
    </ClusterTerminalContext.Provider>
  )
}
