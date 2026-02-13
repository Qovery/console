import { useLocation, useNavigate, useSearch } from '@tanstack/react-router'
import { type PropsWithChildren, createContext, useCallback, useEffect, useState } from 'react'

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
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { hasShell?: boolean }
  const [open, setOpen] = useState(Boolean(search.hasShell))

  useEffect(() => {
    setOpen(Boolean(search.hasShell))
  }, [search.hasShell])

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
