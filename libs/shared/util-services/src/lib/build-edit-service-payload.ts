import {
  type ApplicationEditRequest,
  type ApplicationGitRepositoryRequest,
  type AutoscalingPolicyRequest,
  type AutoscalingPolicyResponse,
  type ContainerRequest,
  type DatabaseEditRequest,
  DatabaseModeEnum,
  type HelmRequest,
  type JobRequest,
  type ServiceStorageStorageInner,
  type TerraformRequest,
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
  type Terraform,
  type TerraformType,
} from '@qovery/domains/services/data-access'
import { isHelmGitSource, isHelmRepositorySource, isJobGitSource } from '@qovery/shared/enums'

type ApplicationEditRequestWithKeda = ApplicationEditRequest & {
  autoscaling?: string
  autoscaling_scaler_type?: string
  autoscaling_polling_interval?: number
  autoscaling_cooldown_period?: number
  scalers?: Array<{ type: string; config: string }>
  autoscaling_mode?: 'NONE' | 'HPA' | 'KEDA'
  hpa_metric_type?: 'CPU' | 'CPU_AND_MEMORY'
  hpa_cpu_average_utilization_percent?: number
  hpa_memory_average_utilization_percent?: number
}

type ContainerRequestWithKeda = ContainerRequest & {
  autoscaling?: string
  autoscaling_scaler_type?: string
  autoscaling_polling_interval?: number
  autoscaling_cooldown_period?: number
  scalers?: Array<{ type: string; config: string }>
  autoscaling_mode?: 'NONE' | 'HPA' | 'KEDA'
  hpa_metric_type?: 'CPU' | 'CPU_AND_MEMORY'
  hpa_cpu_average_utilization_percent?: number
  hpa_memory_average_utilization_percent?: number
}

type AutoscalingPolicyResponseWithFields = AutoscalingPolicyResponse & {
  polling_interval_seconds?: number
  cooldown_period_seconds?: number
  scalers: Array<{
    scaler_type: string
    enabled: boolean
    role: string
    config_json?: Record<string, unknown>
    config_yaml?: string
    trigger_authentication?: {
      name?: string
      config_yaml?: string
    }
  }>
}

type AutoscalingPolicyRequestWithFields = AutoscalingPolicyRequest & {
  polling_interval_seconds?: number
  cooldown_period_seconds?: number
  scalers: Array<{
    scaler_type: string
    enabled: boolean
    role: 'PRIMARY' | 'SAFETY'
    config_json?: Record<string, unknown>
    config_yaml?: string
    trigger_authentication?: {
      name?: string // Optional - backend auto-generates if null
      config_yaml?: string
    }
  }>
}

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

type terraformProps = {
  service: Terraform
  request?: Partial<TerraformRequest>
}

export type responseToRequestProps =
  | applicationProps
  | containerProps
  | databaseProps
  | jobProps
  | helmProps
  | terraformProps

/**
 * Converts AutoscalingPolicyResponse (from API) to AutoscalingPolicyRequest (for API requests)
 * Removes response-only fields like id, created_at, updated_at, service_id
 */
export function convertAutoscalingResponseToRequest(
  response: AutoscalingPolicyResponse | undefined
): AutoscalingPolicyRequestWithFields | undefined {
  if (!response) {
    return undefined
  }

  const responseWithFields = response as AutoscalingPolicyResponseWithFields

  const scalers = responseWithFields.scalers.map((scaler) => ({
    scaler_type: scaler.scaler_type,
    enabled: scaler.enabled,
    role: scaler.role as 'PRIMARY' | 'SAFETY',
    config_json: scaler.config_json ? (scaler.config_json as Record<string, unknown>) : undefined,
    config_yaml: scaler.config_yaml ?? undefined,
    trigger_authentication: scaler.trigger_authentication
      ? {
          name: scaler.trigger_authentication.name || '',
          config_yaml: scaler.trigger_authentication.config_yaml || '',
        }
      : undefined,
  }))

  return {
    mode: response.mode,
    polling_interval_seconds: responseWithFields.polling_interval_seconds,
    cooldown_period_seconds: responseWithFields.cooldown_period_seconds,
    scalers,
  }
}

function parseAutoscalingYaml(
  yamlString?: string,
  scalerType?: string,
  pollingInterval?: number,
  cooldownPeriod?: number
): AutoscalingPolicyRequestWithFields | undefined {
  if (!scalerType || !yamlString || yamlString.trim() === '') {
    return undefined
  }

  try {
    const scaler: AutoscalingPolicyRequestWithFields['scalers'][0] = {
      scaler_type: scalerType || 'cpu', // Default to 'cpu' if not provided
      enabled: true,
      role: 'PRIMARY',
      config_json: undefined,
      config_yaml: yamlString && yamlString.trim() !== '' ? yamlString : undefined,
    }

    const autoscalingPolicy: AutoscalingPolicyRequestWithFields = {
      mode: 'KEDA',
      polling_interval_seconds: pollingInterval ?? 30,
      cooldown_period_seconds: cooldownPeriod ?? 300,
      scalers: [scaler],
    }

    return autoscalingPolicy
  } catch (error) {
    console.error('Failed to parse KEDA autoscaling YAML:', error)

    return undefined
  }
}

function parseAutoscalingScalers(
  scalers?: Array<{
    type: string
    config: string
    trigger_authentication?: { name: string; config_yaml: string }
  }>,
  pollingInterval?: number,
  cooldownPeriod?: number
): AutoscalingPolicyRequestWithFields | undefined {
  if (!scalers || scalers.length === 0) {
    return undefined
  }

  const validScalers = scalers.filter((s) => s.type && s.type.trim() !== '' && s.config && s.config.trim() !== '')

  if (validScalers.length === 0) {
    return undefined
  }

  try {
    const parsedScalers: AutoscalingPolicyRequestWithFields['scalers'] = validScalers.map((scaler, index) => ({
      scaler_type: scaler.type,
      enabled: true,
      role: index === 0 ? 'PRIMARY' : 'SAFETY',
      config_json: undefined,
      config_yaml: scaler.config,
      trigger_authentication: scaler.trigger_authentication,
    }))

    const autoscalingPolicy: AutoscalingPolicyRequestWithFields = {
      mode: 'KEDA',
      polling_interval_seconds: pollingInterval ?? 30,
      cooldown_period_seconds: cooldownPeriod ?? 300,
      scalers: parsedScalers,
    }

    return autoscalingPolicy
  } catch (error) {
    console.error('Failed to parse KEDA autoscaling scalers:', error)
    return undefined
  }
}

export function buildEditServicePayload(
  props: applicationProps
): ApplicationEditRequest & { serviceType: ApplicationType }
export function buildEditServicePayload(props: containerProps): ContainerRequest & { serviceType: ContainerType }
export function buildEditServicePayload(props: databaseProps): DatabaseEditRequest & { serviceType: DatabaseType }
export function buildEditServicePayload(props: jobProps): JobRequest & { serviceType: JobType }
export function buildEditServicePayload(props: helmProps): HelmRequest & { serviceType: HelmType }
export function buildEditServicePayload(props: terraformProps): TerraformRequest & { serviceType: TerraformType }

export function buildEditServicePayload(props: responseToRequestProps) {
  return {
    serviceType: props.service.serviceType,
    ...match(props)
      .with({ service: { serviceType: 'APPLICATION' } }, (props) => refactoApplication(props))
      .with({ service: { serviceType: 'CONTAINER' } }, (props) => refactoContainer(props))
      .with({ service: { serviceType: 'DATABASE' } }, (props) => refactoDatabase(props))
      .with({ service: { serviceType: 'JOB' } }, (props) => refactoJob(props))
      .with({ service: { serviceType: 'HELM' } }, (props) => refactoHelm(props))
      .with({ service: { serviceType: 'TERRAFORM' } }, (props) => refactoTerraform(props))
      .exhaustive(),
  }
}

/*
TODO: all this following functions should be removed after the API refactoring and we need to clean it after the Services migration to React Query
https://www.notion.so/qovery/API-improvements-b54ba305c2ee4e549eb002278c532c7f?pvs=4#7d71ea23b5fa44ca80c15a0c32ebd8da
*/
function refactoTerraform({ service, request = {} }: terraformProps): TerraformRequest {
  return {
    ...service,
    ...request,
    description: request.description ?? service.description ?? '',
    terraform_files_source: {
      git_repository: {
        url: service.terraform_files_source?.git?.git_repository?.url ?? '',
        branch: service.terraform_files_source?.git?.git_repository?.branch ?? '',
        git_token_id: service.terraform_files_source?.git?.git_repository?.git_token_id ?? '',
        root_path: service.terraform_files_source?.git?.git_repository?.root_path ?? '',
      },
    },
    timeout_sec: Number(request.timeout_sec ?? service.timeout_sec),
    terraform_variables_source: {
      tf_vars: request.terraform_variables_source?.tf_vars ?? service.terraform_variables_source?.tf_vars ?? [],
      tf_var_file_paths:
        request.terraform_variables_source?.tf_var_file_paths ??
        service.terraform_variables_source?.tf_var_file_paths ??
        [],
    },
  }
}

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

  const convertedAutoscaling = convertAutoscalingResponseToRequest(application.autoscaling)

  let parsedAutoscaling: AutoscalingPolicyRequestWithFields | undefined = undefined

  const requestWithKeda = request as Partial<ApplicationEditRequestWithKeda>

  // Check autoscaling mode
  const autoscalingMode = requestWithKeda.autoscaling_mode

  if (autoscalingMode === 'HPA') {
    // HPA mode: no autoscaling policy needed
    // Backend detects HPA automatically when min != max and no KEDA scalers
    // HPA-specific settings will be sent via advanced settings API separately
    parsedAutoscaling = undefined
  } else if (autoscalingMode === 'KEDA') {
    // KEDA mode: use scalers
    const scalers = requestWithKeda.scalers
    const pollingInterval = requestWithKeda.autoscaling_polling_interval
    const cooldownPeriod = requestWithKeda.autoscaling_cooldown_period
    parsedAutoscaling = parseAutoscalingScalers(scalers, pollingInterval, cooldownPeriod)
  } else if (autoscalingMode === 'NONE') {
    // No autoscaling: set to undefined
    parsedAutoscaling = undefined
  }
  // Legacy format handling (backward compatibility)
  else if ('scalers' in requestWithKeda) {
    const scalers = requestWithKeda.scalers
    const pollingInterval = requestWithKeda.autoscaling_polling_interval
    const cooldownPeriod = requestWithKeda.autoscaling_cooldown_period
    parsedAutoscaling = parseAutoscalingScalers(scalers, pollingInterval, cooldownPeriod)
  } else if ('autoscaling' in requestWithKeda || 'autoscaling_scaler_type' in requestWithKeda) {
    const autoscalingString = requestWithKeda.autoscaling
    const scalerType = requestWithKeda.autoscaling_scaler_type
    const pollingInterval = requestWithKeda.autoscaling_polling_interval
    const cooldownPeriod = requestWithKeda.autoscaling_cooldown_period

    if (scalerType && autoscalingString && autoscalingString.trim() !== '') {
      parsedAutoscaling = parseAutoscalingYaml(autoscalingString, scalerType, pollingInterval, cooldownPeriod)
    } else {
      parsedAutoscaling = undefined
    }
  } else {
    parsedAutoscaling = convertedAutoscaling
  }

  const {
    autoscaling: _,
    autoscaling_scaler_type: __,
    autoscaling_polling_interval: ___,
    autoscaling_cooldown_period: ____,
    scalers: _____,
    autoscaling_mode: _autoscalingModeIgnored,
    hpa_metric_type: _hpaMetricTypeIgnored,
    hpa_cpu_average_utilization_percent: _hpaCpuAverageIgnored,
    hpa_memory_average_utilization_percent: _hpaMemoryAverageIgnored,
    ...requestWithoutAutoscaling
  } = requestWithKeda

  const applicationRequestPayload: ApplicationEditRequest = {
    name: application.name,
    icon_uri: application.icon_uri,
    storage: application.storage,
    cpu: application.cpu,
    gpu: application.gpu,
    git_repository: application.git_repository as ApplicationGitRepositoryRequest,
    build_mode: application.build_mode,
    description: application.description || undefined,
    memory: application.memory,
    auto_preview: application.auto_preview,
    auto_deploy: application.auto_deploy,
    ports: application.ports,
    dockerfile_path: application.dockerfile_path || undefined,
    docker_target_build_stage: application.docker_target_build_stage || undefined,
    healthchecks: application.healthchecks ?? {},
    max_running_instances: application.max_running_instances,
    min_running_instances: application.min_running_instances,
    entrypoint: application.entrypoint,
    arguments: application.arguments,
    autoscaling: parsedAutoscaling,
  }

  return {
    ...applicationRequestPayload,
    ...requestWithoutAutoscaling,
  }
}

function refactoContainer({ service: container, request = {} }: containerProps): ContainerRequest {
  const convertedAutoscaling = convertAutoscalingResponseToRequest(container.autoscaling)

  let parsedAutoscaling: AutoscalingPolicyRequestWithFields | undefined = undefined

  const requestWithKeda = request as Partial<ContainerRequestWithKeda>

  // Check autoscaling mode
  const autoscalingMode = requestWithKeda.autoscaling_mode

  if (autoscalingMode === 'HPA') {
    // HPA mode: no autoscaling policy needed
    // Backend detects HPA automatically when min != max and no KEDA scalers
    // HPA-specific settings will be sent via advanced settings API separately
    parsedAutoscaling = undefined
  } else if (autoscalingMode === 'KEDA') {
    // KEDA mode: use scalers
    const scalers = requestWithKeda.scalers
    const pollingInterval = requestWithKeda.autoscaling_polling_interval
    const cooldownPeriod = requestWithKeda.autoscaling_cooldown_period
    parsedAutoscaling = parseAutoscalingScalers(scalers, pollingInterval, cooldownPeriod)
  } else if (autoscalingMode === 'NONE') {
    // No autoscaling: set to undefined
    parsedAutoscaling = undefined
  }
  // Legacy format handling (backward compatibility)
  else if ('scalers' in requestWithKeda) {
    const scalers = requestWithKeda.scalers
    const pollingInterval = requestWithKeda.autoscaling_polling_interval
    const cooldownPeriod = requestWithKeda.autoscaling_cooldown_period
    parsedAutoscaling = parseAutoscalingScalers(scalers, pollingInterval, cooldownPeriod)
  } else if ('autoscaling' in requestWithKeda || 'autoscaling_scaler_type' in requestWithKeda) {
    const autoscalingString = requestWithKeda.autoscaling
    const scalerType = requestWithKeda.autoscaling_scaler_type
    const pollingInterval = requestWithKeda.autoscaling_polling_interval
    const cooldownPeriod = requestWithKeda.autoscaling_cooldown_period

    if (scalerType && autoscalingString && autoscalingString.trim() !== '') {
      parsedAutoscaling = parseAutoscalingYaml(autoscalingString, scalerType, pollingInterval, cooldownPeriod)
    } else {
      parsedAutoscaling = undefined
    }
  } else {
    parsedAutoscaling = convertedAutoscaling
  }

  const {
    autoscaling: _,
    autoscaling_scaler_type: __,
    autoscaling_polling_interval: ___,
    autoscaling_cooldown_period: ____,
    scalers: _____,
    autoscaling_mode: _autoscalingModeIgnored,
    hpa_metric_type: _hpaMetricTypeIgnored,
    hpa_cpu_average_utilization_percent: _hpaCpuAverageIgnored,
    hpa_memory_average_utilization_percent: _hpaMemoryAverageIgnored,
    ...requestWithoutAutoscaling
  } = requestWithKeda

  const containerRequestPayload: ContainerRequest = {
    name: container.name || '',
    icon_uri: container.icon_uri,
    description: container.description || '',
    storage: container.storage,
    ports: container.ports,
    cpu: container.cpu,
    gpu: container.gpu,
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
    autoscaling: parsedAutoscaling,
  }

  return {
    ...containerRequestPayload,
    ...requestWithoutAutoscaling,
  }
}

function refactoJob({ service: job, request = {} }: jobProps): JobRequest {
  const jobRequest = {
    name: job.name,
    icon_uri: job.icon_uri,
    description: job.description,
    cpu: job.cpu,
    gpu: job.gpu,
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
        docker_target_build_stage: job.source.docker?.docker_target_build_stage || undefined,
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
