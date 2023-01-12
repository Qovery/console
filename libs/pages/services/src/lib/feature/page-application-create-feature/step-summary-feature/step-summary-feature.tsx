import {
  ApplicationRequest,
  BuildModeEnum,
  BuildPackLanguageEnum,
  ContainerRequest,
  PortProtocolEnum,
} from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { createApplication, postApplicationActionsDeploy } from '@qovery/domains/application'
import { selectAllRepository, selectOrganizationById } from '@qovery/domains/organization'
import { ServiceTypeEnum, isApplication } from '@qovery/shared/enums'
import { OrganizationEntity } from '@qovery/shared/interfaces'
import {
  SERVICES_APPLICATION_CREATION_URL,
  SERVICES_CREATION_GENERAL_URL,
  SERVICES_CREATION_PORTS_URL,
  SERVICES_CREATION_RESOURCES_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { buildGitRepoUrl, convertCpuToVCpu, useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import StepSummary from '../../../ui/page-application-create/step-summary/step-summary'
import { useApplicationContainerCreateContext } from '../page-application-create-feature'

export function StepSummaryFeature() {
  useDocumentTitle('Summary - Create Application')
  const { generalData, portData, resourcesData, setCurrentStep } = useApplicationContainerCreateContext()
  const navigate = useNavigate()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_APPLICATION_CREATION_URL}`
  const [loadingCreate, setLoadingCreate] = useState(false)
  const [loadingCreateAndDeploy, setLoadingCreateAndDeploy] = useState(false)
  const organization = useSelector<RootState, OrganizationEntity | undefined>((state) =>
    selectOrganizationById(state, organizationId)
  )

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

  const onSubmit = (withDeploy: boolean) => {
    if (generalData && portData && resourcesData) {
      if (withDeploy) setLoadingCreateAndDeploy(true)
      else setLoadingCreate(true)

      const memory = Number(resourcesData['memory'])
      const cpu = convertCpuToVCpu(resourcesData['cpu'][0], true)

      if (isApplication(generalData.serviceType)) {
        const applicationRequest: ApplicationRequest = {
          name: generalData.name,
          description: generalData.description || '',
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
          .then((app) => {
            if (withDeploy) {
              dispatch(
                postApplicationActionsDeploy({
                  environmentId,
                  applicationId: app.id,
                  serviceType: ServiceTypeEnum.APPLICATION,
                })
              )
            }
            navigate(SERVICES_URL(organizationId, projectId, environmentId))
          })
          .catch((e) => console.error(e))
          .finally(() => {
            if (withDeploy) setLoadingCreateAndDeploy(false)
            else setLoadingCreate(false)
          })
      } else {
        const containerRequest: ContainerRequest = {
          name: generalData.name,
          description: generalData.description || '',
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
          arguments: generalData.cmd,
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
          .then((app) => {
            if (withDeploy) {
              dispatch(
                postApplicationActionsDeploy({
                  environmentId,
                  applicationId: app.id,
                  serviceType: ServiceTypeEnum.CONTAINER,
                })
              )
            }
            navigate(SERVICES_URL(organizationId, projectId, environmentId))
          })
          .catch((e) => console.error(e))
          .finally(() => {
            if (withDeploy) setLoadingCreateAndDeploy(false)
            else setLoadingCreate(false)
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
        <StepSummary
          isLoadingCreate={loadingCreate}
          isLoadingCreateAndDeploy={loadingCreateAndDeploy}
          onSubmit={onSubmit}
          onPrevious={gotoPorts}
          generalData={generalData}
          resourcesData={resourcesData}
          portsData={portData}
          gotoResources={gotoResources}
          gotoGlobalInformation={gotoGlobalInformations}
          gotoPorts={gotoPorts}
          selectedRegistryName={
            organization?.containerRegistries?.items?.find((registry) => registry.id === generalData.registry)?.name
          }
        />
      )}
    </FunnelFlowBody>
  )
}

export default StepSummaryFeature
