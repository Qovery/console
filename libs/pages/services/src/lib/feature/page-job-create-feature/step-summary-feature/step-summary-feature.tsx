import { APIVariableScopeEnum, type JobRequest, type VariableImportRequest } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAnnotationsGroups, useContainerRegistry } from '@qovery/domains/organizations/feature'
import { useAddAnnotationsGroup, useCreateService, useDeployService } from '@qovery/domains/services/feature'
import { useImportVariables } from '@qovery/domains/variables/feature'
import { type JobType, ServiceTypeEnum } from '@qovery/shared/enums'
import {
  type FlowVariableData,
  type JobConfigureData,
  type JobGeneralData,
  type JobResourcesData,
} from '@qovery/shared/interfaces'
import {
  SERVICES_JOB_CREATION_CONFIGURE_URL,
  SERVICES_JOB_CREATION_GENERAL_URL,
  SERVICES_JOB_CREATION_RESOURCES_URL,
  SERVICES_JOB_CREATION_VARIABLE_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { buildGitRepoUrl } from '@qovery/shared/util-js'
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
        entrypoint: generalData.image_entry_point,
        scheduled_at: configureData.schedule || '',
        arguments: generalData.cmd,
        timezone: configureData.timezone,
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
          url: buildGitRepoUrl(generalData.provider ?? '', generalData.repository || ''),
          root_path: generalData.root_path,
          branch: generalData.branch,
          git_token_id: generalData.git_token_id,
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
  const { data: annotationsGroup = [] } = useAnnotationsGroups({ organizationId })

  const { mutateAsync: addAnnotationsGroup } = useAddAnnotationsGroup()
  const { mutateAsync: createService } = useCreateService()
  const { mutate: deployService } = useDeployService({ environmentId })

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

  const { mutateAsync: importVariables } = useImportVariables()

  useEffect(() => {
    !generalData?.name &&
      jobURL &&
      navigate(`${SERVICES_URL(organizationId, projectId, environmentId)}${jobURL}` + SERVICES_JOB_CREATION_GENERAL_URL)
  }, [generalData, navigate, environmentId, organizationId, projectId, jobURL, gotoGlobalInformations])

  const onSubmit = async (withDeploy: boolean) => {
    if (generalData && resourcesData && variableData && configureData) {
      toggleLoading(true, withDeploy)

      const jobRequest: JobRequest = prepareJobRequest(generalData, configureData, resourcesData, jobType)
      const variableImportRequest = prepareVariableRequest(variableData)

      try {
        const service = await createService({
          environmentId: environmentId,
          payload: {
            serviceType: 'JOB',
            ...jobRequest,
          },
        })

        if (generalData.annotations_groups) {
          for (const annotationsGroup of generalData.annotations_groups) {
            await addAnnotationsGroup({
              serviceId: service.id,
              serviceType: 'JOB',
              annotationsGroupId: annotationsGroup,
            })
          }
        }

        if (variableImportRequest) {
          importVariables({
            serviceType: ServiceTypeEnum.JOB,
            serviceId: service.id,
            variableImportRequest,
          })
        }

        if (withDeploy) {
          deployService({
            serviceId: service.id,
            serviceType: 'JOB',
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
          annotationsGroup={annotationsGroup}
        />
      )}
    </FunnelFlowBody>
  )
}

export default StepSummaryFeature
