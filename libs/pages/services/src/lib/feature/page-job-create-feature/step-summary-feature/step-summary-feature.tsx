import { useQueryClient } from '@tanstack/react-query'
import { APIVariableScopeEnum, type JobRequest, type VariableImportRequest } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { createApplication, postApplicationActionsDeploy } from '@qovery/domains/application'
import { importEnvironmentVariables } from '@qovery/domains/environment-variable'
import { getGitTokenValue, useContainerRegistry } from '@qovery/domains/organizations/feature'
import { type JobType, ServiceTypeEnum } from '@qovery/shared/enums'
import {
  type FlowVariableData,
  type JobConfigureData,
  type JobGeneralData,
  type JobResourcesData,
} from '@qovery/shared/interfaces'
import {
  DEPLOYMENT_LOGS_URL,
  ENVIRONMENT_LOGS_URL,
  SERVICES_JOB_CREATION_CONFIGURE_URL,
  SERVICES_JOB_CREATION_GENERAL_URL,
  SERVICES_JOB_CREATION_RESOURCES_URL,
  SERVICES_JOB_CREATION_VARIABLE_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { buildGitRepoUrl } from '@qovery/shared/util-js'
import { type AppDispatch } from '@qovery/state/store'
import StepSummary from '../../../ui/page-job-create/step-summary/step-summary'
import { useJobContainerCreateContext } from '../page-job-create-feature'

function prepareJobRequest(
  generalData: JobGeneralData,
  configureData: JobConfigureData,
  resourcesData: JobResourcesData,
  jobType: JobType
): JobRequest {
  const memory = Number(resourcesData['memory'])
  const cpu = resourcesData['cpu']

  const jobRequest: JobRequest = {
    name: generalData.name,
    port: Number(configureData.port),
    description: generalData.description || '',
    cpu: cpu,
    memory: memory,
    max_nb_restart: Number(configureData.nb_restarts) || 0,
    max_duration_seconds: Number(configureData.max_duration) || 0,
    auto_preview: true,
    auto_deploy: generalData.auto_deploy,
    healthchecks: {},
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
    const gitToken = getGitTokenValue(generalData.provider ?? '')

    jobRequest.source = {
      docker: {
        dockerfile_path: generalData.dockerfile_path,
        git_repository: {
          url: buildGitRepoUrl(gitToken?.type ?? generalData.provider ?? '', generalData.repository || ''),
          root_path: generalData.root_path,
          branch: generalData.branch,
          git_token_id: gitToken?.id,
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
  const { data: containerRegistry } = useContainerRegistry({
    organizationId,
    containerRegistryId: generalData?.registry,
  })

  const queryClient = useQueryClient()

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

      const jobRequest: JobRequest = prepareJobRequest(generalData, configureData, resourcesData, jobType)
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
                      callback: () =>
                        navigate(
                          ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + DEPLOYMENT_LOGS_URL(app.id)
                        ),
                      queryClient,
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
                  callback: () =>
                    navigate(
                      ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + DEPLOYMENT_LOGS_URL(app.id)
                    ),
                  queryClient,
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
          selectedRegistryName={containerRegistry?.name}
          jobType={jobType}
          gotoConfigureJob={gotoConfigureJob}
        />
      )}
    </FunnelFlowBody>
  )
}

export default StepSummaryFeature
