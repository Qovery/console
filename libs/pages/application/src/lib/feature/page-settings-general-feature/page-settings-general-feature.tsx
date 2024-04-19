import {
  type ApplicationEditRequest,
  BuildModeEnum,
  type ContainerRequest,
  type HelmRequest,
  type HelmRequestAllOfSource,
  type HelmRequestAllOfSourceOneOf,
  type HelmRequestAllOfSourceOneOf1,
  type JobRequest,
} from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { P, match } from 'ts-pattern'
import { useOrganization } from '@qovery/domains/organizations/feature'
import {
  type Application,
  type Container,
  type Helm,
  type Job,
  JobType,
  type ServiceType,
} from '@qovery/domains/services/data-access'
import {
  useAddAnnotationsGroup,
  useAnnotationsGroup,
  useDeleteAnnotationsGroup,
  useEditService,
  useService,
} from '@qovery/domains/services/feature'
import { type HelmGeneralData } from '@qovery/pages/services'
import { isHelmGitSource, isHelmRepositorySource, isJobContainerSource, isJobGitSource } from '@qovery/shared/enums'
import { type ApplicationGeneralData, type JobGeneralData } from '@qovery/shared/interfaces'
import { toastError } from '@qovery/shared/ui'
import { buildGitRepoUrl } from '@qovery/shared/util-js'
import PageSettingsGeneral from '../../ui/page-settings-general/page-settings-general'

export const handleGitApplicationSubmit = (
  data: ApplicationGeneralData,
  application: Application
): ApplicationEditRequest => {
  let cloneApplication: ApplicationEditRequest = {
    ...application,
    dockerfile_path: undefined,
    git_repository: undefined,
    name: data.name,
    description: data.description || '',
    auto_deploy: data.auto_deploy,
  }
  cloneApplication.auto_deploy = data.auto_deploy

  if ('build_mode' in cloneApplication) {
    cloneApplication.build_mode = data.build_mode

    if (data.build_mode === BuildModeEnum.DOCKER) {
      cloneApplication.dockerfile_path = data.dockerfile_path
      cloneApplication.buildpack_language = null
    } else {
      cloneApplication.buildpack_language = data.buildpack_language
      cloneApplication.dockerfile_path = undefined
    }

    const git_repository = {
      url: buildGitRepoUrl(data.provider ?? '', data.repository ?? ''),
      branch: data.branch,
      root_path: data.root_path,
      git_token_id: data.git_token_id,
    }

    cloneApplication.git_repository = git_repository
  }

  cloneApplication = {
    ...cloneApplication,
    arguments: (data.cmd_arguments && data.cmd_arguments.length && eval(data.cmd_arguments)) || [],
    entrypoint: data.image_entry_point || '',
  }

  return cloneApplication
}

export const handleContainerSubmit = (data: ApplicationGeneralData, container: Container): ContainerRequest => {
  return {
    ...container,
    name: data.name,
    description: data.description || '',
    auto_deploy: data.auto_deploy,
    tag: data.image_tag || '',
    image_name: data.image_name || '',
    arguments: (data.cmd_arguments && data.cmd_arguments.length && eval(data.cmd_arguments)) || [],
    entrypoint: data.image_entry_point || '',
    registry_id: data['registry'] || '',
  }
}

export const handleJobSubmit = (data: JobGeneralData, job: Job): JobRequest => {
  const schedule = match(job)
    .with({ job_type: 'CRON' }, (j): JobRequest['schedule'] => {
      const { cronjob } = j.schedule
      return {
        cronjob: {
          ...cronjob,
          entrypoint: data.image_entry_point,
          arguments: (data.cmd_arguments && data.cmd_arguments.length && eval(data.cmd_arguments)) || [],
        },
      }
    })
    .otherwise(() => undefined)

  if (isJobGitSource(job.source)) {
    const git_repository = {
      url: buildGitRepoUrl(data.provider ?? '', data.repository ?? ''),
      branch: data.branch,
      root_path: data.root_path,
      git_token_id: data.git_token_id,
    }

    return {
      ...job,
      name: data.name,
      description: data.description,
      auto_deploy: data.auto_deploy,
      source: {
        docker: {
          git_repository,
          dockerfile_path: data.dockerfile_path,
        },
      },
      schedule,
    }
  } else {
    return {
      ...job,
      name: data.name,
      description: data.description,
      auto_deploy: data.auto_deploy,
      source: {
        image: {
          tag: data.image_tag || '',
          image_name: data.image_name || '',
          registry_id: data.registry || '',
        },
      },
      schedule,
    }
  }
}

export const handleHelmSubmit = (data: HelmGeneralData, helm: Helm): HelmRequest => {
  const sourceProvider: 'HELM_REPOSITORY' | 'GIT' = data['source_provider']
  const source: HelmRequestAllOfSource = match(sourceProvider)
    .with('GIT', (): HelmRequestAllOfSourceOneOf => {
      return {
        git_repository: {
          url: buildGitRepoUrl(data.provider ?? '', data.repository ?? ''),
          branch: data.branch,
          root_path: data.root_path,
          git_token_id: data.git_token_id,
        },
      }
    })
    .with(
      'HELM_REPOSITORY',
      (): HelmRequestAllOfSourceOneOf1 => ({
        helm_repository: {
          repository: data.repository,
          chart_name: data.chart_name,
          chart_version: data.chart_version,
        },
      })
    )
    .exhaustive()

  return {
    ...helm,
    name: data.name,
    description: data.description,
    source,
    allow_cluster_wide_resources: data.allow_cluster_wide_resources,
    arguments: JSON.parse(data.arguments),
    timeout_sec: parseInt(data.timeout_sec, 10),
    auto_deploy: data.auto_deploy ?? false,
  }
}

export function PageSettingsGeneralFeature() {
  const { organizationId = '', environmentId = '', applicationId = '' } = useParams()

  const { data: organization } = useOrganization({ organizationId })
  const { data: service } = useService({ environmentId, serviceId: applicationId })

  const { data: annotationsGroup } = useAnnotationsGroup({
    serviceId: applicationId,
    serviceType: service?.serviceType !== 'HELM' ? service?.serviceType : undefined,
  })
  const { mutate: deleteAnnotationGroup } = useDeleteAnnotationsGroup()
  const { mutate: addAnnotationsGroup } = useAddAnnotationsGroup()

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
      annotations_groups: annotationsGroup?.map((group) => group.id),
    }))
    .with({ serviceType: 'CONTAINER' }, (service) => ({
      registry: service.registry?.id,
      image_name: service.image_name,
      image_tag: service.tag,
      image_entry_point: service.entrypoint,
      auto_deploy: service.auto_deploy,
      cmd_arguments: (service.arguments && service.arguments.length && JSON.stringify(service.arguments)) || '',
      annotations_groups: annotationsGroup?.map((group) => group.id),
    }))
    .with({ serviceType: 'JOB' }, (service) => {
      const jobContainerSource = isJobContainerSource(service.source) ? service.source.image : undefined

      const schedule = match(service)
        .with({ job_type: 'CRON' }, (s) => {
          const { cronjob } = s.schedule
          return {
            cmd_arguments:
              cronjob?.arguments && cronjob?.arguments.length > 0 ? JSON.stringify(cronjob?.arguments) : undefined,
            image_entry_point: cronjob?.entrypoint,
          }
        })
        .otherwise(() => undefined)

      return {
        auto_deploy: service.auto_deploy,
        build_mode: BuildModeEnum.DOCKER,
        dockerfile_path: isJobGitSource(service.source) ? service.source.docker?.dockerfile_path : 'Dockerfile',
        registry: jobContainerSource?.registry_id,
        image_name: jobContainerSource?.image_name,
        image_tag: jobContainerSource?.tag,
        annotations_groups: annotationsGroup?.map(({ id }) => id),
        ...schedule,
      }
    })
    .with({ serviceType: 'HELM' }, (service) => ({
      source_provider: isHelmRepositorySource(service.source) ? 'HELM_REPOSITORY' : 'GIT',
      repository: helmRepository?.repository?.id ?? helmGit?.url,
      chart_name: helmRepository?.chart_name,
      chart_version: helmRepository?.chart_version,
      auto_deploy: service.auto_deploy,
      auto_preview: service.auto_preview,
      allow_cluster_wide_resources: service.allow_cluster_wide_resources,
      timeout_sec: service.timeout_sec,
      arguments: JSON.stringify(service.arguments),
    }))
    .otherwise(() => undefined)

  const methods = useForm<ApplicationGeneralData | JobGeneralData | HelmGeneralData>({
    mode: 'onChange',
    defaultValues: {
      name: service?.name,
      description: service?.description,
      ...defaultValues,
    },
  })

  useEffect(() => {
    // We are a separate request to get annotations group
    // To join default values with Service request with need this useEffect
    methods.setValue(
      'annotations_groups',
      annotationsGroup?.map(({ id }) => id)
    )
  }, [methods, annotationsGroup])

  const onSubmit = methods.handleSubmit((data) => {
    if (!service) return

    const payload = match(service)
      .with({ serviceType: 'APPLICATION' }, (s) => {
        try {
          return {
            ...handleGitApplicationSubmit(data as ApplicationGeneralData, s),
            serviceType: s.serviceType,
          }
        } catch (e: unknown) {
          toastError(e as Error, 'Invalid CMD array')
          return
        }
      })
      .with({ serviceType: 'JOB' }, (s) => {
        try {
          return {
            ...handleJobSubmit(data as JobGeneralData, s),
            serviceType: s.serviceType,
          }
        } catch (e: unknown) {
          toastError(e as Error, 'Invalid CMD array')
          return
        }
      })
      .with({ serviceType: 'CONTAINER' }, (s) => {
        try {
          return {
            ...handleContainerSubmit(data as ApplicationGeneralData, s),
            serviceType: s.serviceType,
          }
        } catch (e: unknown) {
          toastError(e as Error, 'Invalid CMD array')
          return
        }
      })
      .with({ serviceType: 'HELM' }, (s) => {
        try {
          return {
            ...handleHelmSubmit(data as HelmGeneralData, s),
            serviceType: s.serviceType,
          }
        } catch (e: unknown) {
          toastError(e as Error, 'Invalid Helm arguments')
          return
        }
      })
      .otherwise(() => undefined)

    if (!payload) return null

    editService({
      serviceId: applicationId,
      payload,
    })

    // Process annotations to trigger delete and add annotations group for services
    function processAnnotations(
      data: ApplicationGeneralData | JobGeneralData,
      serviceId: string,
      serviceType: Extract<ServiceType, 'APPLICATION' | 'CONTAINER' | 'JOB'>
    ) {
      const annotationsGroupIds = annotationsGroup?.map(({ id }) => id) || []
      const dataAnnotationsGroupIds = data['annotations_groups'] ?? []

      const addedAnnotationsGroup = dataAnnotationsGroupIds.filter((id) => !annotationsGroupIds.includes(id))
      addedAnnotationsGroup.forEach((id) => addAnnotationsGroup({ serviceId, serviceType, annotationsGroupId: id }))

      const deletedAnnotationGroup = annotationsGroupIds.filter((id) => !dataAnnotationsGroupIds.includes(id))
      deletedAnnotationGroup.forEach((id) => deleteAnnotationGroup({ serviceId, serviceType, annotationsGroupId: id }))
    }

    match(service)
      .with({ serviceType: 'APPLICATION' }, { serviceType: 'CONTAINER' }, (s) => {
        processAnnotations(data as ApplicationGeneralData, s.id, s.serviceType)
      })
      .with({ serviceType: 'JOB' }, (s) => {
        processAnnotations(data as JobGeneralData, s.id, s.serviceType)
      })
      .with({ serviceType: 'HELM' }, () => undefined)
      .otherwise(() => undefined)

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
