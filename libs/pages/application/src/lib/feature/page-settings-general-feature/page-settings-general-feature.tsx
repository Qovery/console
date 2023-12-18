import { BuildModeEnum } from 'qovery-typescript-axios'
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
    registry_id: data['registry'] || '',
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
  const sourceProvider: 'HELM_REPOSITORY' | 'GIT' = data['source_provider']
  const source = match(sourceProvider)
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
    .exhaustive()

  return {
    ...helm,
    name: data['name'],
    description: data['description'],
    source,
    allow_cluster_wide_resources: data['allow_cluster_wide_resources'],
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

  const defaultValues = match(service)
    .with({ serviceType: 'APPLICATION' }, (service) => ({
      auto_deploy: service.auto_deploy,
      dockerfile_path: service.dockerfile_path ?? 'Dockerfile',
      build_mode: service.build_mode,
      image_entry_point: service.entrypoint,
      cmd_arguments: (service.arguments && service.arguments.length && JSON.stringify(service.arguments)) || '',
    }))
    .with({ serviceType: 'CONTAINER' }, (service) => ({
      registry: service.registry?.id,
      image_name: service.image_name,
      image_tag: service.tag,
      image_entry_point: service.entrypoint,
      auto_deploy: service.auto_deploy,
      cmd_arguments: (service.arguments && service.arguments.length && JSON.stringify(service.arguments)) || '',
    }))
    .with({ serviceType: 'JOB' }, (service) => ({
      auto_deploy: service.auto_deploy,
      build_mode: BuildModeEnum.DOCKER,
      dockerfile_path: isJobGitSource(service.source) ? service.source.docker?.dockerfile_path : 'Dockerfile',
    }))
    .with({ serviceType: 'HELM' }, (service) => ({
      source_provider: isHelmRepositorySource(service.source) ? 'HELM_REPOSITORY' : 'GIT',
      repository: helmRepository?.repository?.id ?? helmGit?.url,
      chart_name: helmRepository?.chart_name,
      chart_version: helmRepository?.chart_version,
      auto_deploy: service.auto_deploy,
      auto_preview: service.allow_cluster_wide_resources,
      timeout_sec: service.timeout_sec,
      arguments: JSON.stringify(service.arguments),
    }))
    .otherwise(() => undefined)

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      name: service?.name,
      description: service?.description,
      ...defaultValues,
    },
  })

  const onSubmit = methods.handleSubmit((data) => {
    if (!service) return

    const payload = match(service)
      .with({ serviceType: 'APPLICATION' }, (service) => handleGitApplicationSubmit(data, service))
      .with({ serviceType: 'JOB' }, (service) => handleJobSubmit(data, service))
      .with({ serviceType: 'CONTAINER' }, (service) => handleContainerSubmit(data, service))
      .with({ serviceType: 'HELM' }, (service) => handleHelmSubmit(data, service))
      .otherwise(() => undefined)

    if (!payload) return null

    try {
      editService({
        serviceId: applicationId,
        payload,
      })
    } catch (e: unknown) {
      if (payload.serviceType === 'CONTAINER') {
        toastError(e as Error, 'Invalid CMD array')
      }
      return
    }

    return null
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
