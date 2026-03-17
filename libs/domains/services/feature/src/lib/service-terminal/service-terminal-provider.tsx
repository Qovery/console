import { useLocation, useNavigate, useSearch } from '@tanstack/react-router'
import { type PropsWithChildren, createContext, useCallback, useEffect, useState } from 'react'

export const ServiceTerminalContext = createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setOpen: () => {},
})

export const ServiceTerminalProvider = ({ children }: PropsWithChildren) => {
  const location = useLocation()
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { hasShell?: boolean }
  const hasShellFromLocationState = Boolean((location.state as { hasShell?: boolean } | undefined)?.hasShell)
  const syncedOpen = typeof search.hasShell === 'boolean' ? search.hasShell : hasShellFromLocationState
  const [open, setOpen] = useState(syncedOpen)

  useEffect(() => {
    setOpen(syncedOpen)
  }, [syncedOpen])

  const handleSetOpen = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen)

      if (!newOpen) {
        navigate({
          to: location.pathname,
          search: {
            hasShell: undefined,
          },
        })
      }
    },
    [location.pathname, navigate]
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
