import {
  type ApplicationEditRequest,
  type ApplicationGitRepositoryRequest,
  type ContainerRequest,
  type DatabaseEditRequest,
  DatabaseModeEnum,
  type HelmRequest,
  type JobRequest,
  type ServiceStorageStorageInner,
} from 'qovery-typescript-axios'
import { P, match } from 'ts-pattern'
import {
  type Application,
  type ApplicationType,
  type Container,
  type ContainerType,
  type Database,
  type DatabaseType,
  type Helm,
  type HelmType,
  type Job,
  type JobType,
} from '@qovery/domains/services/data-access'
import { isHelmGitSource, isHelmRepositorySource, isJobGitSource } from '@qovery/shared/enums'

type applicationProps = {
  service: Application
  request?: Partial<ApplicationEditRequest>
}

type containerProps = {
  service: Container
  request?: Partial<ContainerRequest>
}

type databaseProps = {
  service: Database
  request?: Partial<DatabaseEditRequest>
}

type jobProps = {
  service: Job
  request?: Partial<JobRequest>
}

type helmProps = {
  service: Helm
  request?: Partial<HelmRequest>
}

export type responseToRequestProps = applicationProps | containerProps | databaseProps | jobProps | helmProps

export function buildEditServicePayload(
  props: applicationProps
): ApplicationEditRequest & { serviceType: ApplicationType }
export function buildEditServicePayload(props: containerProps): ContainerRequest & { serviceType: ContainerType }
export function buildEditServicePayload(props: databaseProps): DatabaseEditRequest & { serviceType: DatabaseType }
export function buildEditServicePayload(props: jobProps): JobRequest & { serviceType: JobType }
export function buildEditServicePayload(props: helmProps): HelmRequest & { serviceType: HelmType }

export function buildEditServicePayload(props: responseToRequestProps) {
  return {
    serviceType: props.service.serviceType,
    ...match(props)
      .with({ service: { serviceType: 'APPLICATION' } }, (props) => refactoApplication(props))
      .with({ service: { serviceType: 'CONTAINER' } }, (props) => refactoContainer(props))
      .with({ service: { serviceType: 'DATABASE' } }, (props) => refactoDatabase(props))
      .with({ service: { serviceType: 'JOB' } }, (props) => refactoJob(props))
      .with({ service: { serviceType: 'HELM' } }, (props) => refactoHelm(props))
      .exhaustive(),
  }
}

/*
TODO: all this following functions should be removed after the API refactoring and we need to clean it after the Services migration to React Query
https://www.notion.so/qovery/API-improvements-b54ba305c2ee4e549eb002278c532c7f?pvs=4#7d71ea23b5fa44ca80c15a0c32ebd8da
*/

function refactoApplication({ service: application, request = {} }: applicationProps): ApplicationEditRequest {
  // refacto because we can't send all git data
  if (application.git_repository) {
    application.git_repository = {
      name: application.git_repository.name,
      provider: application.git_repository.provider,
      owner: application.git_repository.owner,
      url: application.git_repository.url,
      branch: application.git_repository.branch,
      root_path: application.git_repository.root_path,
      git_token_id: application.git_repository.git_token_id,
    }
  }

  // refacto to remove the id by storage
  if (application.storage) {
    application.storage =
      application.storage.length > 0
        ? application.storage.map((storage: ServiceStorageStorageInner) => ({
            mount_point: storage.mount_point,
            size: storage.size,
            type: storage.type,
            id: storage.id,
          }))
        : []
  }

  const applicationRequestPayload: ApplicationEditRequest = {
    name: application.name,
    icon_uri: application.icon_uri,
    storage: application.storage,
    cpu: application.cpu,
    git_repository: application.git_repository as ApplicationGitRepositoryRequest,
    build_mode: application.build_mode,
    description: application.description || undefined,
    memory: application.memory,
    auto_preview: application.auto_preview,
    auto_deploy: application.auto_deploy,
    ports: application.ports,
    dockerfile_path: application.dockerfile_path || undefined,
    healthchecks: application.healthchecks ?? {},
    max_running_instances: application.max_running_instances,
    min_running_instances: application.min_running_instances,
    entrypoint: application.entrypoint,
    arguments: application.arguments,
  }

  return { ...applicationRequestPayload, ...request }
}

function refactoContainer({ service: container, request = {} }: containerProps): ContainerRequest {
  const containerRequestPayload = {
    name: container.name || '',
    icon_uri: container.icon_uri,
    description: container.description || '',
    storage: container.storage,
    ports: container.ports,
    cpu: container.cpu,
    memory: container.memory,
    max_running_instances: container.max_running_instances,
    min_running_instances: container.min_running_instances,
    registry_id: container.registry_id || container.registry?.id || '',
    image_name: container.image_name || '',
    tag: container.tag || '',
    arguments: container.arguments,
    entrypoint: container.entrypoint,
    auto_preview: container.auto_preview,
    auto_deploy: container.auto_deploy,
    healthchecks: container.healthchecks,
  }

  return { ...containerRequestPayload, ...request }
}

function refactoJob({ service: job, request = {} }: jobProps): JobRequest {
  const jobRequest = {
    name: job.name,
    icon_uri: job.icon_uri,
    description: job.description,
    cpu: job.cpu,
    memory: job.memory,
    auto_preview: job.auto_preview,
    auto_deploy: job.auto_deploy,
    max_duration_seconds: job.max_duration_seconds,
    port: job.port,
    max_nb_restart: job.max_nb_restart,
    schedule: job.schedule,
    healthchecks: job.healthchecks ?? {},
    source: {},
  }

  if (isJobGitSource(job.source)) {
    jobRequest.source = {
      docker: {
        dockerfile_path: job.source.docker?.dockerfile_path,
        dockerfile_raw: job.source.docker?.dockerfile_raw,
        git_repository: {
          provider: job.source.docker?.git_repository?.provider,
          owner: job.source.docker?.git_repository?.owner,
          name: job.source.docker?.git_repository?.name,
          url: job.source.docker?.git_repository?.url || '',
          branch: job.source.docker?.git_repository?.branch,
          root_path: job.source.docker?.git_repository?.root_path,
          git_token_id: job.source.docker?.git_repository?.git_token_id,
        },
      },
    }
  } else {
    jobRequest.source = {
      image: {
        registry_id: job.source?.image?.registry_id,
        image_name: job.source?.image?.image_name,
        tag: job.source?.image?.tag,
      },
    }
  }

  return { ...jobRequest, ...request }
}

function refactoDatabase({ service: database, request = {} }: databaseProps): DatabaseEditRequest {
  const databaseRequestPayload = {
    name: database.name,
    icon_uri: database.icon_uri,
    description: database.description,
    version: database.version,
    accessibility: database.accessibility,
    cpu: database.cpu,
    memory: database.memory,
    storage: database.storage,
    instance_type: database.instance_type,
    type: database.type,
    mode: database.mode,
  }

  if (database.mode === DatabaseModeEnum.MANAGED) databaseRequestPayload.version = database.version

  return { ...databaseRequestPayload, ...request }
}

function refactoHelm({ service: helm, request = {} }: helmProps): HelmRequest {
  const source = match(helm.source)
    .with(P.when(isHelmGitSource), ({ git }) => {
      return {
        git_repository: {
          url: git?.git_repository?.url ?? '',
          branch: git?.git_repository?.branch,
          root_path: git?.git_repository?.root_path,
          git_token_id: git?.git_repository?.git_token_id,
        },
      }
    })
    .with(P.when(isHelmRepositorySource), ({ repository }) => {
      return {
        helm_repository: {
          repository: repository?.repository?.id,
          chart_name: repository?.chart_name,
          chart_version: repository?.chart_version,
        },
      }
    })
    .exhaustive()

  const helmRequestPayload: HelmRequest = {
    name: helm.name,
    icon_uri: helm.icon_uri,
    description: helm.description,
    auto_preview: helm.auto_preview,
    auto_deploy: helm.auto_deploy,
    ports: helm.ports,
    allow_cluster_wide_resources: helm.allow_cluster_wide_resources,
    arguments: helm.arguments,
    values_override: helm.values_override,
    timeout_sec: helm.timeout_sec,
    source,
  }

  return { ...helmRequestPayload, ...request }
}
