import {
  type ApplicationEditRequest,
  type ApplicationGitRepository,
  BuildModeEnum,
  type ContainerRequest,
  type DatabaseAccessibilityEnum,
  type DatabaseModeEnum,
  type DatabaseTypeEnum,
  type GitProviderEnum,
  type GitRepository,
  type GitTokenResponse,
  type HelmRequest,
  type HelmRequestAllOfSource,
  type HelmRequestAllOfSourceOneOf,
  type HelmRequestAllOfSourceOneOf1,
  type JobRequest,
  type OrganizationAnnotationsGroupResponse,
  type OrganizationLabelsGroupEnrichedResponse,
  TerraformAutoDeployConfigTerraformActionEnum,
  type TerraformRequest,
} from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import {
  type Application,
  type Container,
  type Helm,
  type Job,
  type Terraform,
} from '@qovery/domains/services/data-access'
import { type ApplicationGeneralData, type JobGeneralData } from '@qovery/shared/interfaces'
import { parseCmd } from '@qovery/shared/util-js'
import { convertAutoscalingResponseToRequest } from '@qovery/shared/util-services'

export interface HelmGeneralData
  extends Omit<HelmRequest, 'source' | 'ports' | 'values_override' | 'arguments' | 'timeout_sec'> {
  source_provider: 'HELM_REPOSITORY' | 'GIT'
  git_repository: GitRepository
  repository: string
  is_public_repository?: boolean
  provider?: keyof typeof GitProviderEnum
  git_token_id?: GitTokenResponse['id']
  branch?: string
  root_path?: string
  chart_name?: string
  chart_version?: string
  arguments: string
  timeout_sec: string | number
  labels_groups?: string[]
  annotations_groups?: string[]
}

export function buildHelmSourceFromGeneralData(data: HelmGeneralData): HelmRequestAllOfSource {
  return match(data.source_provider)
    .with('GIT', (): HelmRequestAllOfSourceOneOf => {
      return {
        git_repository: {
          url: match(data.is_public_repository)
            .with(true, () => data.repository ?? '')
            .with(false, undefined, () => data.git_repository?.url ?? '')
            .exhaustive(),
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
}

export interface TerraformGeneralData extends Omit<TerraformRequest, 'auto_deploy_config'> {
  auto_deploy?: boolean
  terraform_action?: TerraformAutoDeployConfigTerraformActionEnum
  source_provider?: 'GIT'
  repository?: string
  git_repository?: ApplicationGitRepository
  is_public_repository?: boolean
  provider?: keyof typeof GitProviderEnum
  git_token_id?: GitTokenResponse['id']
  branch?: string
  root_path?: string
  chart_name?: string
  chart_version?: string
  arguments?: string
  timeout_sec?: number
}

export interface DatabaseGeneralData {
  name: string
  description?: string
  icon_uri?: string
  type: DatabaseTypeEnum
  mode: DatabaseModeEnum
  version: string
  accessibility: DatabaseAccessibilityEnum
  labels_groups?: string[]
  annotations_groups?: string[]
}

export const handleGitApplicationSubmit = (
  data: ApplicationGeneralData,
  application: Application,
  labelsGroups: OrganizationLabelsGroupEnrichedResponse[],
  annotationsGroups: OrganizationAnnotationsGroupResponse[]
): ApplicationEditRequest => {
  let cloneApplication: ApplicationEditRequest = {
    ...application,
    dockerfile_path: undefined,
    docker_target_build_stage: undefined,
    git_repository: undefined,
    name: data.name,
    description: data.description || '',
    icon_uri: data.icon_uri,
    auto_deploy: data.auto_deploy,
    autoscaling: convertAutoscalingResponseToRequest(application.autoscaling),
  }
  cloneApplication.auto_deploy = data.auto_deploy

  if ('build_mode' in cloneApplication) {
    cloneApplication.build_mode = data.build_mode

    if (data.build_mode === BuildModeEnum.DOCKER) {
      cloneApplication.dockerfile_path = data.dockerfile_path
      cloneApplication.docker_target_build_stage = data.docker_target_build_stage || undefined
    } else {
      cloneApplication.dockerfile_path = undefined
      cloneApplication.docker_target_build_stage = undefined
    }

    cloneApplication.git_repository = {
      provider: data.provider ?? 'GITHUB',
      url: match(data.is_public_repository)
        .with(true, () => data.repository ?? '')
        .with(false, undefined, () => data.git_repository?.url || application.git_repository?.url || '')
        .exhaustive(),
      branch: data.branch,
      root_path: data.root_path,
      git_token_id: data.git_token_id,
    }
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
    autoscaling: convertAutoscalingResponseToRequest(container.autoscaling),
  }
}

export const handleJobSubmit = (
  data: JobGeneralData,
  job: Job,
  labelsGroups: OrganizationLabelsGroupEnrichedResponse[],
  annotationsGroups: OrganizationAnnotationsGroupResponse[]
): JobRequest => {
  const schedule = match(job)
    .with({ job_type: 'CRON' }, (cronJob): JobRequest['schedule'] => {
      const { cronjob } = cronJob.schedule
      return {
        cronjob: {
          ...cronjob,
          entrypoint: data.image_entry_point,
          arguments: data.cmd_arguments?.length ? parseCmd(data.cmd_arguments) : [],
        },
      }
    })
    .with({ job_type: 'LIFECYCLE' }, (lifecycleJob) => lifecycleJob.schedule)
    .exhaustive()

  if ('docker' in job.source) {
    const git_repository = {
      provider: data.provider ?? 'GITHUB',
      url: match(data.is_public_repository)
        .with(true, () => data.repository ?? '')
        .with(false, undefined, () => data.git_repository?.url ?? '')
        .exhaustive(),
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
      annotations_groups: annotationsGroups.filter((group) => data.annotations_groups?.includes(group.id)),
      labels_groups: labelsGroups.filter((group) => data.labels_groups?.includes(group.id)),
      source: {
        docker: {
          git_repository,
          // Cron jobs expose docker fields in General settings while lifecycle jobs keep them in Dockerfile settings.
          dockerfile_path: data.dockerfile_path ?? job.source.docker.dockerfile_path,
          docker_target_build_stage:
            (data.docker_target_build_stage ?? job.source.docker.docker_target_build_stage) || undefined,
          dockerfile_raw: job.source.docker.dockerfile_raw,
        },
      },
      schedule,
    }
  }

  return {
    ...job,
    name: data.name,
    description: data.description,
    icon_uri: data.icon_uri,
    auto_deploy: data.auto_deploy,
    annotations_groups: annotationsGroups.filter((group) => data.annotations_groups?.includes(group.id)),
    labels_groups: labelsGroups.filter((group) => data.labels_groups?.includes(group.id)),
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

export const handleHelmSubmit = (data: HelmGeneralData, helm: Helm): HelmRequest => {
  const source = buildHelmSourceFromGeneralData(data)

  const timeoutSec = Number.parseInt(String(data.timeout_sec), 10)

  return {
    ...helm,
    name: data.name,
    description: data.description,
    icon_uri: data.icon_uri,
    source,
    allow_cluster_wide_resources: data.allow_cluster_wide_resources,
    arguments: parseCmd(data.arguments),
    timeout_sec: Number.isNaN(timeoutSec) ? 0 : timeoutSec,
    auto_deploy: data.auto_deploy ?? false,
  }
}

export const handleTerraformSubmit = (data: TerraformGeneralData, terraform: Terraform): TerraformRequest => ({
  ...terraform,
  name: data.name,
  description: data.description,
  auto_deploy_config: {
    auto_deploy: data.auto_deploy ?? false,
    terraform_action: data.terraform_action ?? TerraformAutoDeployConfigTerraformActionEnum.DEFAULT,
  },
  terraform_files_source: {
    git_repository: {
      url: match(data.is_public_repository)
        .with(true, () => data.repository ?? '')
        .with(
          false,
          undefined,
          () => data.git_repository?.url ?? terraform.terraform_files_source?.git?.git_repository?.url ?? ''
        )
        .exhaustive(),
      branch: data.branch ?? terraform.terraform_files_source?.git?.git_repository?.branch ?? '',
      git_token_id: data.git_token_id ?? terraform.terraform_files_source?.git?.git_repository?.git_token_id ?? '',
      root_path: data.root_path ?? terraform.terraform_files_source?.git?.git_repository?.root_path ?? '',
    },
  },
  terraform_variables_source: {
    ...terraform.terraform_variables_source,
    tf_vars: [],
  },
})
