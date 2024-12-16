import { type LifecycleJobResponse } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { type UseFormReturn, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useCheckDockerfile, useLifecycleTemplate } from '@qovery/domains/environments/feature'
import {
  DockerfileSettings,
  type DockerfileSettingsData,
  useEditService,
  useService,
} from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { isJobGitSource } from '@qovery/shared/enums'
import { ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { Button } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { TemplateIds } from '@qovery/shared/util-services'

function DockerfileSettingsFromTemplate({
  children,
  onSubmit,
  dockerfileForm,
  service,
}: {
  children: ReactNode
  onSubmit: () => void
  dockerfileForm: UseFormReturn<DockerfileSettingsData>
  service: LifecycleJobResponse
}) {
  const { data: template } = useLifecycleTemplate({
    environmentId: service.environment.id,
    templateId: TemplateIds[service.schedule.lifecycle_type as keyof typeof TemplateIds],
  })
  return (
    <DockerfileSettings
      methods={dockerfileForm}
      onSubmit={onSubmit}
      directSubmit
      defaultContent={template?.dockerfile}
      templateType={service.schedule.lifecycle_type}
    >
      {children}
    </DockerfileSettings>
  )
}

export function PageSettingsDockerfileFeature() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()

  const { data: service } = useService({ serviceId: applicationId, serviceType: 'JOB' })
  const { mutate: editService, isLoading: isLoadingEditService } = useEditService({
    environmentId,
    logsLink: ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId),
  })
  const { mutateAsync: mutateCheckDockerfile, isLoading: isLoadingCheckDockerfile } = useCheckDockerfile()

  const dockerfileForm = useForm<DockerfileSettingsData>({
    mode: 'onChange',
    defaultValues: {
      dockerfile_source:
        service?.job_type === 'LIFECYCLE' && isJobGitSource(service.source) && service.source.docker.dockerfile_raw
          ? 'DOCKERFILE_RAW'
          : 'GIT_REPOSITORY',
      dockerfile_path:
        service?.job_type === 'LIFECYCLE' && isJobGitSource(service.source)
          ? service.source.docker.dockerfile_path ?? 'Dockerfile'
          : undefined,
      dockerfile_raw:
        service?.job_type === 'LIFECYCLE' && isJobGitSource(service.source)
          ? service.source.docker.dockerfile_raw ?? ''
          : undefined,
    },
  })

  if (service?.job_type === 'LIFECYCLE' && isJobGitSource(service.source)) {
    const gitRepository = service.source.docker.git_repository
    const onSubmit = dockerfileForm.handleSubmit(async (data) => {
      if (data.dockerfile_raw) {
        editService({
          serviceId: applicationId,
          payload: {
            ...service,
            source: {
              docker: {
                git_repository: gitRepository,
                dockerfile_raw: data.dockerfile_raw,
                dockerfile_path: null,
              },
            },
          },
        })
      } else if (data.dockerfile_path) {
        try {
          await mutateCheckDockerfile({
            environmentId,
            dockerfileCheckRequest: {
              git_repository: {
                url: gitRepository?.url ?? '',
                root_path: gitRepository?.root_path,
                branch: gitRepository?.branch,
                git_token_id: gitRepository?.git_token_id,
              },
              dockerfile_path: data.dockerfile_path,
            },
          })
          editService({
            serviceId: applicationId,
            payload: {
              ...service,
              source: {
                docker: {
                  git_repository: gitRepository,
                  dockerfile_path: data.dockerfile_path,
                  dockerfile_raw: null,
                },
              },
            },
          })
        } catch (e: unknown) {
          dockerfileForm.setError('dockerfile_path', {
            type: 'custom',
            message: (e as Error).message ?? 'Dockerfile not found, please check the path and try again.',
          })
        }
      }
    })

    const watchDockerfilePath = dockerfileForm.watch('dockerfile_path')
    const watchDockerfileRaw = dockerfileForm.watch('dockerfile_raw')
    const watchDockerfileSource = dockerfileForm.watch('dockerfile_source')

    // HACK: Circonvent pitfall of formState.isValid issues, specially in test
    // https://github.com/react-hook-form/react-hook-form/issues/2755
    const isValid = watchDockerfileSource === 'DOCKERFILE_RAW' ? !!watchDockerfileRaw : !!watchDockerfilePath

    const DockerfileSettingsWrapper =
      service?.job_type === 'LIFECYCLE' && service.schedule.lifecycle_type !== 'GENERIC'
        ? ({ children }: { children: ReactNode }) => (
            <DockerfileSettingsFromTemplate onSubmit={onSubmit} dockerfileForm={dockerfileForm} service={service}>
              {children}
            </DockerfileSettingsFromTemplate>
          )
        : ({ children }: { children: ReactNode }) => (
            <DockerfileSettings methods={dockerfileForm} onSubmit={onSubmit} directSubmit>
              {children}
            </DockerfileSettings>
          )

    return (
      <div className="flex w-full flex-col justify-between">
        <div className="max-w-content-with-navigation-left p-8">
          <SettingsHeading
            title="Dockerfile"
            description={match(service.schedule.lifecycle_type)
              .with(
                'CLOUDFORMATION',
                (templateType) =>
                  `The Dockerfile allows to package your template and input into a container image with the right ${upperCaseFirstLetter(templateType)} CLI, inputs and commands to run. The Dockerfile can be stored in your git repository or on the Qovery control plane (Raw).`
              )
              .with(
                'TERRAFORM',
                (templateType) =>
                  `The Dockerfile allows to package your manifest and input into a container image with the right ${upperCaseFirstLetter(templateType)} CLI, inputs and commands to run. The Dockerfile can be stored in your git repository or on the Qovery control plane (Raw).`
              )
              .with(
                'GENERIC',
                undefined,
                () =>
                  `The Dockerfile allows to package your application with the right CLIs/Libraries and as well define the command to run during its execution. The Dockerfile can be stored in your git repository or on the Qovery control plane (Raw).`
              )
              .exhaustive()}
          />
          <DockerfileSettingsWrapper>
            <div className="flex justify-end">
              <Button
                type="submit"
                size="lg"
                disabled={isLoadingCheckDockerfile || !isValid}
                loading={isLoadingEditService}
              >
                Save
              </Button>
            </div>
          </DockerfileSettingsWrapper>
        </div>
      </div>
    )
  } else {
    // Could not happen as only lifecycle with git source have access to this page
    return null
  }
}

export default PageSettingsDockerfileFeature
