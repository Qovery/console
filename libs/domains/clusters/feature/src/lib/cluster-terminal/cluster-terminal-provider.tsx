import { useLocation } from '@tanstack/react-router'
import { type PropsWithChildren, createContext, useEffect, useMemo, useState } from 'react'

export const ClusterTerminalContext = createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setOpen: () => {},
})

export const ClusterTerminalProvider = ({ children }: PropsWithChildren) => {
  const location = useLocation()
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search])
  const [open, setOpen] = useState(searchParams.has('hasShell'))

  // If the state has a hasShell property, set the open state to true
  useEffect(() => {
    if (searchParams.has('hasShell')) {
      setOpen(true)
    }
  }, [searchParams])

  console.log('open', open)

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
