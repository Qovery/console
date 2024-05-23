import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { type AnyService, type Database, type Helm } from '@qovery/domains/services/data-access'
import { ApplicationSettingsResources, SettingsHeading } from '@qovery/shared/console-shared'
import { Button, Section } from '@qovery/shared/ui'

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
    <div className="flex w-full flex-col justify-between">
      <Section className="max-w-content-with-navigation-left p-8">
        <SettingsHeading title="Resources" description="Manage the resources assigned to the service." />
        <form className="space-y-10" onSubmit={onSubmit}>
          <ApplicationSettingsResources displayWarningCpu={displayWarningCpu} service={service} />
          <div className="flex justify-end">
            <Button type="submit" size="lg" loading={loading} disabled={!formState.isValid}>
              Save
            </Button>
          </div>
        </form>
      </Section>
    </div>
  )
}

export default PageSettingsResources
