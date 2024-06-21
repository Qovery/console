import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useCheckDockerfile } from '@qovery/domains/environments/feature'
import {
  DockerfileSettings,
  type DockerfileSettingsData,
  useEditService,
  useService,
} from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { isJobGitSource } from '@qovery/shared/enums'
import { Button } from '@qovery/shared/ui'

export function PageSettingsDockerfileFeature() {
  const { environmentId = '', applicationId = '' } = useParams()

  const { data: service } = useService({ serviceId: applicationId, serviceType: 'JOB' })
  const { mutate: editService, isLoading: isLoadingEditService } = useEditService({ environmentId })
  const { mutateAsync: mutateCheckDockerfile, isLoading: isLoadingCheckDockerfile } = useCheckDockerfile()

  const dockerfileForm = useForm<DockerfileSettingsData>({
    mode: 'onChange',
    defaultValues: {
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

    return (
      <div className="flex w-full flex-col justify-between">
        <div className="max-w-content-with-navigation-left p-8">
          <SettingsHeading
            title="Dockerfile"
            description="The Dockerfile allows to package your application with the right CLIs/Libraries and as well define the command to run during its execution. The Dockerfile can be stored in your git repository or on the Qovery control plane (Raw)."
          />
          <DockerfileSettings methods={dockerfileForm} onSubmit={onSubmit} directSubmit>
            <div className="flex justify-end">
              <Button type="submit" size="lg" disabled={isLoadingCheckDockerfile} loading={isLoadingEditService}>
                Save
              </Button>
            </div>
          </DockerfileSettings>
        </div>
      </div>
    )
  } else {
    // Could not happen as only lifecycle with git source have access to this page
    return null
  }
}

export default PageSettingsDockerfileFeature
