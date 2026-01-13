import { useParams } from '@tanstack/react-router'
import { type PropsWithChildren } from 'react'
import { Avatar, Heading, Section } from '@qovery/shared/ui'
import useOrganization from '../hooks/use-organization/use-organization'
import { SectionChangelog } from './section-changelog/section-changelog'
import { SectionLinks } from './section-links/section-links'

export function OrganizationOverview({ children }: PropsWithChildren) {
  const { organizationId = '' }: { organizationId: string } = useParams({ strict: false })
  const { data: organization } = useOrganization({ organizationId, suspense: true })

  return (
    <div className="container mx-auto pb-10">
      <Section className="gap-8">
        <div className="flex flex-col gap-6">
          <Heading className="flex items-center gap-2">
            <Avatar
              src={organization?.logo_url ?? undefined}
              alt={organization?.name}
              size="md"
              border="solid"
              fallback={organization?.name?.charAt(0).toUpperCase()}
            />
            {organization?.name}
          </Heading>
          <hr className="w-full border-neutral" />
        </div>
        <div className="flex w-full flex-col gap-12 md:flex-row md:justify-between">
          <div className="flex w-full flex-col gap-8">{children}</div>
          <div className="flex w-full flex-col gap-8 md:max-w-96">
            <SectionChangelog />
            <SectionLinks />
          </div>
        </div>
      </Section>
    </div>
  )
}

export default OrganizationOverview
