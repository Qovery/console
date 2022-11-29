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
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { OrganizationEntity } from '@qovery/shared/interfaces'
import {
  SERVICES_JOB_CREATION_GENERAL_URL,
  SERVICES_JOB_CREATION_PORT_URL,
  SERVICES_JOB_CREATION_RESOURCES_URL,
  SERVICES_JOB_CREATION_VARIABLE_URL,
  SERVICES_URL,
} from '@qovery/shared/router'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { buildGitRepoUrl, convertCpuToVCpu, useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import Post from '../../../ui/page-job-create/post/post'
import { useJobContainerCreateContext } from '../page-job-create-feature'

export function PostFeature() {
  useDocumentTitle('Summary - Create Application')
  const { generalData, portData, resourcesData, setCurrentStep, jobURL, variableData } = useJobContainerCreateContext()
  const navigate = useNavigate()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${jobURL}`
  const [loadingCreate, setLoadingCreate] = useState(false)
  const [loadingCreateAndDeploy, setLoadingCreateAndDeploy] = useState(false)
  const organization = useSelector<RootState, OrganizationEntity | undefined>((state) =>
    selectOrganizationById(state, organizationId)
  )

  const repositories = useSelector(selectAllRepository)
  const selectRepository = repositories.find((repository) => repository.name === generalData?.repository)

  console.log(generalData, portData, resourcesData, variableData)

  const gotoGlobalInformations = () => {
    navigate(pathCreate + SERVICES_JOB_CREATION_GENERAL_URL)
  }

  const gotoResources = () => {
    navigate(pathCreate + SERVICES_JOB_CREATION_RESOURCES_URL)
  }

  const gotoPorts = () => {
    navigate(pathCreate + SERVICES_JOB_CREATION_PORT_URL)
  }

  const gotoVariable = () => {
    navigate(pathCreate + SERVICES_JOB_CREATION_VARIABLE_URL)
  }

  useEffect(() => {
    return
    !generalData?.name && gotoGlobalInformations()
  }, [generalData, navigate, environmentId, organizationId, projectId])

  const dispatch = useDispatch<AppDispatch>()

  const onSubmit = (withDeploy: boolean) => {
    if (generalData && portData && resourcesData && variableData) {
      if (withDeploy) setLoadingCreateAndDeploy(true)
      else setLoadingCreate(true)

      const memory = Number(resourcesData['memory'])
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
          ports:
            portData.ports?.map((port) => ({
              internal_port: port.application_port || 80,
              external_port: port.external_port,
              publicly_accessible: port.is_public,
              protocol: PortProtocolEnum.HTTP,
            })) || [],
          cpu: cpu,
          memory: memory,
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
    setCurrentStep(5)
  }, [setCurrentStep])

  return (
    <FunnelFlowBody>
      {generalData && portData && resourcesData && variableData && (
        <Post
          isLoadingCreate={loadingCreate}
          isLoadingCreateAndDeploy={loadingCreateAndDeploy}
          onSubmit={onSubmit}
          onPrevious={gotoPorts}
          generalData={generalData}
          resourcesData={resourcesData}
          portsData={portData}
          gotoResources={gotoResources}
          gotoVariables={gotoVariable}
          gotoGlobalInformation={gotoGlobalInformations}
          gotoPorts={gotoPorts}
          variableData={variableData}
          selectedRegistryName={
            organization?.containerRegistries?.items?.find((registry) => registry.id === generalData.registry)?.name
          }
        />
      )}
    </FunnelFlowBody>
  )
}

export default PostFeature
