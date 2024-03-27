import { type PropsWithChildren, createContext, useState } from 'react'

export const ServiceTerminalContext = createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: false,
  setOpen: () => {},
})

export const ServiceTerminalProvider = ({ children }: PropsWithChildren) => {
  const [open, setOpen] = useState(false)

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
