import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { Login } from '@qovery/pages/login'

const loginSearchParamsSchema = z.object({
  redirect: z.string().optional(),
})

function getSafeRedirect(redirectPath?: string) {
  if (!redirectPath || redirectPath.startsWith('/login')) {
    return '/'
  }

  return redirectPath
}

export const Route = createFileRoute('/login/')({
  validateSearch: loginSearchParamsSchema,
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: getSafeRedirect(search.redirect) })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <Login />
}
