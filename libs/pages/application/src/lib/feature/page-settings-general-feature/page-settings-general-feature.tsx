import { BuildModeEnum, BuildPackLanguageEnum } from 'qovery-typescript-axios'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { P, match } from 'ts-pattern'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { type Application, type Container, type Helm, type Job } from '@qovery/domains/services/data-access'
import { useEditService, useService } from '@qovery/domains/services/feature'
import { isHelmGitSource, isHelmRepositorySource, isJobGitSource } from '@qovery/shared/enums'
import { toastError } from '@qovery/shared/ui'
import { getGitTokenValue } from '@qovery/shared/util-git'
import { buildGitRepoUrl } from '@qovery/shared/util-js'
import PageSettingsGeneral from '../../ui/page-settings-general/page-settings-general'

export const handleGitApplicationSubmit = (data: FieldValues, application: Application) => {
  let cloneApplication = Object.assign({}, application)
  cloneApplication.name = data['name']
  cloneApplication.description = data['description']
  cloneApplication.auto_deploy = data['auto_deploy']

  if ('build_mode' in cloneApplication) {
    cloneApplication.build_mode = data['build_mode']

    if (data['build_mode'] === BuildModeEnum.DOCKER) {
      cloneApplication.dockerfile_path = data['dockerfile_path']
      cloneApplication.buildpack_language = null
    } else {
      cloneApplication.buildpack_language = data['buildpack_language']
      cloneApplication.dockerfile_path = null
    }

    const gitToken = getGitTokenValue(data['provider'])

    const git_repository = {
      url: buildGitRepoUrl(gitToken?.type ?? data['provider'], data['repository']),
      branch: data['branch'],
      root_path: data['root_path'],
      git_token_id: gitToken ? gitToken.id : application.git_repository?.git_token_id,
    }

    cloneApplication.git_repository = git_repository
  }

  cloneApplication = {
    ...cloneApplication,
    arguments: (data['cmd_arguments'] && data['cmd_arguments'].length && eval(data['cmd_arguments'])) || [],
    entrypoint: data['image_entry_point'] || '',
  }

  return cloneApplication
}

export const handleContainerSubmit = (data: FieldValues, container: Container) => {
  return {
    ...container,
    name: data['name'],
    description: data['description'] || '',
    auto_deploy: data['auto_deploy'],
    tag: data['image_tag'] || '',
    image_name: data['image_name'] || '',
    arguments: (data['cmd_arguments'] && data['cmd_arguments'].length && eval(data['cmd_arguments'])) || [],
    entrypoint: data['image_entry_point'] || '',
    registry: data['registry'] || '',
  }
}

export const handleJobSubmit = (data: FieldValues, job: Job) => {
  if (isJobGitSource(job.source)) {
    const gitToken = getGitTokenValue(data['provider'])

    const git_repository = {
      url: buildGitRepoUrl(gitToken?.type ?? data['provider'], data['repository']),
      branch: data['branch'],
      root_path: data['root_path'],
      git_token_id: gitToken ? gitToken.id : undefined,
    }

    return {
      ...job,
      name: data['name'],
      description: data['description'],
      auto_deploy: data['auto_deploy'],
      source: {
        docker: {
          git_repository,
          dockerfile_path: data['dockerfile_path'],
        },
      },
    }
  } else {
    return {
      ...job,
      name: data['name'],
      description: data['description'],
      auto_deploy: data['auto_deploy'],
      source: {
        image: {
          tag: data['image_tag'] || '',
          image_name: data['image_name'] || '',
          registry_id: data['registry'] || '',
        },
      },
    }
  }
}

export const handleHelmSubmit = (data: FieldValues, helm: Helm) => {
  const source = match(data['source_provider'])
    .with('GIT', () => {
      const gitToken = getGitTokenValue(data['provider'] ?? '')

      return {
        git: {
          git_repository: {
            url: buildGitRepoUrl(gitToken?.type ?? data['provider'] ?? '', data['repository']),
            branch: data['branch'],
            root_path: data['root_path'],
            git_token_id: gitToken?.id,
          },
        },
      }
    })
    .with('HELM_REPOSITORY', () => ({
      repository: {
        repository: {
          id: data['repository'],
        },
        chart_name: data['chart_name'],
        chart_version: data['chart_version'],
      },
    }))
    .run()

  return {
    ...helm,
    name: data['name'],
    description: data['description'],
    source,
    allow_cluster_wide_resources: data['auto_preview'],
    arguments: JSON.parse(data['arguments']),
    timeout_sec: parseInt(data['timeout_sec'], 10),
    auto_deploy: data['auto_deploy'] ?? false,
  }
}

export function PageSettingsGeneralFeature() {
  const { organizationId = '', environmentId = '', applicationId = '' } = useParams()

  const { data: organization } = useOrganization({ organizationId })
  const { data: service } = useService({ environmentId, serviceId: applicationId })
  const { mutate: editService, isLoading: isLoadingEditService } = useEditService({ environmentId })

  const helmRepository = match(service)
    .with({ serviceType: 'HELM', source: P.when(isHelmRepositorySource) }, ({ source }) => source.repository)
    .otherwise(() => undefined)
  const helmGit = match(service)
    .with({ serviceType: 'HELM', source: P.when(isHelmGitSource) }, ({ source }) => source.git?.git_repository)
    .otherwise(() => undefined)

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      name: service?.name,
      description: service?.description,
      auto_deploy: (service as Application)?.auto_deploy,
      build_mode: service?.serviceType === 'JOB' ? BuildModeEnum.DOCKER : (service as Application)?.build_mode,
      buildpack_language: (service as Application)?.buildpack_language ?? BuildPackLanguageEnum.PYTHON,
      dockerfile_path: (service as Application)?.dockerfile_path ?? 'Dockerfile',
      registry: (service as Container)?.registry?.id,
      image_name: (service as Container)?.image_name,
      image_tag: (service as Container)?.tag,
      image_entry_point: (service as Application)?.entrypoint,
      cmd_arguments:
        (service as Application)?.arguments && (service as Application)?.arguments?.length
          ? JSON.stringify((service as Application).arguments)
          : '',
      source_provider: isHelmRepositorySource((service as Helm).source) ? 'HELM_REPOSITORY' : 'GIT',
      repository: helmRepository?.repository?.id ?? helmGit?.url,
      chart_name: helmRepository?.chart_name,
      chart_version: helmRepository?.chart_version,
    },
  })

  const onSubmit = methods.handleSubmit((data) => {
    if (!service) return

    return (
      match(service)
        .with({ serviceType: 'APPLICATION' }, (service) => {
          const application = handleGitApplicationSubmit(data, service)
          editService({
            serviceId: applicationId,
            payload: application,
          })
        })
        .with({ serviceType: 'JOB' }, (service) => {
          const job = handleJobSubmit(data, service)
          editService({
            serviceId: applicationId,
            payload: job,
          })
        })
        .with({ serviceType: 'CONTAINER' }, (service) => {
          try {
            const container = handleContainerSubmit(data, service)
            editService({
              serviceId: applicationId,
              payload: container,
            })
          } catch (e: unknown) {
            toastError(e as Error, 'Invalid CMD array')
            return
          }
        })
        .with({ serviceType: 'HELM' }, (service) => {
          const helm = handleHelmSubmit(data, service)
          editService({
            serviceId: applicationId,
            payload: helm,
          })
        })
        // TODO: fix unsafe function
        .run()
    )
  })

  return (
    <FormProvider {...methods}>
      <PageSettingsGeneral
        service={service}
        isLoadingEditService={isLoadingEditService}
        onSubmit={onSubmit}
        organization={organization}
      />
    </FormProvider>
  )
}

export default PageSettingsGeneralFeature
