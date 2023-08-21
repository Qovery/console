import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import { FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { ApplicationSettingsResources } from '@qovery/shared/console-shared'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import { Button, ButtonSize, ButtonStyle, HelpSection } from '@qovery/shared/ui'

export interface PageSettingsResourcesProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  displayWarningCpu: boolean
  application?: ApplicationEntity
  environmentMode?: EnvironmentModeEnum
  loading?: boolean
  clusterId?: string
}

export function PageSettingsResources(props: PageSettingsResourcesProps) {
  const { onSubmit, loading, application, clusterId, displayWarningCpu, environmentMode } = props
  const { formState } = useFormContext()

  if (!application) return null

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <h2 className="h5 text-zinc-400 mb-2">Resources</h2>
        <p className="text-sm text-zinc-400 max-w-content-with-navigation-left mb-8">
          Manage the resources assigned to the service.
        </p>
        <form onSubmit={onSubmit}>
          <ApplicationSettingsResources
            displayWarningCpu={displayWarningCpu}
            application={application}
            clusterId={clusterId}
            environmentMode={environmentMode}
          />
          <div className="flex justify-end">
            <Button
              dataTestId="submit-button"
              className="btn--no-min-w"
              size={ButtonSize.LARGE}
              style={ButtonStyle.BASIC}
              type="submit"
              disabled={!formState.isValid}
              loading={loading}
            >
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
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsResources
