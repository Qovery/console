import { useFormContext } from 'react-hook-form'
import { type Job } from '@qovery/domains/services/data-access'
import { JobConfigureSettings, SettingsHeading } from '@qovery/shared/console-shared'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { Button, Section } from '@qovery/shared/ui'

export interface PageSettingsConfigureJobProps {
  service: Job
  onSubmit: () => void
  loading: boolean
}

export function PageSettingsConfigureJob({ service, loading, onSubmit }: PageSettingsConfigureJobProps) {
  const { formState } = useFormContext()

  return (
    <Section className="flex w-full flex-col justify-between">
      <div className="max-w-content-with-navigation-left p-8">
        <SettingsHeading
          title="Triggers"
          description="Define the events triggering the execution of this job and the commands to execute."
        />
        <form onSubmit={onSubmit} className="space-y-10">
          <JobConfigureSettings
            loading={!service}
            jobType={service.job_type === 'CRON' ? ServiceTypeEnum.CRON_JOB : ServiceTypeEnum.LIFECYCLE_JOB}
          />
          <div className="flex justify-end">
            <Button size="lg" disabled={!formState.isValid} loading={loading}>
              Save
            </Button>
          </div>
        </form>
      </div>
    </Section>
  )
}

export default PageSettingsConfigureJob
