import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { type AnyService, type Database, type Helm } from '@qovery/domains/services/data-access'
import { ApplicationSettingsResources } from '@qovery/shared/console-shared'
import { Button, Heading, HelpSection, Section } from '@qovery/shared/ui'

export interface PageSettingsResourcesProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  displayWarningCpu: boolean
  service: Exclude<AnyService, Helm | Database>
  loading: boolean
}

export function PageSettingsResources(props: PageSettingsResourcesProps) {
  const { onSubmit, loading, service, displayWarningCpu } = props
  const { formState } = useFormContext()

  return (
    <div className="flex flex-col justify-between w-full">
      <Section className="p-8 max-w-content-with-navigation-left">
        <Heading className="mb-2">Resources</Heading>
        <p className="text-sm text-neutral-400 max-w-content-with-navigation-left mb-8">
          Manage the resources assigned to the service.
        </p>
        <form className="space-y-10" onSubmit={onSubmit}>
          <ApplicationSettingsResources displayWarningCpu={displayWarningCpu} service={service} />
          <div className="flex justify-end">
            <Button type="submit" size="lg" loading={loading} disabled={!formState.isValid}>
              Save
            </Button>
          </div>
        </form>
      </Section>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#resources',
            linkLabel: 'How to configure my application',
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsResources
