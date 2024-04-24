import {
  type ApplicationRequest,
  BuildModeEnum,
  type BuildPackLanguageEnum,
  type ContainerRequest,
} from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAnnotationsGroups, useContainerRegistry } from '@qovery/domains/organizations/feature'
import { useCreateService, useDeployService } from '@qovery/domains/services/feature'
import {
  SERVICES_APPLICATION_CREATION_URL,
  SERVICES_CREATION_GENERAL_URL,
  SERVICES_CREATION_HEALTHCHECKS_URL,
  SERVICES_CREATION_PORTS_URL,
  SERVICES_CREATION_RESOURCES_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { buildGitRepoUrl } from '@qovery/shared/util-js'
import StepSummary from '../../../ui/page-application-create/step-summary/step-summary'
import { steps, useApplicationContainerCreateContext } from '../page-application-create-feature'

export function StepSummaryFeature() {
  useDocumentTitle('Summary - Create Application')
  const { generalData, portData, resourcesData, setCurrentStep } = useApplicationContainerCreateContext()
  const navigate = useNavigate()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_APPLICATION_CREATION_URL}`
  const [loadingCreate, setLoadingCreate] = useState(false)
  const [loadingCreateAndDeploy, setLoadingCreateAndDeploy] = useState(false)
  const { data: containerRegistry } = useContainerRegistry({
    organizationId,
    containerRegistryId: generalData?.registry,
  })
  const { data: annotationsGroup = [] } = useAnnotationsGroups({ organizationId })

  const { mutateAsync: createService } = useCreateService()
  const { mutate: deployService } = useDeployService({ environmentId })

  const gotoGlobalInformations = () => {
    navigate(pathCreate + SERVICES_CREATION_GENERAL_URL)
  }

  const gotoResources = () => {
    navigate(pathCreate + SERVICES_CREATION_RESOURCES_URL)
  }

  const gotoPorts = () => {
    navigate(pathCreate + SERVICES_CREATION_PORTS_URL)
  }

  const gotoHealthchecks = () => {
    navigate(pathCreate + SERVICES_CREATION_HEALTHCHECKS_URL)
  }

  const onPrevious = () => {
    if (portData?.ports && portData?.ports.length > 0) {
      navigate(pathCreate + SERVICES_CREATION_HEALTHCHECKS_URL)
    } else {
      gotoPorts()
    }
  }

  useEffect(() => {
    !generalData?.name && gotoGlobalInformations()
  }, [generalData, navigate, environmentId, organizationId, projectId])

  const onSubmit = async (withDeploy: boolean) => {
    if (generalData && portData && resourcesData) {
      if (withDeploy) setLoadingCreateAndDeploy(true)
      else setLoadingCreate(true)

      const memory = Number(resourcesData['memory'])
      const cpu = resourcesData['cpu']

      if (generalData.serviceType === 'APPLICATION') {
        const applicationRequest: ApplicationRequest = {
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
          cpu: cpu,
          memory: memory,
          min_running_instances: resourcesData.min_running_instances,
          max_running_instances: resourcesData.max_running_instances,
          build_mode: generalData.build_mode as BuildModeEnum,
          git_repository: {
            url: buildGitRepoUrl(generalData.provider ?? '', generalData.repository || ''),
            root_path: generalData.root_path,
            branch: generalData.branch,
            git_token_id: generalData.git_token_id,
          },
          arguments: generalData.cmd,
          entrypoint: generalData.image_entry_point || '',
          healthchecks: portData.healthchecks?.item || {},
          auto_deploy: generalData.auto_deploy,
          annotations_groups: annotationsGroup.filter((group) => generalData.annotations_groups?.includes(group.id)),
        }

        if (generalData.build_mode === BuildModeEnum.DOCKER) {
          applicationRequest.dockerfile_path = generalData.dockerfile_path
        } else {
          applicationRequest.buildpack_language = generalData.buildpack_language as BuildPackLanguageEnum
        }

        try {
          const service = await createService({
            environmentId: environmentId,
            payload: {
              serviceType: 'APPLICATION',
              ...applicationRequest,
            },
          })

          if (withDeploy) {
            deployService({
              serviceId: service.id,
              serviceType: 'APPLICATION',
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
          cpu: cpu,
          memory: memory,
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
        }

        try {
          const service = await createService({
            environmentId: environmentId,
            payload: {
              serviceType: 'CONTAINER',
              ...containerRequest,
            },
          })

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
          portsData={portData}
          gotoResources={gotoResources}
          gotoGlobalInformation={gotoGlobalInformations}
          gotoPorts={gotoPorts}
          gotoHealthchecks={gotoHealthchecks}
          selectedRegistryName={containerRegistry?.name}
          annotationsGroup={annotationsGroup}
        />
      )}
    </FunnelFlowBody>
  )
}

export default StepSummaryFeature
