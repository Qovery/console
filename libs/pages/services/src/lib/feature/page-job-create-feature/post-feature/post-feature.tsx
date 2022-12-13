import { APIVariableScopeEnum, JobRequest, JobScheduleEvent, VariableImportRequest } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { createApplication, postApplicationActionsDeploy } from '@qovery/domains/application'
import { importEnvironmentVariables } from '@qovery/domains/environment-variable'
import { selectAllRepository, selectOrganizationById } from '@qovery/domains/organization'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { FlowVariableData, OrganizationEntity, RepositoryEntity } from '@qovery/shared/interfaces'
import {
  SERVICES_JOB_CREATION_GENERAL_URL,
  SERVICES_JOB_CREATION_RESOURCES_URL,
  SERVICES_JOB_CREATION_VARIABLE_URL,
  SERVICES_URL,
} from '@qovery/shared/router'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { buildGitRepoUrl, convertCpuToVCpu, useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import Post from '../../../ui/page-job-create/post/post'
import { ConfigureData, GeneralData, ResourcesData } from '../job-creation-flow.interface'
import { useJobContainerCreateContext } from '../page-job-create-feature'

function prepareJobRequest(
  generalData: GeneralData,
  configureData: ConfigureData,
  resourcesData: ResourcesData,
  selectedRepository: RepositoryEntity | undefined,
  jobType: 'cron' | 'lifecycle'
): JobRequest {
  const memory = Number(resourcesData['memory'])
  const cpu = convertCpuToVCpu(resourcesData['cpu'][0], true)

  const jobRequest: JobRequest = {
    name: generalData.name,
    port: Number(configureData.port),
    description: generalData.description || '',
    cpu: cpu,
    memory: memory,
    arguments: generalData.cmd || [],
    entrypoint: generalData.image_entry_point || '',
    max_nb_restart: Number(configureData.nb_restarts) || 0,
    max_duration_seconds: Number(configureData.max_duration) || 0,
  }

  if (jobType === 'cron') {
    jobRequest.schedule = {
      scheduled_at: configureData.schedule || '',
      event: JobScheduleEvent.CRON,
    }
  } else {
    jobRequest.schedule = {
      event: configureData.event as JobScheduleEvent,
    }
  }

  if (generalData.serviceType === ServiceTypeEnum.CONTAINER) {
    jobRequest.source = {
      image: {
        tag: generalData.image_tag,
        image_name: generalData.image_name,
        registry_id: generalData.registry,
      },
    }
  } else {
    jobRequest.source = {
      docker: {
        dockerfile_path: generalData.dockerfile_path,
        git_repository: {
          url: buildGitRepoUrl(generalData.provider || '', selectedRepository?.url || '') || '',
          root_path: generalData.root_path,
          branch: generalData.branch,
        },
      },
    }
  }

  return jobRequest
}

function prepareVariableRequest(variablesData: FlowVariableData): VariableImportRequest | null {
  if (variablesData.variables && variablesData.variables.length === 0) {
    return null
  }

  return {
    overwrite: true,
    vars: variablesData.variables.map((variable) => ({
      name: variable.variable || '',
      scope: variable.scope || APIVariableScopeEnum.PROJECT,
      value: variable.value || '',
      is_secret: variable.isSecret,
    })),
  }
}

export function PostFeature() {
  useDocumentTitle('Summary - Create Application')
  const { generalData, resourcesData, configureData, setCurrentStep, jobURL, variableData, jobType } =
    useJobContainerCreateContext()
  const navigate = useNavigate()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${jobURL}`
  const [loadingCreate, setLoadingCreate] = useState(false)
  const [loadingCreateAndDeploy, setLoadingCreateAndDeploy] = useState(false)
  const organization = useSelector<RootState, OrganizationEntity | undefined>((state) =>
    selectOrganizationById(state, organizationId)
  )
  const repositories = useSelector(selectAllRepository)
  const selectedRepository = repositories.find((repository) => repository.name === generalData?.repository)

  const gotoGlobalInformations = () => {
    navigate(pathCreate + SERVICES_JOB_CREATION_GENERAL_URL)
  }

  const gotoResources = () => {
    navigate(pathCreate + SERVICES_JOB_CREATION_RESOURCES_URL)
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
    if (generalData && resourcesData && variableData && configureData) {
      toggleLoading(true, withDeploy)

      const jobRequest: JobRequest = prepareJobRequest(
        generalData,
        configureData,
        resourcesData,
        selectedRepository,
        jobType
      )
      const variableRequest = prepareVariableRequest(variableData)

      dispatch(
        createApplication({
          environmentId: environmentId,
          data: jobRequest,
          serviceType: ServiceTypeEnum.JOB,
        })
      )
        .unwrap()
        .then((app) => {
          if (variableRequest) {
            dispatch(
              importEnvironmentVariables({
                vars: variableRequest.vars,
                serviceType: ServiceTypeEnum.JOB,
                overwriteEnabled: variableRequest.overwrite,
                applicationId: app.id,
              })
            )
              .unwrap()
              .then(() => {
                toggleLoading(false, withDeploy)
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
          } else {
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
          }
        })
        .catch((e) => console.error(e))
        .finally(() => {
          toggleLoading(false, withDeploy)
        })
    }
  }

  const toggleLoading = (value: boolean, withDeploy = false) => {
    if (withDeploy) setLoadingCreateAndDeploy(value)
    else setLoadingCreate(value)
  }

  useEffect(() => {
    setCurrentStep(5)
  }, [setCurrentStep])

  return (
    <FunnelFlowBody>
      {generalData && resourcesData && variableData && configureData && (
        <Post
          isLoadingCreate={loadingCreate}
          isLoadingCreateAndDeploy={loadingCreateAndDeploy}
          onSubmit={onSubmit}
          onPrevious={gotoVariable}
          generalData={generalData}
          resourcesData={resourcesData}
          gotoResources={gotoResources}
          configureData={configureData}
          gotoVariables={gotoVariable}
          gotoGlobalInformation={gotoGlobalInformations}
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
