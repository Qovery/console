import { useLocation } from '@tanstack/react-router'
import { type PropsWithChildren, createContext, useState } from 'react'

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
  const [open, setOpen] = useState(Boolean((state as { hasShell?: boolean } | undefined)?.hasShell))

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
