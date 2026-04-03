import { useOrganizations } from '@qovery/domains/organizations/feature'
import { Heading, Icon, Link, Section } from '@qovery/shared/ui'
import { type SerializedError } from '@qovery/shared/utils'

export function NotFoundPage({ error }: { error?: unknown }) {
  const errorTyped = error as SerializedError

  const { data: organizations = [] } = useOrganizations()

  return (
    <Section className="flex-grow items-center justify-center rounded-sm bg-white">
      <div className="-mt-[100px] flex w-[500px] flex-col items-center justify-center gap-3 text-center">
        <img
          className="user-none pointer-events-none w-[170px]"
          src="/assets/images/event-placeholder-light.svg"
          alt="Event placeholder"
        />
        <div>
          <Heading className="font-medium text-neutral-400">{errorTyped?.name ?? errorTyped?.code}</Heading>
          <p className="text-sm text-neutral-350">{errorTyped?.message ?? 'Not found'}</p>
        </div>
        {organizations?.length > 0 ? (
          <Link
            as="button"
            to="/organization/$organizationId"
            params={{ organizationId: organizations[0].id }}
            size="md"
            className="flex gap-2"
          >
            Go to correct URL
            <Icon iconName="arrow-right" />
          </Link>
        ) : (
          <Link as="button" to="/" size="md" className="flex gap-2">
            Go to correct URL
            <Icon iconName="arrow-right" />
          </Link>
        )}
      </div>
    </Section>
  )
}

export default NotFoundPage
