import * as Collapsible from '@radix-ui/react-collapsible'
import { useNavigate, useParams } from '@tanstack/react-router'
import { type JobLifecycleTypeEnum, type Organization } from 'qovery-typescript-axios'
import { type FormEventHandler, useEffect, useState } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { match } from 'ts-pattern'
import {
  AnnotationSetting,
  ContainerRegistryCreateEditModal,
  GitRepositorySettings,
  LabelSetting,
  useOrganization,
} from '@qovery/domains/organizations/feature'
import { type Job } from '@qovery/domains/services/data-access'
import { AutoDeploySetting, BuildSettings, GeneralSetting, JobGeneralSettings } from '@qovery/domains/services/feature'
import { serviceTemplates } from '@qovery/domains/services/feature'
import { EntrypointCmdInputs } from '@qovery/shared/console-shared'
import { type JobType, ServiceTypeEnum } from '@qovery/shared/enums'
import { type JobGeneralData } from '@qovery/shared/interfaces'
import { Button, FunnelFlowBody, Heading, Icon, Section, useModal } from '@qovery/shared/ui'
import { parseCmd } from '@qovery/shared/util-js'
import { findTemplateData } from '../job-create-utils/job-create-utils'
import { useJobCreateContext } from '../job-creation-flow'

export interface StepGeneralContentProps {
  jobType: JobType
  templateType?: JobLifecycleTypeEnum
  onSubmit: FormEventHandler<HTMLFormElement>
  organization?: Organization
}

export function StepGeneral() {
  const { setGeneralData, generalData, dockerfileForm, setCurrentStep, jobType, templateType, jobURL } =
    useJobCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const navigate = useNavigate()

  const { data: organization } = useOrganization({ organizationId, suspense: true })

  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  const methods = useForm<JobGeneralData>({
    defaultValues: {
      auto_deploy: true,
      template_type: templateType,
      ...generalData,
    },
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit(async (data) => {
    const cloneData = {
      ...data,
    }

    if (data.is_public_repository) {
      data.auto_deploy = false
    }

    if (data.cmd_arguments) {
      cloneData.cmd = parseCmd(data.cmd_arguments)
    }

    if (data.serviceType === 'CONTAINER') {
      dockerfileForm.setValue('dockerfile_path', undefined)
      dockerfileForm.setValue('dockerfile_raw', undefined)
      dockerfileForm.setValue('docker_target_build_stage', undefined)
    }
    setGeneralData(cloneData)

    if (data.serviceType === ServiceTypeEnum.APPLICATION && jobType !== 'CRON_JOB') {
      navigate({
        to: jobURL + '/dockerfile',
        params: { organizationId, projectId, environmentId },
      })
    } else {
      navigate({
        to: jobURL + '/configure',
        params: { organizationId, projectId, environmentId },
      })
    }
  })

  return (
    <FunnelFlowBody>
      <FormProvider {...methods}>
        <StepGeneralContent
          organization={organization}
          onSubmit={onSubmit}
          jobType={jobType}
          templateType={templateType}
        />
      </FormProvider>
    </FunnelFlowBody>
  )
}

function StepGeneralContent(props: StepGeneralContentProps) {
  const { organizationId = '', environmentId = '', projectId = '', slug, option } = useParams({ strict: false })
  const [openExtraAttributes, setOpenExtraAttributes] = useState(false)
  const { openModal, closeModal } = useModal()
  const navigate = useNavigate()
  const { formState, watch } = useFormContext<JobGeneralData>()
  const watchServiceType = watch('serviceType')
  const watchIsPublicRepository = watch('is_public_repository')

  // NOTE: Validation corner case where git settings can be in loading state
  const isGitSettingsValid = watchServiceType === 'APPLICATION' ? watch('branch') : true

  const isTemplate = slug !== undefined

  const dataTemplate = serviceTemplates.find((service) => service.slug === slug)
  const dataOptionTemplate = option !== 'current' ? findTemplateData(slug, option) : null

  return (
    <Section>
      {isTemplate ? (
        <div className="mb-10">
          <Heading className="mb-2">
            {dataTemplate?.title} {dataOptionTemplate?.title ? `- ${dataOptionTemplate?.title}` : ''}
          </Heading>
          <p className="text-sm text-neutral-subtle">
            {match(props.templateType)
              .with(
                'TERRAFORM',
                'CLOUDFORMATION',
                () =>
                  'These general settings allow you to set up the service name, its source and deployment parameters.'
              )
              .with(
                'GENERIC',
                undefined,
                () => 'General settings allow you to set up your lifecycle name with our git repository settings.'
              )
              .exhaustive()}
          </p>
        </div>
      ) : (
        <>
          <Heading className="mb-2">
            {props.jobType === ServiceTypeEnum.CRON_JOB ? 'Cron' : 'Lifecycle'} job information
          </Heading>
          <p className="mb-10 text-sm text-neutral-subtle">
            General settings allow you to set up your application name, git repository or container settings.
          </p>
        </>
      )}

      <form className="space-y-10" onSubmit={props.onSubmit}>
        <Section className="gap-4">
          <Heading>General</Heading>
          <GeneralSetting
            label="Service name"
            service={match(props.jobType)
              .with(
                ServiceTypeEnum.LIFECYCLE_JOB,
                (): Job => ({
                  id: '',
                  name: '',
                  environment: {
                    id: '',
                  },
                  service_type: 'JOB',
                  serviceType: 'JOB',
                  job_type: 'LIFECYCLE',
                  auto_preview: false,
                  maximum_cpu: 0,
                  maximum_memory: 0,
                  maximum_gpu: 0,
                  cpu: 0,
                  memory: 0,
                  gpu: 0,
                  created_at: '',
                  healthchecks: {},
                  icon_uri: 'app://qovery-console/lifecycle-job',
                  source: { docker: {} },
                  schedule: { lifecycle_type: props.templateType },
                })
              )
              .with(
                ServiceTypeEnum.CRON_JOB,
                (): Job => ({
                  id: '',
                  name: '',
                  environment: {
                    id: '',
                  },
                  service_type: 'JOB',
                  serviceType: 'JOB',
                  job_type: 'CRON',
                  auto_preview: false,
                  maximum_cpu: 0,
                  maximum_memory: 0,
                  maximum_gpu: 0,
                  cpu: 0,
                  memory: 0,
                  gpu: 0,
                  created_at: '',
                  healthchecks: {},
                  icon_uri: 'app://qovery-console/cron-job',
                  source: { docker: {} },
                  schedule: { cronjob: { timezone: '', scheduled_at: '' } },
                })
              )
              .exhaustive()}
          />
        </Section>

        <Section className="gap-4">
          <Heading>Source</Heading>
          <JobGeneralSettings
            jobType={props.jobType}
            organization={props.organization}
            isEdition={false}
            openContainerRegistryCreateEditModal={() =>
              openModal({
                content: (
                  <ContainerRegistryCreateEditModal
                    organizationId={props.organization?.id ?? ''}
                    onClose={() => {
                      closeModal()
                    }}
                  />
                ),
                options: {
                  fakeModal: true,
                  width: 680,
                },
              })
            }
            renderGitRepositorySettings={({ organizationId, rootPathLabel, rootPathHint }) => (
              <GitRepositorySettings
                gitDisabled={false}
                organizationId={organizationId}
                rootPathLabel={rootPathLabel}
                rootPathHint={rootPathHint}
              />
            )}
            rootPathLabel={match(props.templateType)
              .with('CLOUDFORMATION', () => 'Template folder path')
              .with('TERRAFORM', () => 'Manifest folder path')
              .with('GENERIC', undefined, () => undefined)
              .exhaustive()}
            rootPathHint={match(props.templateType)
              .with('CLOUDFORMATION', () => 'Provide the folder path in the repository where the template is located')
              .with('TERRAFORM', () => 'Provide the folder path in the repository where the manifest is located')
              .with('GENERIC', undefined, () => undefined)
              .exhaustive()}
          />
        </Section>

        {watchServiceType && (
          <Section className="gap-4">
            <Heading>{watchServiceType === ServiceTypeEnum.APPLICATION ? 'Build and deploy' : 'Deploy'}</Heading>
            {watchServiceType === ServiceTypeEnum.APPLICATION && props.jobType === ServiceTypeEnum.CRON_JOB && (
              <BuildSettings />
            )}
            {props.jobType === ServiceTypeEnum.CRON_JOB && <EntrypointCmdInputs />}
            {!watchIsPublicRepository && (
              <AutoDeploySetting
                source={watchServiceType === ServiceTypeEnum.CONTAINER ? 'CONTAINER_REGISTRY' : 'GIT'}
              />
            )}
          </Section>
        )}

        <Collapsible.Root open={openExtraAttributes} onOpenChange={setOpenExtraAttributes} asChild>
          <Section className="gap-4">
            <div className="flex justify-between">
              <Heading>Extra labels/annotations</Heading>
              <Collapsible.Trigger className="flex items-center gap-2 text-sm font-medium">
                {openExtraAttributes ? (
                  <>
                    Hide <Icon iconName="chevron-up" />
                  </>
                ) : (
                  <>
                    Show <Icon iconName="chevron-down" />
                  </>
                )}
              </Collapsible.Trigger>
            </div>{' '}
            <Collapsible.Content className="flex flex-col gap-4">
              <LabelSetting />
              <AnnotationSetting />
            </Collapsible.Content>
          </Section>
        </Collapsible.Root>

        <div className="flex justify-between">
          <Button
            onClick={() =>
              navigate({
                to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/new',
                params: { organizationId, projectId, environmentId },
              })
            }
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
