import { type NotFoundRouteProps } from '@tanstack/react-router'
import { useOrganizations } from '@qovery/domains/organizations/feature'
import { Heading, Icon, Link, LogoBrandedIcon, LogoIcon, Section } from '@qovery/shared/ui'
import { type SerializedError } from '@qovery/shared/utils'
import { useAuth0Context } from '../../../auth/auth0'

type NotFoundPageProps = NotFoundRouteProps & {
  error?: unknown
}

type NotFoundPageData = {
  title?: string
  message?: string
}

function isNotFoundPageData(data: unknown): data is NotFoundPageData {
  return typeof data === 'object' && data !== null
}

export function NotFoundPage({ data, error }: NotFoundPageProps) {
  const errorTyped = error as SerializedError | undefined
  const { isAuthenticated } = useAuth0Context()
  const { data: organizations = [] } = useOrganizations({ enabled: isAuthenticated })

  const currentOrganizationId = localStorage.getItem('currentOrganizationId') ?? ''
  const selectedOrganization =
    organizations.find((organization) => organization.id === currentOrganizationId) ?? organizations[0]

  const pageData = isNotFoundPageData(data) ? data : undefined
  const title = pageData?.title ?? errorTyped?.name ?? errorTyped?.code ?? 'Page not found'
  const message =
    pageData?.message ??
    errorTyped?.message ??
    "The page you're looking for doesn't exist anymore, or the URL is incorrect."

  return (
    <Section className="flex min-h-[70vh] w-full flex-1 items-center justify-center">
      <div className="flex w-full max-w-2xl flex-col items-center text-center">
        <LogoIcon className="mb-4 h-16 w-16 text-brand" />
        <Heading level={1}>{title}</Heading>

        <p className="mt-3 max-w-xs text-sm text-neutral-subtle">{message}</p>

        {selectedOrganization ? (
          <Link
            as="button"
            to="/organization/$organizationId/overview"
            params={{ organizationId: selectedOrganization.id }}
            size="md"
            className="mt-6 gap-2"
          >
            Go to organization
          </Link>
        ) : isAuthenticated ? (
          <Link as="button" to="/" size="md" className="mt-6 gap-2">
            Go to home
          </Link>
        ) : (
          <Link as="button" to="/login" search={{ redirect: '/' }} size="md" className="mt-6 gap-2">
            Go to login
          </Link>
        )}
      </div>
    </Section>
  )
}

export default NotFoundPage
