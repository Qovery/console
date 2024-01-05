import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { type AnyService, type Database, type Helm } from '@qovery/domains/services/data-access'
import { ApplicationSettingsResources } from '@qovery/shared/console-shared'
import { Button, HelpSection } from '@qovery/shared/ui'

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
      <div className="p-8 max-w-content-with-navigation-left">
        <h2 className="h5 text-neutral-400 mb-2">Resources</h2>
        <p className="text-sm text-neutral-400 max-w-content-with-navigation-left mb-8">
          Manage the resources assigned to the service.
        </p>
        <form onSubmit={onSubmit}>
          <ApplicationSettingsResources displayWarningCpu={displayWarningCpu} service={service} />
          <div className="flex justify-end">
            <Button type="submit" size="lg" loading={loading} disabled={!formState.isValid}>
              Save
            </Button>
          </div>
        </form>
      </div>
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
