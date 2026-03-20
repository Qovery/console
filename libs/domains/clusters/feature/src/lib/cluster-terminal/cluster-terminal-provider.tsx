import { type PropsWithChildren, createContext, useCallback, useState } from 'react'

export const ClusterTerminalContext = createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setOpen: () => {},
})

export const ClusterTerminalProvider = ({ children }: PropsWithChildren) => {
  const [open, setOpen] = useState(false)

  const handleSetOpen = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen)
    },
    [setOpen]
  )

  return (
    <ClusterTerminalContext.Provider
      value={{
        open,
        setOpen: handleSetOpen,
      }}
    >
      {children}
    </ClusterTerminalContext.Provider>
  )
}
