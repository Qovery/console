import { useFormContext } from 'react-hook-form'
import { JobConfigureSettings } from '@qovery/shared/console-shared'
import { ServiceTypeEnum, isCronJob } from '@qovery/shared/enums'
import { type ApplicationEntity } from '@qovery/shared/interfaces'
import { BlockContent, ButtonLegacy, ButtonLegacySize, ButtonLegacyStyle, HelpSection } from '@qovery/shared/ui'

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
              jobType={isCronJob(props.application) ? ServiceTypeEnum.CRON_JOB : ServiceTypeEnum.LIFECYCLE_JOB}
            />
          </BlockContent>
          <div className="flex justify-end">
            <ButtonLegacy
              dataTestId="submit-button"
              className="btn--no-min-w"
              size={ButtonLegacySize.LARGE}
              style={ButtonLegacyStyle.BASIC}
              type="submit"
              disabled={!formState.isValid}
              loading={loading}
            >
              Save
            </ButtonLegacy>
          </div>
        </form>
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/cronjob/',
            linkLabel: 'How to configure my cron job',
          },
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/lifecycle-job/',
            linkLabel: 'How to configure my lifecycle job',
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsConfigureJob
