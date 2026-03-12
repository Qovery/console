import {
  type ApplicationRequest,
  type AutoscalingPolicyRequest,
  BuildModeEnum,
  type ContainerRequest,
  type OrganizationAnnotationsGroupResponse,
  type OrganizationLabelsGroupEnrichedResponse,
} from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import {
  type ApplicationGeneralData,
  type ApplicationResourcesData,
  type FlowPortData,
} from '@qovery/shared/interfaces'

export type ApplicationContainerCreatePayload =
  | { serviceType: 'APPLICATION'; payload: ApplicationRequest }
  | { serviceType: 'CONTAINER'; payload: ContainerRequest }

export interface BuildApplicationContainerCreatePayloadProps {
  generalData: ApplicationGeneralData
  resourcesData: ApplicationResourcesData
  portData: FlowPortData
  labelsGroup: OrganizationLabelsGroupEnrichedResponse[]
  annotationsGroup: OrganizationAnnotationsGroupResponse[]
}

export function buildAutoscalingPolicy(resourcesData: ApplicationResourcesData): AutoscalingPolicyRequest | undefined {
  const isKedaMode = resourcesData.autoscaling_mode === 'KEDA' || resourcesData.autoscaling_enabled

  if (!isKedaMode || !resourcesData.scalers || resourcesData.scalers.length === 0) {
    return undefined
  }

  const validScalers = resourcesData.scalers.filter((scaler) => scaler.type?.trim() && scaler.config?.trim())

  if (!validScalers.length) {
    return undefined
  }

  return {
    mode: 'KEDA',
    polling_interval_seconds: resourcesData.autoscaling_polling_interval
      ? Number(resourcesData.autoscaling_polling_interval)
      : 30,
    cooldown_period_seconds: resourcesData.autoscaling_cooldown_period
      ? Number(resourcesData.autoscaling_cooldown_period)
      : 300,
    scalers: validScalers.map((scaler, index) => {
      const baseScaler = {
        scaler_type: scaler.type,
        enabled: true,
        role: index === 0 ? 'PRIMARY' : 'SAFETY',
        config_json: undefined,
        config_yaml: scaler.config,
      }

      if (scaler.triggerAuthentication?.trim()) {
        return {
          ...baseScaler,
          trigger_authentication: {
            config_yaml: scaler.triggerAuthentication,
          },
        }
      }

      return baseScaler
    }),
  } as AutoscalingPolicyRequest
}

function buildPorts(portData: FlowPortData) {
  return (
    portData.ports?.map((port) => ({
      internal_port: port.application_port || 80,
      external_port: port.external_port,
      publicly_accessible: port.is_public,
      protocol: port.protocol,
      name: port.name || `p${port.application_port}`,
      public_domain: undefined,
      public_path: port.public_path,
      public_path_rewrite: port.public_path_rewrite,
    })) || []
  )
}

export function buildApplicationContainerCreatePayload({
  generalData,
  resourcesData,
  portData,
  labelsGroup,
  annotationsGroup,
}: BuildApplicationContainerCreatePayloadProps): ApplicationContainerCreatePayload {
  const payloadBase = {
    name: generalData.name,
    description: generalData.description || '',
    cpu: Number(resourcesData.cpu),
    memory: Number(resourcesData.memory),
    gpu: Number(resourcesData.gpu),
    min_running_instances: resourcesData.min_running_instances,
    max_running_instances: resourcesData.max_running_instances,
    ports: buildPorts(portData),
    healthchecks: portData.healthchecks?.item || {},
    auto_deploy: generalData.auto_deploy,
    labels_groups: labelsGroup.filter((group) => generalData.labels_groups?.includes(group.id)),
    annotations_groups: annotationsGroup.filter((group) => generalData.annotations_groups?.includes(group.id)),
    autoscaling: buildAutoscalingPolicy(resourcesData),
  }

  return match(generalData.serviceType)
    .with('APPLICATION', () => ({
      serviceType: 'APPLICATION' as const,
      payload: {
        ...payloadBase,
        icon_uri: generalData.icon_uri,
        build_mode: BuildModeEnum.DOCKER,
        git_repository: {
          provider: generalData.provider ?? 'GITHUB',
          url: generalData.git_repository?.url ?? generalData.repository ?? '',
          root_path: generalData.root_path,
          branch: generalData.branch,
          git_token_id: generalData.git_token_id,
        },
        arguments: generalData.cmd,
        entrypoint: generalData.image_entry_point || '',
        dockerfile_path: generalData.dockerfile_path,
        docker_target_build_stage: generalData.docker_target_build_stage || undefined,
      },
    }))
    .otherwise(() => ({
      serviceType: 'CONTAINER' as const,
      payload: {
        ...payloadBase,
        icon_uri: generalData.icon_uri,
        tag: generalData.image_tag || '',
        image_name: generalData.image_name || '',
        arguments: generalData.cmd,
        entrypoint: generalData.image_entry_point || '',
        registry_id: generalData.registry || '',
      },
    }))
}
