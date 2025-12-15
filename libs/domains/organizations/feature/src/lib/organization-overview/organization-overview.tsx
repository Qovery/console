import { Heading, Icon, Section } from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/util-dates'
import { useChangelogs } from '@qovery/shared/webflow/feature'

export function OrganizationOverview() {
  const { data: changelogs = [] } = useChangelogs()

  return (
    <div className="container mx-auto">
      <Section>
        <div className="flex flex-col gap-6">
          <Heading>Alan</Heading>
          <hr className="w-full border-neutral" />
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
                <Icon iconName="bullhorn" className="text-sm text-neutral-subtle" />
                Changelog
              </Heading>
              {changelogs?.map((changelog) => (
                <a
                  key={changelog.url}
                  href={changelog.url}
                  title={changelog.name}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col gap-2 rounded-lg border border-neutral p-4 text-neutral transition-colors hover:border-brand-11"
                >
                  <p className="text-sm">{changelog.name}</p>
                  <span className="text-ssm text-neutral-subtle">
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
