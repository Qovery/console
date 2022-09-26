import {
  ApplicationRequest,
  BuildModeEnum,
  BuildPackLanguageEnum,
  ContainerRequest,
  PortProtocolEnum,
} from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router'
import { createApplication } from '@qovery/domains/application'
import { selectAllRepository } from '@qovery/domains/organization'
import { MemorySizeEnum, ServiceTypeEnum } from '@qovery/shared/enums'
import {
  SERVICES_APPLICATION_CREATION_URL,
  SERVICES_CREATION_GENERAL_URL,
  SERVICES_CREATION_PORTS_URL,
  SERVICES_CREATION_RESOURCES_URL,
  SERVICES_URL,
} from '@qovery/shared/router'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { buildGitRepoUrl, convertCpuToVCpu } from '@qovery/shared/utils'
import { AppDispatch } from '@qovery/store/data'
import PageApplicationInstall from '../../../ui/page-application-create/page-application-install/page-application-install'
import { useApplicationContainerCreateContext } from '../page-application-create-feature'

export function PageApplicationInstallFeature() {
  const { generalData, portData, resourcesData, setCurrentStep } = useApplicationContainerCreateContext()
  const navigate = useNavigate()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_APPLICATION_CREATION_URL}`
  const [loading, setLoading] = useState(false)

  const repositories = useSelector(selectAllRepository)
  const selectRepository = repositories.find((repository) => repository.name === generalData?.repository)

  const gotoGlobalInformations = () => {
    navigate(pathCreate + SERVICES_CREATION_GENERAL_URL)
  }

  const gotoResources = () => {
    navigate(pathCreate + SERVICES_CREATION_RESOURCES_URL)
  }

  const gotoPorts = () => {
    navigate(pathCreate + SERVICES_CREATION_PORTS_URL)
  }

  useEffect(() => {
    !generalData?.name && gotoGlobalInformations()
  }, [generalData, navigate, environmentId, organizationId, projectId])

  const dispatch = useDispatch<AppDispatch>()

  const onSubmit = () => {
    if (generalData && portData && resourcesData) {
      setLoading(true)

      const currentMemory = Number(resourcesData['memory'])
      const memoryUnit = resourcesData.memory_unit

      const memory = memoryUnit === MemorySizeEnum.GB ? currentMemory * 1024 : currentMemory
      const cpu = convertCpuToVCpu(resourcesData['cpu'][0], true)

      if (generalData.serviceType === ServiceTypeEnum.APPLICATION) {
        const applicationRequest: ApplicationRequest = {
          name: generalData.name,
          ports:
            portData.ports?.map((port) => ({
              internal_port: port.application_port || 80,
              external_port: port.external_port,
              publicly_accessible: port.is_public,
              protocol: PortProtocolEnum.HTTP,
            })) || [],
          cpu: cpu,
          memory: memory,
          min_running_instances: resourcesData.instances[0],
          max_running_instances: resourcesData.instances[1],
          build_mode: generalData.build_mode as BuildModeEnum,
          git_repository: {
            url: buildGitRepoUrl(generalData.provider || '', selectRepository?.url || '') || '',
            root_path: generalData.root_path,
            branch: generalData.branch,
          },
        }

        if (generalData.build_mode === BuildModeEnum.DOCKER) {
          applicationRequest.dockerfile_path = generalData.dockerfile_path
        } else {
          applicationRequest.buildpack_language = generalData.buildpack_language as BuildPackLanguageEnum
        }

        dispatch(
          createApplication({
            environmentId: environmentId,
            data: applicationRequest,
            serviceType: ServiceTypeEnum.APPLICATION,
          })
        )
          .unwrap()
          .then(() => {
            navigate(SERVICES_URL(organizationId, projectId, environmentId))
          })
          .catch((e) => {
            console.error(e)
          })
          .finally(() => {
            setLoading(false)
          })
      } else {
        const containerRequest: ContainerRequest = {
          name: generalData.name,
          ports:
            portData.ports?.map((port) => ({
              internal_port: port.application_port || 80,
              external_port: port.external_port,
              publicly_accessible: port.is_public,
              protocol: PortProtocolEnum.HTTP,
            })) || [],
          cpu: cpu,
          memory: memory,
          min_running_instances: resourcesData.instances[0],
          max_running_instances: resourcesData.instances[1],
          tag: generalData.image_tag || '',
          image_name: generalData.image_name || '',
          arguments: generalData.cmd_arguments?.split(' ') || [],
          entrypoint: generalData.image_entry_point || '',
          registry_id: generalData.registry || '',
        }

        dispatch(
          createApplication({
            environmentId: environmentId,
            data: containerRequest,
            serviceType: ServiceTypeEnum.CONTAINER,
          })
        )
          .unwrap()
          .then(() => {
            navigate(SERVICES_URL(organizationId, projectId, environmentId))
          })
          .catch((e) => {
            console.error(e)
          })
          .finally(() => {
            setLoading(false)
          })
      }
    }
  }

  useEffect(() => {
    setCurrentStep(4)
  }, [setCurrentStep])

  return (
    <FunnelFlowBody>
      {generalData && portData && resourcesData && (
        <PageApplicationInstall
          isLoading={loading}
          onSubmit={onSubmit}
          onPrevious={gotoPorts}
          generalData={generalData}
          resourcesData={resourcesData}
          portsData={portData}
          gotoResources={gotoResources}
          gotoGlobalInformation={gotoGlobalInformations}
          gotoPorts={gotoPorts}
        />
      )}
    </FunnelFlowBody>
  )
}

export default PageApplicationInstallFeature
