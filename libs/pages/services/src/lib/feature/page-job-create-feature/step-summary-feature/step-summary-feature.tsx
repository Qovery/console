import posthog from 'posthog-js'
import {
  APIVariableScopeEnum,
  type JobLifecycleTypeEnum,
  type JobRequest,
  type LifecycleTemplateResponseVariablesInnerFile,
  type OrganizationAnnotationsGroupResponse,
  type OrganizationLabelsGroupEnrichedResponse,
  type VariableImportRequest,
} from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useAnnotationsGroups, useContainerRegistry, useLabelsGroups } from '@qovery/domains/organizations/feature'
import { type DockerfileSettingsData, useCreateService, useDeployService } from '@qovery/domains/services/feature'
import { useCreateVariable, useImportVariables } from '@qovery/domains/variables/feature'
import { type JobType, ServiceTypeEnum } from '@qovery/shared/enums'
import {
  type JobConfigureData,
  type JobGeneralData,
  type JobResourcesData,
  type VariableData,
} from '@qovery/shared/interfaces'
import {
  SERVICES_JOB_CREATION_CONFIGURE_URL,
  SERVICES_JOB_CREATION_DOCKERFILE_URL,
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

function prepareJobRequest({
  generalData,
  configureData,
  resourcesData,
  jobType,
  templateType,
  labelsGroup,
  annotationsGroup,
  dockerfileData,
}: {
  generalData: JobGeneralData
  configureData: JobConfigureData
  resourcesData: JobResourcesData
  jobType: JobType
  templateType?: keyof typeof JobLifecycleTypeEnum
  labelsGroup: OrganizationLabelsGroupEnrichedResponse[]
  annotationsGroup: OrganizationAnnotationsGroupResponse[]
  dockerfileData?: DockerfileSettingsData
}): JobRequest {
  const memory = Number(resourcesData['memory'])
  const cpu = resourcesData['cpu']

  const jobRequest: JobRequest = {
    name: generalData.name,
    port: Number(configureData.port),
    description: generalData.description || '',
    icon_uri: generalData.icon_uri,
    cpu: cpu,
    memory: memory,
    max_nb_restart: Number(configureData.nb_restarts) || 0,
    max_duration_seconds: Number(configureData.max_duration) || 0,
    auto_preview: false,
    auto_deploy: generalData.auto_deploy,
    healthchecks: {},
    annotations_groups: annotationsGroup.filter((group) => generalData.annotations_groups?.includes(group.id)),
    labels_groups: labelsGroup.filter((group) => generalData.labels_groups?.includes(group.id)),
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
      lifecycle_type: templateType,
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
        dockerfile_raw: dockerfileData?.dockerfile_raw,
        dockerfile_path: generalData.dockerfile_path ?? dockerfileData?.dockerfile_path,
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

function prepareVariableImportRequest(variables: VariableData[]): VariableImportRequest | null {
  if (variables && variables.length === 0) {
    return null
  }

  return {
    overwrite: true,
    vars: variables.map(({ variable, scope, value, isSecret }) => ({
      name: variable || '',
      scope: scope || APIVariableScopeEnum.PROJECT,
      value: value || '',
      is_secret: isSecret,
    })),
  }
}

export function StepSummaryFeature() {
  useDocumentTitle('Summary - Create Application')
  const {
    generalData,
    dockerfileForm,
    resourcesData,
    configureData,
    setCurrentStep,
    jobURL,
    variableData,
    jobType,
    templateType,
  } = useJobContainerCreateContext()

  const dockerfileData = dockerfileForm.getValues()

  const navigate = useNavigate()
  const { organizationId = '', projectId = '', environmentId = '', slug, option } = useParams()
  const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${jobURL}`
  const [loadingCreate, setLoadingCreate] = useState(false)
  const [loadingCreateAndDeploy, setLoadingCreateAndDeploy] = useState(false)
  const { data: containerRegistry } = useContainerRegistry({
    organizationId,
    containerRegistryId: generalData?.registry,
  })
  const { data: labelsGroup = [] } = useLabelsGroups({ organizationId })
  const { data: annotationsGroup = [] } = useAnnotationsGroups({ organizationId })

  const { mutateAsync: createService } = useCreateService({ organizationId })
  const { mutate: deployService } = useDeployService({
    environmentId,
  })

  const gotoGlobalInformations = () => {
    navigate(pathCreate + SERVICES_JOB_CREATION_GENERAL_URL)
  }

  const gotoResources = () => {
    navigate(pathCreate + SERVICES_JOB_CREATION_RESOURCES_URL)
  }

  const gotoConfigureJob = () => {
    navigate(pathCreate + SERVICES_JOB_CREATION_CONFIGURE_URL)
  }

  const gotoDockerfileJob = () => {
    navigate(pathCreate + SERVICES_JOB_CREATION_DOCKERFILE_URL)
  }

  const gotoVariable = () => {
    navigate(pathCreate + SERVICES_JOB_CREATION_VARIABLE_URL)
  }

  const { mutateAsync: importVariables } = useImportVariables()
  const { mutateAsync: createVariable } = useCreateVariable()

  useEffect(() => {
    !generalData?.name &&
      jobURL &&
      navigate(`${SERVICES_URL(organizationId, projectId, environmentId)}${jobURL}` + SERVICES_JOB_CREATION_GENERAL_URL)
  }, [generalData, navigate, environmentId, organizationId, projectId, jobURL, gotoGlobalInformations])

  const onSubmit = async (withDeploy: boolean) => {
    if (generalData && resourcesData && variableData && configureData) {
      toggleLoading(true, withDeploy)

      const jobRequest: JobRequest = prepareJobRequest({
        generalData,
        configureData,
        resourcesData,
        jobType,
        templateType,
        labelsGroup,
        annotationsGroup,
        dockerfileData,
      })

      const { variables, fileVariables } = variableData.variables.reduce<{
        variables: VariableData[]
        fileVariables: (VariableData & { file: LifecycleTemplateResponseVariablesInnerFile })[]
      }>(
        (acc, v) => {
          if (v.file) {
            acc.fileVariables.push(v as VariableData & { file: LifecycleTemplateResponseVariablesInnerFile })
          } else {
            acc.variables.push(v)
          }
          return acc
        },
        { variables: [], fileVariables: [] }
      )

      const variableImportRequest = prepareVariableImportRequest(variables)

      try {
        const service = await createService({
          environmentId: environmentId,
          payload: {
            serviceType: 'JOB',
            ...jobRequest,
          },
        })

        if (variableImportRequest) {
          importVariables({
            serviceType: ServiceTypeEnum.JOB,
            serviceId: service.id,
            variableImportRequest,
          })
        }

        for (const fileVariable of fileVariables) {
          createVariable({
            variableRequest: {
              key: fileVariable.variable ?? '',
              value: fileVariable.value ?? '',
              variable_scope: fileVariable.scope ?? APIVariableScopeEnum.PROJECT,
              variable_parent_id: match(fileVariable.scope)
                .with('JOB', () => service.id)
                .with('ENVIRONMENT', () => service.environment.id)
                .with('PROJECT', () => projectId)
                .with('BUILT_IN', 'APPLICATION', 'CONTAINER', 'HELM', undefined, () => {
                  throw new Error('Should not be possible')
                })
                .exhaustive(),
              is_secret: fileVariable.isSecret,
              mount_path: fileVariable.file.path,
              enable_interpolation_in_file: fileVariable.file.enable_interpolation ?? false,
            },
          })
        }

        if (withDeploy) {
          deployService({
            serviceId: service.id,
            serviceType: 'JOB',
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
    }
  }

  const toggleLoading = (value: boolean, withDeploy = false) => {
    if (withDeploy) setLoadingCreateAndDeploy(value)
    else setLoadingCreate(value)
  }

  useEffect(() => {
    setCurrentStep(6)
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
          dockerfileData={dockerfileData}
          resourcesData={resourcesData}
          gotoResources={gotoResources}
          configureData={configureData}
          gotoVariables={gotoVariable}
          gotoGlobalInformation={gotoGlobalInformations}
          variableData={variableData}
          selectedRegistryName={containerRegistry?.name}
          jobType={jobType}
          templateType={templateType}
          gotoConfigureJob={gotoConfigureJob}
          gotoDockerfileJob={gotoDockerfileJob}
          labelsGroup={labelsGroup}
          annotationsGroup={annotationsGroup}
        />
      )}
    </FunnelFlowBody>
  )
}

export default StepSummaryFeature
