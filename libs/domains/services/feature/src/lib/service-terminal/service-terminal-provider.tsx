import { type PropsWithChildren, createContext, useCallback, useState } from 'react'

export const ServiceTerminalContext = createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setOpen: () => {},
})

export const ServiceTerminalProvider = ({ children }: PropsWithChildren) => {
  const [open, setOpen] = useState(false)
  const handleSetOpen = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen)
    },
    [setOpen]
  )

  return (
    <ServiceTerminalContext.Provider
      value={{
        open,
        setOpen: handleSetOpen,
      }}
    >
      {children}
    </ServiceTerminalContext.Provider>
  )
}
