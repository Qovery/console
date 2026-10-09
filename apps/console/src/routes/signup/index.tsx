import { createFileRoute } from '@tanstack/react-router'
import { AuthPage } from '../../app/components/auth-page/auth-page'
import { authPageBeforeLoad, authPageSearchParamsSchema } from '../../app/components/auth-page/auth-page-utils'

export const Route = createFileRoute('/signup/')({
  validateSearch: authPageSearchParamsSchema,
  beforeLoad: ({ context, search }) => authPageBeforeLoad({ page: 'signup', auth: context.auth, search }),
  component: RouteComponent,
})

function RouteComponent() {
  const { redirect } = Route.useSearch()

  return <AuthPage page="signup" redirect={redirect} />
}
