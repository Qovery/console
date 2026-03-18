import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated && !context.auth.isLoading) {
      // Pass current pathname as returnTo so Auth0 can restore it after login
      context.auth.login(location.href)
      return
    }
  },
  component: () => <Outlet />,
})
