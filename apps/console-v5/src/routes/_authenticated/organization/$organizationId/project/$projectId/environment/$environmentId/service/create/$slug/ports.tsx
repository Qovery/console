import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  type ApplicationRequest,
  type AutoscalingPolicyRequest,
  BuildModeEnum,
  type ContainerRequest,
} from 'qovery-typescript-axios'
import { Suspense } from 'react'
import { match } from 'ts-pattern'
import { useAnnotationsGroups, useLabelsGroups } from '@qovery/domains/organizations/feature'
import {
  ApplicationContainerStepPort,
  type ApplicationContainerStepPortSubmitData,
  useCreateService,
  useEditAdvancedSettings,
} from '@qovery/domains/services/feature'
import { applicationContainerCreateParamsSchema } from '@qovery/shared/router'
import { LoaderSpinner } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { buildHpaAdvancedSettingsPayload } from '@qovery/shared/util-services'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/$slug/ports'
)({
  component: Ports,
  validateSearch: applicationContainerCreateParamsSchema,
})

function buildAutoscalingPolicy(resourcesData: ApplicationContainerStepPortSubmitData['resourcesData']) {
  let autoscaling: AutoscalingPolicyRequest | undefined = undefined

  const isKedaMode = resourcesData.autoscaling_mode === 'KEDA' || resourcesData.autoscaling_enabled

  if (!isKedaMode || !resourcesData.scalers || resourcesData.scalers.length === 0) {
    return autoscaling
  }

  const validScalers = resourcesData.scalers.filter((scaler) => scaler.type?.trim() && scaler.config?.trim())

  if (!validScalers.length) {
    return autoscaling
  }

  autoscaling = {
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

  return autoscaling
}

function Ports() {
  const { organizationId = '', projectId = '', environmentId = '', slug } = Route.useParams()
  const search = Route.useSearch()
  const navigate = useNavigate()

  const { data: annotationsGroup = [] } = useAnnotationsGroups({ organizationId })
  const { data: labelsGroup = [] } = useLabelsGroups({ organizationId })

  const { mutateAsync: createService, isLoading: isLoadingCreate } = useCreateService({ organizationId })
  const { mutateAsync: editAdvancedSettings } = useEditAdvancedSettings({ organizationId, projectId, environmentId })

  const creationFlowUrl = `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/service/create/${slug}`

  useDocumentTitle('Ports - Create Service')

  const handleBack = () => {
    navigate({ to: `${creationFlowUrl}/resources`, search })
  }

  const handleSubmit = async ({ generalData, resourcesData, portData }: ApplicationContainerStepPortSubmitData) => {
    const ports =
      portData.ports?.map((port) => ({
        internal_port: port.application_port || 80,
        external_port: port.external_port,
        publicly_accessible: port.is_public,
        protocol: port.protocol,
        name: port.name || `p${port.application_port}`,
      })) || []

    const payloadBase = {
      name: generalData.name,
      description: generalData.description || '',
      cpu: Number(resourcesData.cpu),
      memory: Number(resourcesData.memory),
      gpu: Number(resourcesData.gpu),
      min_running_instances: resourcesData.min_running_instances,
      max_running_instances: resourcesData.max_running_instances,
      ports,
      healthchecks: portData.healthchecks?.item || {},
      auto_deploy: generalData.auto_deploy,
      labels_groups: labelsGroup.filter((group) => generalData.labels_groups?.includes(group.id)),
      annotations_groups: annotationsGroup.filter((group) => generalData.annotations_groups?.includes(group.id)),
      autoscaling: buildAutoscalingPolicy(resourcesData),
    }

    try {
      const service = await match(generalData.serviceType)
        .with('APPLICATION', async () => {
          const applicationPayload: ApplicationRequest = {
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
          }

          const createdService = await createService({
            environmentId,
            payload: {
              serviceType: 'APPLICATION',
              ...applicationPayload,
            },
          })

          if (resourcesData.autoscaling_mode === 'HPA') {
            await editAdvancedSettings({
              serviceId: createdService.id,
              payload: {
                serviceType: 'APPLICATION',
                ...buildHpaAdvancedSettingsPayload(resourcesData as unknown as Record<string, unknown>, {}),
              },
            })
          }

          return createdService
        })
        .with('CONTAINER', async () => {
          const containerPayload: ContainerRequest = {
            ...payloadBase,
            icon_uri: generalData.icon_uri,
            tag: generalData.image_tag || '',
            image_name: generalData.image_name || '',
            arguments: generalData.cmd,
            entrypoint: generalData.image_entry_point || '',
            registry_id: generalData.registry || '',
          }

          const createdService = await createService({
            environmentId,
            payload: {
              serviceType: 'CONTAINER',
              ...containerPayload,
            },
          })

          if (resourcesData.autoscaling_mode === 'HPA') {
            await editAdvancedSettings({
              serviceId: createdService.id,
              payload: {
                serviceType: 'CONTAINER',
                ...buildHpaAdvancedSettingsPayload(resourcesData as unknown as Record<string, unknown>, {}),
              },
            })
          }

          return createdService
        })
        .otherwise(() => Promise.resolve(undefined))

      if (!service?.id) {
        return
      }

      navigate({
        to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId',
        params: {
          organizationId,
          projectId,
          environmentId,
          serviceId: service.id,
        },
      })
    } catch {
      // handled by mutation notifications
    }
  }

  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center py-8">
          <LoaderSpinner />
        </div>
      }
    >
      <ApplicationContainerStepPort onBack={handleBack} onSubmit={handleSubmit} loading={isLoadingCreate} />
    </Suspense>
  )
}
