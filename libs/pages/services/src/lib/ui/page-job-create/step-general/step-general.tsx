import { type JobLifecycleTypeEnum, type Organization } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { AnnotationSetting, LabelSetting } from '@qovery/domains/organizations/feature'
import { AutoDeploySetting, BuildSettings, GeneralSetting } from '@qovery/domains/services/feature'
import { EntrypointCmdInputs, JobGeneralSettings } from '@qovery/shared/console-shared'
import { type JobType, ServiceTypeEnum } from '@qovery/shared/enums'
import { type JobGeneralData } from '@qovery/shared/interfaces'
import { SERVICES_URL } from '@qovery/shared/routes'
import { Button, Heading, Section } from '@qovery/shared/ui'
import { findTemplateData } from '../../../feature/page-job-create-feature/page-job-create-feature'
import { serviceTemplates } from '../../../feature/page-new-feature/service-templates'

export interface StepGeneralProps {
  jobType: JobType
  templateType: JobLifecycleTypeEnum | undefined
  onSubmit: FormEventHandler<HTMLFormElement>
  organization?: Organization
}

export function StepGeneral(props: StepGeneralProps) {
  const { organizationId = '', environmentId = '', projectId = '', slug, option } = useParams()
  const navigate = useNavigate()
  const { formState, watch } = useFormContext<JobGeneralData>()
  const watchServiceType = watch('serviceType')

  // NOTE: Validation corner case where git settings can be in loading state
  const isGitSettingsValid = watchServiceType === 'APPLICATION' ? watch('branch') : true

  const isTemplate = slug !== undefined

  const dataTemplate = serviceTemplates.find((service) => service.slug === slug)
  const dataOptionTemplate = option !== 'current' ? findTemplateData(slug, option) : null

  return (
    <Section>
      {isTemplate ? (
        <div className="mb-10 flex items-center gap-6">
          <img src={dataTemplate?.icon as string} alt={slug} className="h-10 w-10" />
          <div>
            <Heading className="mb-2">
              {dataTemplate?.title} {dataOptionTemplate?.title ? `- ${dataOptionTemplate?.title}` : ''}
            </Heading>
            <p className="text-sm text-neutral-350">
              General settings allow you to set up your lifecycle name with our git repository settings.
            </p>
          </div>
        </div>
      ) : (
        <>
          <Heading className="mb-2">
            {props.jobType === ServiceTypeEnum.CRON_JOB ? 'Cron' : 'Lifecycle'} job information
          </Heading>
          <p className="mb-10 text-sm text-neutral-350">
            General settings allow you to set up your application name, git repository or container settings.
          </p>
        </>
      )}

      <form className="space-y-10" onSubmit={props.onSubmit}>
        <Section className="gap-4">
          <Heading>General</Heading>
          <GeneralSetting label="Service name" />
        </Section>

        <Section className="gap-4">
          <Heading>Source</Heading>
          <JobGeneralSettings
            jobType={props.jobType}
            organization={props.organization}
            isEdition={false}
            rootPathLabel={props.templateType === 'CLOUDFORMATION' ? 'Template folder path' : undefined}
          />
        </Section>

        {watchServiceType && (
          <Section className="gap-4">
            <Heading>{watchServiceType === ServiceTypeEnum.APPLICATION ? 'Build and deploy' : 'Deploy'}</Heading>
            {watchServiceType === ServiceTypeEnum.APPLICATION && props.jobType === ServiceTypeEnum.CRON_JOB && (
              <BuildSettings buildModeDisabled />
            )}
            {props.jobType === ServiceTypeEnum.CRON_JOB && <EntrypointCmdInputs />}
            <AutoDeploySetting source={watchServiceType === ServiceTypeEnum.CONTAINER ? 'CONTAINER_REGISTRY' : 'GIT'} />
          </Section>
        )}

        <Section className="gap-4">
          <Heading>Extra labels/annotations</Heading>
          <LabelSetting />
          <AnnotationSetting />
        </Section>

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
