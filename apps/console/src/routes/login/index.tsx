import { createFileRoute } from '@tanstack/react-router'
import { AuthPage } from '../../app/components/auth-page/auth-page'
import { authPageBeforeLoad, authPageSearchParamsSchema } from '../../app/components/auth-page/auth-page-utils'

export const Route = createFileRoute('/login/')({
  validateSearch: authPageSearchParamsSchema,
  beforeLoad: ({ context, search }) => authPageBeforeLoad({ page: 'login', auth: context.auth, search }),
  component: RouteComponent,
})

function RouteComponent() {
  const { redirect } = Route.useSearch()

  return <AuthPage page="login" redirect={redirect} />
}
