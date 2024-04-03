import { BuildModeEnum, type Organization } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { AutoDeploySetting, BuildSettings, GeneralSetting } from '@qovery/domains/services/feature'
import { EntrypointCmdInputs, JobGeneralSettings } from '@qovery/shared/console-shared'
import { type JobType, ServiceTypeEnum } from '@qovery/shared/enums'
import { type JobGeneralData } from '@qovery/shared/interfaces'
import { SERVICES_URL } from '@qovery/shared/routes'
import { Button, Heading, Section } from '@qovery/shared/ui'

export interface StepGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  organization?: Organization
  jobType: JobType
}

export function StepGeneral(props: StepGeneralProps) {
  const { organizationId = '', environmentId = '', projectId = '' } = useParams()
  const navigate = useNavigate()
  const { formState, watch } = useFormContext<JobGeneralData>()
  const watchServiceType = watch('serviceType')
  const watchBuildMode = watch('build_mode')

  // NOTE: Validation corner case where git settings can be in loading state
  const isGitSettingsValid = watchServiceType === 'APPLICATION' ? watch('branch') : true

  return (
    <Section>
      <Heading className="mb-2">
        {props.jobType === ServiceTypeEnum.CRON_JOB ? 'Cron' : 'Lifecycle'} job information
      </Heading>

      <form className="space-y-10" onSubmit={props.onSubmit}>
        <p className="text-neutral-350 text-sm">
          General settings allow you to set up your application name, git repository or container settings.
        </p>
        <Section className="gap-4">
          <Heading>General</Heading>
          <GeneralSetting label="Service name" />
        </Section>

        <Section className="gap-4">
          <Heading>Source</Heading>
          <JobGeneralSettings jobType={props.jobType} organization={props.organization} isEdition={false} />
        </Section>

        {watchServiceType && (
          <Section className="gap-4">
            <Heading>{watchServiceType === ServiceTypeEnum.APPLICATION ? 'Build and deploy' : 'Deploy'}</Heading>
            {watchServiceType === ServiceTypeEnum.APPLICATION && <BuildSettings buildModeDisabled />}
            {props.jobType === ServiceTypeEnum.CRON_JOB && watchBuildMode === BuildModeEnum.DOCKER && (
              <EntrypointCmdInputs />
            )}
            <AutoDeploySetting source={watchServiceType === ServiceTypeEnum.CONTAINER ? 'CONTAINER_REGISTRY' : 'GIT'} />
          </Section>
        )}

        <div className="flex justify-between">
          <Button
            onClick={() => navigate(SERVICES_URL(organizationId, projectId, environmentId))}
            type="button"
            size="lg"
            variant="plain"
          >
            Cancel
          </Button>
          <Button
            data-testid="button-submit"
            type="submit"
            disabled={!(formState.isValid && isGitSettingsValid)}
            size="lg"
          >
            Continue
          </Button>
        </div>
      </form>
    </Section>
  )
}

export default StepGeneral
