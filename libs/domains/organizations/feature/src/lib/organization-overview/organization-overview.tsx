import { useParams } from '@tanstack/react-router'
import { Heading, Icon, Section } from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/util-dates'
import { useChangelogs } from '@qovery/shared/webflow/feature'
import { useOrganization } from '../hooks/use-organization/use-organization'

export function OrganizationOverview() {
  const { data: changelogs = [] } = useChangelogs()
  const { organizationId = '' } = useParams({ strict: false })

  const { data: organization, isLoading: isLoadingOrganization } = useOrganization({ organizationId })

  if (isLoadingOrganization) {
    return (
      <div>
        <span className="text-neutral text-sm">Loading...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <Section>
        <div className="flex flex-col gap-6">
          <Heading>{organization?.name}</Heading>
          <hr className="border-neutral w-full" />
        </div>
        <div className="flex flex-col gap-12 md:flex-row">
          <div>
            <Section className="flex flex-col gap-6">
              <Heading>Production health</Heading>
            </Section>
          </div>
          <div>
            <Section className="flex flex-col gap-3">
              <Heading className="flex items-center gap-2">
                <Icon iconName="bullhorn" className="text-neutral-subtle text-sm" />
                Changelog
              </Heading>
              {changelogs?.map((changelog) => (
                <a
                  key={changelog.url}
                  href={changelog.url}
                  title={changelog.name}
                  target="_blank"
                  rel="noreferrer"
                  className="border-neutral text-neutral hover:border-brand-11 flex flex-col gap-2 rounded-lg border p-4 transition-colors"
                >
                  <p className="text-sm">{changelog.name}</p>
                  <span className="text-neutral-subtle text-ssm">
                    {dateFullFormat(changelog.firstPublishedAt, 'UTC', 'dd MMM, Y')}
                  </span>
                </a>
              ))}
            </Section>
          </div>
        </div>
      </Section>
    </div>
  )
}

export default OrganizationOverview
