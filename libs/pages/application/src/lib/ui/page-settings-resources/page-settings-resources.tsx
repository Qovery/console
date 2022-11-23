import { FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { SettingResources } from '@qovery/shared/console-shared'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import { Button, ButtonSize, ButtonStyle, HelpSection } from '@qovery/shared/ui'

export interface PageSettingsResourcesProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  displayWarningCpu: boolean
  application?: ApplicationEntity
  loading?: boolean
}

export function PageSettingsResources(props: PageSettingsResourcesProps) {
  const { onSubmit, loading, application, displayWarningCpu } = props
  const { formState } = useFormContext()

  if (!application) return null

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <h2 className="h5 mb-8 text-text-700">Resources</h2>
        <form onSubmit={onSubmit}>
          <SettingResources displayWarningCpu={displayWarningCpu} application={application} />
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
