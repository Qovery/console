import { useFormContext } from 'react-hook-form'
import { type Job } from '@qovery/domains/services/data-access'
import { JobConfigureSettings } from '@qovery/shared/console-shared'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { BlockContent, Button } from '@qovery/shared/ui'

export interface PageSettingsConfigureJobProps {
  service: Job
  onSubmit: () => void
  loading: boolean
}

export function PageSettingsConfigureJob({ service, loading, onSubmit }: PageSettingsConfigureJobProps) {
  const { formState } = useFormContext()

  return (
    <div className="flex w-full flex-col justify-between">
      <div className="max-w-content-with-navigation-left p-8">
        <form onSubmit={onSubmit}>
          <BlockContent title="Configuration job" classNameContent="space-y-10">
            <JobConfigureSettings
              loading={!service}
              jobType={service.job_type === 'CRON' ? ServiceTypeEnum.CRON_JOB : ServiceTypeEnum.LIFECYCLE_JOB}
            />
          </BlockContent>
          <div className="flex justify-end">
            <Button size="lg" disabled={!formState.isValid} loading={loading}>
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PageSettingsConfigureJob
