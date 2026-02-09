import posthog from 'posthog-js'
import {
  APIVariableScopeEnum,
  type ApplicationRequest,
  type AutoscalingPolicyRequest,
  BuildModeEnum,
  type ContainerRequest,
  type VariableImportRequest,
} from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { P, match } from 'ts-pattern'
import { useAnnotationsGroups, useContainerRegistry, useLabelsGroups } from '@qovery/domains/organizations/feature'
import { useCreateService, useDeployService, useEditAdvancedSettings } from '@qovery/domains/services/feature'
import { useImportVariables } from '@qovery/domains/variables/feature'
import { type VariableData } from '@qovery/shared/interfaces'
import {
  SERVICES_CREATION_GENERAL_URL,
  SERVICES_CREATION_HEALTHCHECKS_URL,
  SERVICES_CREATION_PORTS_URL,
  SERVICES_CREATION_RESOURCES_URL,
  SERVICES_CREATION_VARIABLES_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { buildHpaAdvancedSettingsPayload } from '@qovery/shared/util-services'
import StepSummary from '../../../ui/page-application-create/step-summary/step-summary'
import { steps, useApplicationContainerCreateContext } from '../page-application-create-feature'

function prepareVariableImportRequest(variables: VariableData[]): VariableImportRequest | null {
  if (variables && variables.length === 0) {
    return null
  }

  return {
    overwrite: true,
    vars: variables
      .map(({ variable: name = '', scope, value = '', isSecret: is_secret }) =>
        match(scope)
          .with(P.nullish, () => undefined)
          .otherwise((scope) => ({ name, scope, value, is_secret }))
      )
      .filter((i) => !!i),
  }
}

export function StepSummaryFeature() {
  useDocumentTitle('Summary - Create Application')
  const { generalData, portData, resourcesData, setCurrentStep, variablesForm, creationFlowUrl } =
    useApplicationContainerCreateContext()
  const navigate = useNavigate()
  const { organizationId = '', projectId = '', environmentId = '', slug, option } = useParams()
  const [loadingCreate, setLoadingCreate] = useState(false)
  const [loadingCreateAndDeploy, setLoadingCreateAndDeploy] = useState(false)
  const { data: containerRegistry } = useContainerRegistry({
    organizationId,
    containerRegistryId: generalData?.registry,
  })
  const { data: annotationsGroup = [] } = useAnnotationsGroups({ organizationId })
  const { data: labelsGroup = [] } = useLabelsGroups({ organizationId })

  const { mutateAsync: createService } = useCreateService({ organizationId })
  const { mutateAsync: importVariables } = useImportVariables()
  const { mutate: deployService } = useDeployService({ organizationId, projectId, environmentId })
  const { mutateAsync: editAdvancedSettings } = useEditAdvancedSettings({
    organizationId,
    projectId,
    environmentId,
  })

  const variablesData = variablesForm.getValues().variables

  const gotoGlobalInformations = () => {
    navigate(creationFlowUrl + SERVICES_CREATION_GENERAL_URL)
  }

  const gotoResources = () => {
    navigate(creationFlowUrl + SERVICES_CREATION_RESOURCES_URL)
  }

  const gotoPorts = () => {
    navigate(creationFlowUrl + SERVICES_CREATION_PORTS_URL)
  }

  const gotoHealthchecks = () => {
    navigate(creationFlowUrl + SERVICES_CREATION_HEALTHCHECKS_URL)
  }

  const gotoVariables = () => {
    navigate(creationFlowUrl + SERVICES_CREATION_VARIABLES_URL)
  }

  const onPrevious = () => {
    navigate(creationFlowUrl + SERVICES_CREATION_VARIABLES_URL)
  }

  useEffect(() => {
    !generalData?.name && gotoGlobalInformations()
  }, [generalData, navigate, environmentId, organizationId, projectId])

  const onSubmit = async (withDeploy: boolean) => {
    if (generalData && portData && resourcesData) {
      if (withDeploy) setLoadingCreateAndDeploy(true)
      else setLoadingCreate(true)

      const memory = Number(resourcesData['memory'])
      const cpu = Number(resourcesData['cpu'])
      const gpu = Number(resourcesData['gpu'])
      const variableImportRequest = prepareVariableImportRequest(variablesData)

      // Parse KEDA autoscaling if autoscaling mode is KEDA (or legacy autoscaling_enabled for backward compatibility)
      let autoscaling: AutoscalingPolicyRequest | undefined = undefined
      if (
        (resourcesData.autoscaling_mode === 'KEDA' || resourcesData.autoscaling_enabled) &&
        resourcesData.scalers &&
        resourcesData.scalers.length > 0
      ) {
        try {
          const validScalers = resourcesData.scalers.filter(
            (s: { type: string; config: string; triggerAuthentication?: string }) =>
              s.type && s.type.trim() !== '' && s.config && s.config.trim() !== ''
          )

          if (validScalers.length > 0) {
            // Include trigger authentication directly in scaler payload
            const scalersWithAuth = validScalers.map(
              (scaler: { type: string; config: string; triggerAuthentication?: string }, index: number) => {
                const baseScaler = {
                  scaler_type: scaler.type,
                  enabled: true,
                  role: index === 0 ? 'PRIMARY' : 'SAFETY',
                  config_json: undefined,
                  config_yaml: scaler.config,
                }

                // Include trigger authentication inline if YAML is provided
                if (scaler.triggerAuthentication && scaler.triggerAuthentication.trim() !== '') {
                  return {
                    ...baseScaler,
                    trigger_authentication: {
                      config_yaml: scaler.triggerAuthentication,
                    },
                  }
                }

                return baseScaler
              }
            )

            autoscaling = {
              mode: 'KEDA',
              polling_interval_seconds: resourcesData.autoscaling_polling_interval
                ? Number(resourcesData.autoscaling_polling_interval)
                : 30,
              cooldown_period_seconds: resourcesData.autoscaling_cooldown_period
                ? Number(resourcesData.autoscaling_cooldown_period)
                : 300,
              scalers: scalersWithAuth,
            } as AutoscalingPolicyRequest
          }
        } catch (error) {
          console.error('Failed to parse KEDA autoscaling:', error)
        }
      }

      if (generalData.serviceType === 'APPLICATION') {
        const applicationRequest: ApplicationRequest = {
          name: generalData.name,
          description: generalData.description || '',
          icon_uri: generalData.icon_uri,
          ports:
            portData.ports?.map((port) => ({
              internal_port: port.application_port || 80,
              external_port: port.external_port,
              publicly_accessible: port.is_public,
              protocol: port.protocol,
              name: port.name || `p${port.application_port}`,
            })) || [],
          cpu,
          memory,
          gpu,
          min_running_instances: resourcesData.min_running_instances,
          max_running_instances: resourcesData.max_running_instances,
          build_mode: BuildModeEnum.DOCKER,
          git_repository: {
            provider: generalData.provider ?? 'GITHUB',
            url: generalData.git_repository?.url ?? '',
            root_path: generalData.root_path,
            branch: generalData.branch,
            git_token_id: generalData.git_token_id,
          },
          arguments: generalData.cmd,
          entrypoint: generalData.image_entry_point || '',
          healthchecks: portData.healthchecks?.item || {},
          auto_deploy: generalData.auto_deploy,
          annotations_groups: annotationsGroup.filter((group) => generalData.annotations_groups?.includes(group.id)),
          labels_groups: labelsGroup.filter((group) => generalData.labels_groups?.includes(group.id)),
          docker_target_build_stage: generalData.docker_target_build_stage || undefined,
          autoscaling,
        }

        applicationRequest.dockerfile_path = generalData.dockerfile_path

        try {
          const service = await createService({
            environmentId: environmentId,
            payload: {
              serviceType: 'APPLICATION',
              ...applicationRequest,
            },
          })

          if (variableImportRequest) {
            importVariables({
              serviceType: 'APPLICATION',
              serviceId: service.id,
              variableImportRequest,
            })
          }

          // Create HPA advanced settings if autoscaling mode is HPA
          if (resourcesData.autoscaling_mode === 'HPA') {
            await editAdvancedSettings({
              serviceId: service.id,
              payload: {
                serviceType: 'APPLICATION',
                ...buildHpaAdvancedSettingsPayload(resourcesData as unknown as Record<string, unknown>, {}),
              },
            })
          }

          if (withDeploy) {
            deployService({
              serviceId: service.id,
              serviceType: 'APPLICATION',
            })
            setLoadingCreateAndDeploy(false)
          }

          if (slug && option) {
            posthog.capture('create-service', {
              selectedServiceType: slug,
              selectedServiceSubType: option,
            })
          }

          setLoadingCreate(false)
          navigate(SERVICES_URL(organizationId, projectId, environmentId))
        } catch (error) {
          console.error(error)
          setLoadingCreateAndDeploy(false)
          setLoadingCreate(false)
        }
      } else {
        const containerRequest: ContainerRequest = {
          name: generalData.name,
          description: generalData.description || '',
          ports:
            portData.ports?.map((port) => ({
              internal_port: port.application_port || 80,
              external_port: port.external_port,
              publicly_accessible: port.is_public,
              protocol: port.protocol,
              name: port.name || `p${port.application_port}`,
            })) || [],
          cpu,
          memory,
          gpu,
          min_running_instances: resourcesData.min_running_instances,
          max_running_instances: resourcesData.max_running_instances,
          tag: generalData.image_tag || '',
          image_name: generalData.image_name || '',
          arguments: generalData.cmd,
          entrypoint: generalData.image_entry_point || '',
          registry_id: generalData.registry || '',
          healthchecks: portData.healthchecks?.item || {},
          auto_deploy: generalData.auto_deploy,
          annotations_groups: annotationsGroup.filter((group) => generalData.annotations_groups?.includes(group.id)),
          labels_groups: labelsGroup.filter((group) => generalData.labels_groups?.includes(group.id)),
          autoscaling,
        }

        try {
          const service = await createService({
            environmentId: environmentId,
            payload: {
              serviceType: 'CONTAINER',
              ...containerRequest,
            },
          })

          if (variableImportRequest) {
            importVariables({
              serviceType: 'CONTAINER',
              serviceId: service.id,
              variableImportRequest,
            })
          }

          // Create HPA advanced settings if autoscaling mode is HPA
          if (resourcesData.autoscaling_mode === 'HPA') {
            await editAdvancedSettings({
              serviceId: service.id,
              payload: {
                serviceType: 'CONTAINER',
                ...buildHpaAdvancedSettingsPayload(resourcesData as unknown as Record<string, unknown>, {}),
              },
            })
          }

          if (withDeploy) {
            deployService({
              serviceId: service.id,
              serviceType: 'CONTAINER',
            })
            setLoadingCreateAndDeploy(false)
          }
          setLoadingCreate(false)
          navigate(SERVICES_URL(organizationId, projectId, environmentId))
        } catch (error) {
          console.error(error)
          setLoadingCreateAndDeploy(false)
          setLoadingCreate(false)
        }
      }
    }
  }

  useEffect(() => {
    setCurrentStep(steps.length)
  }, [setCurrentStep])

  return (
    <FunnelFlowBody>
      {generalData && portData && resourcesData && (
        <StepSummary
          isLoadingCreate={loadingCreate}
          isLoadingCreateAndDeploy={loadingCreateAndDeploy}
          onSubmit={onSubmit}
          onPrevious={onPrevious}
          generalData={generalData}
          resourcesData={resourcesData}
          variablesData={variablesData}
          gotoVariables={gotoVariables}
          portsData={portData}
          gotoResources={gotoResources}
          gotoGlobalInformation={gotoGlobalInformations}
          gotoPorts={gotoPorts}
          gotoHealthchecks={gotoHealthchecks}
          selectedRegistryName={containerRegistry?.name}
          annotationsGroup={annotationsGroup}
          labelsGroup={labelsGroup}
        />
      )}
    </FunnelFlowBody>
  )
}

export default StepSummaryFeature
