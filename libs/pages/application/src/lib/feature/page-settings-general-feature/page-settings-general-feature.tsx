import {
  type ApplicationEditRequest,
  BuildModeEnum,
  type ContainerRequest,
  type HelmRequest,
  type HelmRequestAllOfSource,
  type HelmRequestAllOfSourceOneOf,
  type HelmRequestAllOfSourceOneOf1,
  type JobRequest,
  type OrganizationAnnotationsGroupResponse,
  type OrganizationLabelsGroupEnrichedResponse,
} from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { P, match } from 'ts-pattern'
import { useAnnotationsGroups, useLabelsGroups, useOrganization } from '@qovery/domains/organizations/feature'
import { type Application, type Container, type Helm, type Job } from '@qovery/domains/services/data-access'
import { useDeploymentStatus, useEditService, useService } from '@qovery/domains/services/feature'
import { type HelmGeneralData } from '@qovery/pages/services'
import { isHelmGitSource, isHelmRepositorySource, isJobContainerSource, isJobGitSource } from '@qovery/shared/enums'
import { type ApplicationGeneralData, type JobGeneralData } from '@qovery/shared/interfaces'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { buildGitRepoUrl, joinArgsWithQuotes, parseCmd } from '@qovery/shared/util-js'
import PageSettingsGeneral from '../../ui/page-settings-general/page-settings-general'

export const handleGitApplicationSubmit = (
  data: ApplicationGeneralData,
  application: Application,
  labelsGroups: OrganizationLabelsGroupEnrichedResponse[],
  annotationsGroups: OrganizationAnnotationsGroupResponse[]
): ApplicationEditRequest => {
  let cloneApplication: ApplicationEditRequest = {
    ...application,
    dockerfile_path: undefined,
    git_repository: undefined,
    name: data.name,
    description: data.description || '',
    icon_uri: data.icon_uri,
    auto_deploy: data.auto_deploy,
  }
  cloneApplication.auto_deploy = data.auto_deploy

  if ('build_mode' in cloneApplication) {
    cloneApplication.build_mode = data.build_mode

    if (data.build_mode === BuildModeEnum.DOCKER) {
      cloneApplication.dockerfile_path = data.dockerfile_path
    } else {
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
    arguments: data.cmd_arguments?.length ? parseCmd(data.cmd_arguments) : [],
    entrypoint: data.image_entry_point || '',
    annotations_groups: annotationsGroups.filter((group) => data.annotations_groups?.includes(group.id)),
    labels_groups: labelsGroups.filter((group) => data.labels_groups?.includes(group.id)),
  }

  return cloneApplication
}

export const handleContainerSubmit = (
  data: ApplicationGeneralData,
  container: Container,
  labelsGroups: OrganizationLabelsGroupEnrichedResponse[],
  annotationsGroups: OrganizationAnnotationsGroupResponse[]
): ContainerRequest => {
  return {
    ...container,
    name: data.name,
    description: data.description || '',
    icon_uri: data.icon_uri,
    auto_deploy: data.auto_deploy,
    tag: data.image_tag || '',
    image_name: data.image_name || '',
    arguments: data.cmd_arguments?.length ? parseCmd(data.cmd_arguments) : [],
    entrypoint: data.image_entry_point || '',
    registry_id: data.registry || '',
    annotations_groups: annotationsGroups.filter((group) => data.annotations_groups?.includes(group.id)),
    labels_groups: labelsGroups.filter((group) => data.labels_groups?.includes(group.id)),
  }
}

export const handleJobSubmit = (
  data: JobGeneralData,
  job: Job,
  labelsGroups: OrganizationLabelsGroupEnrichedResponse[],
  annotationsGroups: OrganizationAnnotationsGroupResponse[]
): JobRequest => {
  const schedule = match(job)
    .with({ job_type: 'CRON' }, (j): JobRequest['schedule'] => {
      const { cronjob } = j.schedule
      return {
        cronjob: {
          ...cronjob,
          entrypoint: data.image_entry_point,
          arguments: data.cmd_arguments?.length ? parseCmd(data.cmd_arguments) : [],
        },
      }
    })
    .with({ job_type: 'LIFECYCLE' }, (s) => s.schedule)
    .exhaustive()

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
      icon_uri: data.icon_uri,
      auto_deploy: data.auto_deploy,
      annotations_groups: annotationsGroups.filter((annotationsGroups) =>
        data.annotations_groups?.includes(annotationsGroups.id)
      ),
      labels_groups: labelsGroups.filter((labelsGroups) => data.labels_groups?.includes(labelsGroups.id)),
      source: {
        docker: {
          git_repository,
          // Discrepancy between cron and lifecycle job
          // cron job has dockerfile_path in general data
          // whereas lifecycle job info are in DockerfileSettingsData
          // so we need to keep existing data
          dockerfile_path: data.dockerfile_path ?? job.source.docker.dockerfile_path,
          dockerfile_raw: job.source.docker.dockerfile_raw,
        },
      },
      schedule,
    }
  } else {
    return {
      ...job,
      name: data.name,
      description: data.description,
      icon_uri: data.icon_uri,
      auto_deploy: data.auto_deploy,
      annotations_groups: annotationsGroups.filter((annotationsGroups) =>
        data.annotations_groups?.includes(annotationsGroups.id)
      ),
      labels_groups: labelsGroups.filter((labelsGroups) => data.labels_groups?.includes(labelsGroups.id)),
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
    icon_uri: data.icon_uri,
    source,
    allow_cluster_wide_resources: data.allow_cluster_wide_resources,
    arguments: parseCmd(data.arguments),
    timeout_sec: parseInt(data.timeout_sec, 10),
    auto_deploy: data.auto_deploy ?? false,
  }
}

export function PageSettingsGeneralFeature() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()

  const { data: organization } = useOrganization({ organizationId })
  const { data: service } = useService({ environmentId, serviceId: applicationId })
  const { data: deploymentStatus } = useDeploymentStatus({ environmentId, serviceId: applicationId })
  const { data: labelsGroups = [] } = useLabelsGroups({ organizationId })
  const { data: annotationsGroups = [] } = useAnnotationsGroups({ organizationId })

  const { mutate: editService, isLoading: isLoadingEditService } = useEditService({
    environmentId,
    logsLink:
      ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) +
      DEPLOYMENT_LOGS_VERSION_URL(service?.id, deploymentStatus?.execution_id),
  })

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
      cmd_arguments: service.arguments?.length ? joinArgsWithQuotes(service.arguments) : '',
      labels_groups: service.labels_groups?.map((group) => group.id),
      annotations_groups: service.annotations_groups?.map((group) => group.id),
    }))
    .with({ serviceType: 'CONTAINER' }, (service) => ({
      registry: service.registry?.id,
      image_name: service.image_name,
      image_tag: service.tag,
      image_entry_point: service.entrypoint,
      auto_deploy: service.auto_deploy,
      cmd_arguments: service.arguments?.length ? joinArgsWithQuotes(service.arguments) : '',
      labels_groups: service.labels_groups?.map((group) => group.id),
      annotations_groups: service.annotations_groups?.map((group) => group.id),
    }))
    .with({ serviceType: 'JOB' }, (service) => {
      const jobContainerSource = isJobContainerSource(service.source) ? service.source.image : undefined

      const schedule = match(service)
        .with({ job_type: 'CRON' }, (s) => {
          const { cronjob } = s.schedule
          return {
            cmd_arguments: cronjob?.arguments?.length ? joinArgsWithQuotes(cronjob?.arguments) : '',
            image_entry_point: cronjob?.entrypoint,
          }
        })
        .with({ job_type: 'LIFECYCLE' }, (s) => ({
          template_type: s.schedule.lifecycle_type,
        }))
        .exhaustive()

      return {
        auto_deploy: service.auto_deploy,
        build_mode: BuildModeEnum.DOCKER,
        dockerfile_path: isJobGitSource(service.source) ? service.source.docker?.dockerfile_path : 'Dockerfile',
        registry: jobContainerSource?.registry_id,
        image_name: jobContainerSource?.image_name,
        image_tag: jobContainerSource?.tag,
        labels_groups: service.labels_groups?.map((group) => group.id),
        annotations_groups: service.annotations_groups?.map((group) => group.id),
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
      arguments: joinArgsWithQuotes(service.arguments),
    }))
    .otherwise(() => undefined)

  const methods = useForm<ApplicationGeneralData | JobGeneralData | HelmGeneralData>({
    mode: 'onChange',
    defaultValues: {
      name: service?.name,
      description: service?.description,
      icon_uri: service?.icon_uri,
      ...defaultValues,
    },
  })

  const onSubmit = methods.handleSubmit((data) => {
    if (!service) return

    const payload = match(service)
      .with({ serviceType: 'APPLICATION' }, (s) => {
        return {
          ...handleGitApplicationSubmit(data as ApplicationGeneralData, s, labelsGroups, annotationsGroups),
          serviceType: s.serviceType,
        }
      })
      .with({ serviceType: 'JOB' }, (s) => {
        return {
          ...handleJobSubmit(data as JobGeneralData, s, labelsGroups, annotationsGroups),
          serviceType: s.serviceType,
        }
      })
      .with({ serviceType: 'CONTAINER' }, (s) => {
        return {
          ...handleContainerSubmit(data as ApplicationGeneralData, s, labelsGroups, annotationsGroups),
          serviceType: s.serviceType,
        }
      })
      .with({ serviceType: 'HELM' }, (s) => {
        return {
          ...handleHelmSubmit(data as HelmGeneralData, s),
          serviceType: s.serviceType,
        }
      })
      .otherwise(() => undefined)

    if (!payload) return null

    if (data.is_public_repository) {
      payload.auto_deploy = false
    }

    editService({
      serviceId: applicationId,
      payload,
    })

    return
  })

  return (
    <FormProvider {...methods}>
      {service && (
        <PageSettingsGeneral
          service={service}
          isLoadingEditService={isLoadingEditService}
          onSubmit={onSubmit}
          organization={organization}
        />
      )}
    </FormProvider>
  )
}

export default PageSettingsGeneralFeature
