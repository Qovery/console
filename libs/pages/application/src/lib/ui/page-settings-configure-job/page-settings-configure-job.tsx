import { useFormContext } from 'react-hook-form'
import { JobConfigureSettings } from '@qovery/shared/console-shared'
import { isCronJob } from '@qovery/shared/enums'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import { BlockContent, Button, ButtonSize, ButtonStyle, HelpSection } from '@qovery/shared/ui'

export interface PageSettingsConfigureJobProps {
  application?: ApplicationEntity
  loading?: boolean
  onSubmit: () => void
}

export function PageSettingsConfigureJob(props: PageSettingsConfigureJobProps) {
  const { loading, onSubmit } = props
  const { formState } = useFormContext()

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <form onSubmit={onSubmit}>
          <BlockContent title="Configuration job">
            <JobConfigureSettings
              loading={!props.application}
              jobType={isCronJob(props.application) ? 'CRON' : 'LIFECYCLE'}
            />
          </BlockContent>
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
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#delete-an-application',
            linkLabel: 'How to delete my application',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsConfigureJob
