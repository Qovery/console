import { Heading, Section } from '@qovery/shared/ui'

export function OrganizationOverview() {
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
            <Section className="flex flex-col gap-6">
              <Heading>Changelog</Heading>
            </Section>
          </div>
        </div>
      </Section>
    </div>
  )
}

export default OrganizationOverview
