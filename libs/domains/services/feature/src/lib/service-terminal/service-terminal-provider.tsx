import { type PropsWithChildren, createContext, useState } from 'react'
import { useLocation } from 'react-router-dom'

export const ServiceTerminalContext = createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setOpen: () => {},
})

export const ServiceTerminalProvider = ({ children }: PropsWithChildren) => {
  const { state } = useLocation()
  const [open, setOpen] = useState(state?.hasShell || false)

  return (
    <ServiceTerminalContext.Provider
      value={{
        open,
        setOpen,
      }}
    >
      {children}
    </ServiceTerminalContext.Provider>
  )
}
