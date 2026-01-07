import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      // Auth0 handles login redirects, so just trigger login
      context.auth.login()
      return
    }
  },
  component: () => <Outlet />,
})
