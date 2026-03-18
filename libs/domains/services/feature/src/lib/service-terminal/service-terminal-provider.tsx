import { useLocation, useNavigate, useSearch } from '@tanstack/react-router'
import { type PropsWithChildren, createContext, useCallback } from 'react'

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
  const { hasShell } = useSearch({
    from: '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview',
  })
  const handleSetOpen = useCallback(
    (newOpen: boolean) => {
      navigate({
        to: location.pathname,
        search: {
          hasShell: newOpen || undefined,
        },
      })
    },
    [location.pathname, navigate]
  )

  return (
    <ServiceTerminalContext.Provider
      value={{
        open: Boolean(hasShell),
        setOpen: handleSetOpen,
      }}
    >
      {children}
    </ServiceTerminalContext.Provider>
  )
}
