import { APIVariableScopeEnum, JobRequest, VariableImportRequest } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { createApplication, postApplicationActionsDeploy } from '@qovery/domains/application'
import { importEnvironmentVariables } from '@qovery/domains/environment-variable'
import { selectAllRepository, selectOrganizationById } from '@qovery/domains/organization'
import { JobType, ServiceTypeEnum } from '@qovery/shared/enums'
import {
  FlowVariableData,
  JobConfigureData,
  JobGeneralData,
  JobResourcesData,
  OrganizationEntity,
  RepositoryEntity,
} from '@qovery/shared/interfaces'
import {
  SERVICES_JOB_CREATION_CONFIGURE_URL,
  SERVICES_JOB_CREATION_GENERAL_URL,
  SERVICES_JOB_CREATION_RESOURCES_URL,
  SERVICES_JOB_CREATION_VARIABLE_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { buildGitRepoUrl, convertCpuToVCpu, useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import StepSummary from '../../../ui/page-job-create/step-summary/step-summary'
import { useJobContainerCreateContext } from '../page-job-create-feature'

function prepareJobRequest(
  generalData: JobGeneralData,
  configureData: JobConfigureData,
  resourcesData: JobResourcesData,
  selectedRepository: RepositoryEntity | undefined,
  jobType: JobType
): JobRequest {
  const memory = Number(resourcesData['memory'])
  const cpu = convertCpuToVCpu(resourcesData['cpu'][0], true)

  const jobRequest: JobRequest = {
    name: generalData.name,
    port: Number(configureData.port),
    description: generalData.description || '',
    cpu: cpu,
    memory: memory,
    max_nb_restart: Number(configureData.nb_restarts) || 0,
    max_duration_seconds: Number(configureData.max_duration) || 0,
    auto_preview: true,
  }

  if (jobType === ServiceTypeEnum.CRON_JOB) {
    jobRequest.schedule = {
      cronjob: {
        entrypoint: configureData.image_entry_point,
        scheduled_at: configureData.schedule || '',
        arguments: configureData.cmd,
      },
    }
  } else {
    jobRequest.schedule = {
      on_start: {
        entrypoint: configureData.on_start?.entrypoint,
        arguments: configureData.on_start?.arguments,
      },
      on_stop: {
        entrypoint: configureData.on_stop?.entrypoint,
        arguments: configureData.on_stop?.arguments,
      },
      on_delete: {
        entrypoint: configureData.on_delete?.entrypoint,
        arguments: configureData.on_delete?.arguments,
      },
    }

    if (!configureData.on_start?.enabled) {
      delete jobRequest.schedule.on_start
    }

    if (!configureData.on_stop?.enabled) {
      delete jobRequest.schedule.on_stop
    }

    if (!configureData.on_delete?.enabled) {
      delete jobRequest.schedule.on_delete
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

export function StepSummaryFeature() {
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

  const gotoConfigureJob = () => {
    navigate(pathCreate + SERVICES_JOB_CREATION_CONFIGURE_URL)
  }

  const gotoVariable = () => {
    navigate(pathCreate + SERVICES_JOB_CREATION_VARIABLE_URL)
  }

  useEffect(() => {
    !generalData?.name &&
      jobURL &&
      navigate(`${SERVICES_URL(organizationId, projectId, environmentId)}${jobURL}` + SERVICES_JOB_CREATION_GENERAL_URL)
  }, [generalData, navigate, environmentId, organizationId, projectId, jobURL, gotoGlobalInformations])

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
                      serviceType: ServiceTypeEnum.JOB,
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
                  serviceType: ServiceTypeEnum.JOB,
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
        <StepSummary
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
          jobType={jobType}
          gotoConfigureJob={gotoConfigureJob}
        />
      )}
    </FunnelFlowBody>
  )
}

export default StepSummaryFeature
