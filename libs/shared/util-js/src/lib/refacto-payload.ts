import {
  type ApplicationEditRequest,
  type ApplicationGitRepositoryRequest,
  CloudProviderEnum,
  type Cluster,
  type ClusterRequest,
  type DatabaseEditRequest,
  DatabaseModeEnum,
  type JobRequest,
  type Organization,
  type OrganizationCustomRole,
  type OrganizationCustomRoleUpdateRequest,
  type OrganizationEditRequest,
  type ServiceStorageStorageInner,
} from 'qovery-typescript-axios'
import { isJobGitSource } from '@qovery/shared/enums'
import {
  type ContainerApplicationEntity,
  type DatabaseEntity,
  type GitApplicationEntity,
  type JobApplicationEntity,
} from '@qovery/shared/interfaces'

export function refactoPayload<T extends { id?: string; created_at?: string; updated_at?: string }>(
  response: T
): Omit<T, 'id' | 'created_at' | 'updated_at'> {
  delete response['id']
  delete response['created_at']
  delete response['updated_at']

  return response
}

/*
 * @deprecated Redux refacto payload, you can use refactoApplication with React Query now
 */
export function refactoGitApplicationPayload(application: Partial<GitApplicationEntity>) {
  // refacto because we can't send all git data
  if (application.git_repository) {
    application.git_repository = {
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
    buildpack_language: application.buildpack_language,
    max_running_instances: application.max_running_instances,
    min_running_instances: application.min_running_instances,
    entrypoint: application.entrypoint,
    arguments: application.arguments,
  }

  return applicationRequestPayload
}

/*
 * @deprecated Redux refacto payload, you can use refactoContainer with React Query now
 */
export function refactoContainerApplicationPayload(application: Partial<ContainerApplicationEntity>) {
  // todo type with the ContainerEditRequest interface but for now api doc is not updated, does not take auto_preview into account
  const containerRequestPayload = {
    name: application.name || '',
    description: application.description || '',
    storage: application.storage,
    ports: application.ports,
    cpu: application.cpu,
    memory: application.memory,
    max_running_instances: application.max_running_instances,
    min_running_instances: application.min_running_instances,
    registry_id: application.registry?.id || '',
    image_name: application.image_name || '',
    tag: application.tag || '',
    arguments: application.arguments,
    entrypoint: application.entrypoint,
    auto_preview: application.auto_preview,
    auto_deploy: application.auto_deploy,
    healthchecks: application.healthchecks,
  }

  return containerRequestPayload
}

/*
 * @deprecated Redux refacto payload, you can use refactoJob with React Query now
 */
export function refactoJobPayload(job: Partial<JobApplicationEntity>): JobRequest {
  const jobRequest: JobRequest = {
    name: job.name || '',
    description: job.description || '',
    cpu: job.cpu,
    memory: job.memory,
    auto_preview: job.auto_preview,
    auto_deploy: job.auto_deploy,
    max_duration_seconds: job.max_duration_seconds,
    port: job.port,
    max_nb_restart: job.max_nb_restart,
    healthchecks: job.healthchecks ?? {},
  }

  if (isJobGitSource(job.source)) {
    jobRequest.source = {
      docker: {
        dockerfile_path: job.source.docker?.dockerfile_path,
        git_repository: {
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

  jobRequest.schedule = job.schedule

  return jobRequest
}

/*
 * @deprecated Redux refacto payload, you can use refactoDatabase with React Query now
 */
export function refactoDatabasePayload(database: Partial<DatabaseEntity>) {
  const databaseRequestPayload: DatabaseEditRequest = {
    name: database.name,
    description: database.description || '',
    version: database.version,
    accessibility: database.accessibility,
    cpu: database.cpu,
    memory: database.memory,
    storage: database.storage,
    instance_type: database.instance_type,
  }

  if (database.mode === DatabaseModeEnum.MANAGED) databaseRequestPayload.version = database.version

  return databaseRequestPayload
}

export function refactoOrganizationPayload(organization: Partial<Organization>) {
  const organizationRequestPayload: OrganizationEditRequest = {
    name: organization.name || '',
    description: organization.description || '',
    logo_url: organization.logo_url || null,
    website_url: organization.website_url,
    admin_emails: organization.admin_emails,
  }

  return organizationRequestPayload
}

export function refactoOrganizationCustomRolePayload(customRole: Partial<OrganizationCustomRole>) {
  const customRoleRequestPayload: OrganizationCustomRoleUpdateRequest = {
    name: customRole.name || '',
    description: customRole.description,
    cluster_permissions:
      customRole.cluster_permissions?.map((cluster) => ({
        cluster_id: cluster.cluster_id,
        permission: cluster.permission,
      })) || [],
    project_permissions:
      customRole.project_permissions?.map((project) => ({
        project_id: project.project_id,
        is_admin: project.is_admin,
        permissions: project.permissions,
      })) || [],
  }

  return customRoleRequestPayload
}

export function refactoClusterPayload(cluster: Partial<Cluster>) {
  const clusterRequestPayload: ClusterRequest = {
    name: cluster.name || '',
    description: cluster.description,
    region: cluster.region || '',
    cloud_provider: cluster.cloud_provider || CloudProviderEnum.AWS,
    production: cluster.production,
    disk_size: cluster.disk_size,
    instance_type: cluster.instance_type,
    max_running_nodes: cluster.max_running_nodes,
    min_running_nodes: cluster.min_running_nodes,
    ssh_keys: cluster.ssh_keys,
  }

  return clusterRequestPayload
}
