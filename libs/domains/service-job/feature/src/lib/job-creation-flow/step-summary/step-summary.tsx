import { useNavigate, useParams } from '@tanstack/react-router'
import posthog from 'posthog-js'
import {
  type JobLifecycleTypeEnum,
  type JobRequest,
  type LifecycleTemplateResponseVariablesInnerFile,
  type OrganizationAnnotationsGroupResponse,
  type OrganizationLabelsGroupEnrichedResponse,
} from 'qovery-typescript-axios'
import { useCallback, useEffect, useState } from 'react'
import { match } from 'ts-pattern'
import { useAnnotationsGroups, useContainerRegistry, useLabelsGroups } from '@qovery/domains/organizations/feature'
import { type DockerfileSettingsData, useCreateService, useDeployService } from '@qovery/domains/services/feature'
import { useCreateVariable, useImportVariables } from '@qovery/domains/variables/feature'
import { type JobType, ServiceTypeEnum } from '@qovery/shared/enums'
import {
  type FlowVariableData,
  type JobConfigureData,
  type JobGeneralData,
  type JobResourcesData,
  type VariableData,
} from '@qovery/shared/interfaces'
import { Button, FunnelFlowBody, Heading, Icon, Section, truncateText } from '@qovery/shared/ui'
import { generateScopeLabel, prepareVariableImportRequest, upperCaseFirstLetter } from '@qovery/shared/util-js'
import { useJobCreateContext } from '../job-creation-flow'

interface StepSummaryProps {
  onSubmit: (withDeploy: boolean) => void
  onPrevious: () => void
  generalData: JobGeneralData
  dockerfileData?: DockerfileSettingsData
  resourcesData: JobResourcesData
  configureData: JobConfigureData
  variableData: FlowVariableData
  gotoGlobalInformation: () => void
  gotoResources: () => void
  gotoVariables: () => void
  gotoConfigureJob: () => void
  gotoDockerfileJob: () => void
  isLoadingCreate: boolean
  isLoadingCreateAndDeploy: boolean
  selectedRegistryName?: string
  jobType: JobType
  templateType?: keyof typeof JobLifecycleTypeEnum
  labelsGroup: OrganizationLabelsGroupEnrichedResponse[]
  annotationsGroup: OrganizationAnnotationsGroupResponse[]
}

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
  const memory = Number(resourcesData.memory)
  const cpu = Number(resourcesData.cpu)
  const gpu = Number(resourcesData.gpu)

  const jobRequest: JobRequest = {
    name: generalData.name,
    port: Number(configureData.port),
    description: generalData.description || '',
    icon_uri: generalData.icon_uri,
    cpu,
    gpu,
    memory,
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
        docker_target_build_stage: generalData.docker_target_build_stage ?? dockerfileData?.docker_target_build_stage,
        git_repository: {
          provider: generalData.provider ?? 'GITHUB',
          url: generalData.git_repository?.url ?? generalData.repository ?? '',
          root_path: generalData.root_path,
          branch: generalData.branch,
          git_token_id: generalData.git_token_id,
        },
      },
    }
  }

  return jobRequest
}

function StepSummaryContent(props: StepSummaryProps) {
  return (
    <Section>
      <Heading className="mb-2">
        {match(props.templateType)
          .with(
            'TERRAFORM',
            'CLOUDFORMATION',
            (templateType) => `Ready to create your ${upperCaseFirstLetter(templateType)} job`
          )
          .with(
            'GENERIC',
            undefined,
            () => `Ready to create your ${props.jobType === 'CRON_JOB' ? 'Cron' : 'Lifecycle'} job`
          )
          .exhaustive()}
      </Heading>
      <form className="space-y-10">
        <p className="text-sm text-neutral-subtle">
          {match(props.templateType)
            .with(
              'TERRAFORM',
              'CLOUDFORMATION',
              () => 'The setup is done, you can now deploy your job or move forward with some advanced setup.'
            )
            .with(
              'GENERIC',
              undefined,
              () =>
                'The basic application setup is done, you can now deploy your application or move forward with some advanced setup.'
            )
            .exhaustive()}
        </p>

        <div className="flex flex-col gap-6">
          <Section className="rounded-md border border-neutral bg-surface-neutral-subtle p-4">
            <div className="flex justify-between">
              <Heading>General information</Heading>
              <Button type="button" variant="plain" size="md" onClick={props.gotoGlobalInformation}>
                <Icon className="text-base" iconName="gear-complex" />
              </Button>
            </div>
            <ul className="list-none space-y-2 text-sm text-neutral-400">
              <li>
                <strong className="font-medium">Name:</strong> {props.generalData.name}
              </li>
              {props.generalData.description && (
                <li>
                  <strong className="font-medium">Description:</strong>
                  <br />
                  {props.generalData.description}
                </li>
              )}
              {props.templateType && props.templateType !== 'GENERIC' && props.jobType === 'LIFECYCLE_JOB' && (
                <li>
                  <strong className="font-medium">Type:</strong> {upperCaseFirstLetter(props.templateType)}
                </li>
              )}
              <div className="py-2">
                <hr className="border-t border-dashed border-neutral-250" />
              </div>

              {props.generalData.serviceType === ServiceTypeEnum.APPLICATION && (
                <>
                  <li>
                    <strong className="font-medium">Repository:</strong>{' '}
                    {props.generalData.repository || props.generalData.git_repository?.url}
                  </li>
                  <li>
                    <strong className="font-medium">Branch:</strong> {props.generalData.branch}
                  </li>
                  <li>
                    <strong className="font-medium">Root path:</strong> {props.generalData.root_path}
                  </li>
                  {props.generalData.dockerfile_path && (
                    <li>
                      <strong className="font-medium">Dockerfile path:</strong> {props.generalData.dockerfile_path}
                    </li>
                  )}
                  {props.generalData.docker_target_build_stage && (
                    <li>
                      <strong className="font-medium">Dockerfile stage:</strong>{' '}
                      {props.generalData.docker_target_build_stage}
                    </li>
                  )}
                  <li>
                    <strong className="font-medium">Auto-deploy:</strong> {props.generalData.auto_deploy.toString()}
                  </li>
                </>
              )}
              {props.generalData.serviceType === ServiceTypeEnum.CONTAINER && (
                <>
                  <li>
                    <strong className="font-medium">Registry:</strong> {props.selectedRegistryName}
                  </li>
                  <li>
                    <strong className="font-medium">Image name:</strong> {props.generalData.image_name}
                  </li>
                  <li>
                    <strong className="font-medium">Image tag:</strong> {props.generalData.image_tag}
                  </li>
                  {props.jobType === ServiceTypeEnum.CRON_JOB && (
                    <>
                      {props.generalData.docker_target_build_stage && (
                        <li>
                          <strong className="font-medium">Dockerfile stage:</strong>{' '}
                          {props.generalData.docker_target_build_stage}
                        </li>
                      )}
                      {props.generalData.image_entry_point && (
                        <li>
                          <strong className="font-medium">Image entrypoint:</strong>{' '}
                          {props.generalData.image_entry_point}
                        </li>
                      )}
                      {props.generalData.cmd_arguments && (
                        <li>
                          <strong className="font-medium">CMD arguments:</strong> {props.generalData.cmd_arguments}
                        </li>
                      )}
                    </>
                  )}
                  <li>
                    <strong className="font-medium">Auto-deploy:</strong> {props.generalData.auto_deploy.toString()}
                  </li>
                </>
              )}
              {props.labelsGroup && props.generalData.labels_groups && props.generalData.labels_groups.length > 0 && (
                <li>
                  <strong className="font-medium">Labels group:</strong>{' '}
                  {props.labelsGroup
                    .filter(({ id }) => props.generalData.labels_groups?.includes(id))
                    .map(({ name }) => name)
                    .join(', ')}
                </li>
              )}
              {props.annotationsGroup &&
                props.generalData.annotations_groups &&
                props.generalData.annotations_groups.length > 0 && (
                  <li>
                    <strong className="font-medium">Annotations group:</strong>{' '}
                    {props.annotationsGroup
                      .filter(({ id }) => props.generalData.annotations_groups?.includes(id))
                      .map(({ name }) => name)
                      .join(', ')}
                  </li>
                )}
            </ul>
          </Section>

          {(props.dockerfileData?.dockerfile_path || props.dockerfileData?.dockerfile_raw) && (
            <Section className="rounded border border-neutral-250 bg-neutral-100 p-4">
              <div className="flex justify-between">
                <Heading>Dockerfile</Heading>
                <Button type="button" variant="plain" size="md" onClick={props.gotoDockerfileJob}>
                  <Icon className="text-base" iconName="gear-complex" />
                </Button>
              </div>
              <ul className="flex list-none flex-col gap-2 text-sm text-neutral-400">
                {props.dockerfileData.dockerfile_path && (
                  <li>
                    <strong className="font-medium">Dockerfile path:</strong> {props.dockerfileData.dockerfile_path}
                  </li>
                )}
                {props.dockerfileData.docker_target_build_stage && (
                  <li>
                    <strong className="font-medium">Dockerfile stage:</strong>{' '}
                    {props.dockerfileData.docker_target_build_stage}
                  </li>
                )}
                {props.dockerfileData.dockerfile_raw && (
                  <li>
                    <strong className="font-medium">From raw Dockerfile:</strong> {}
                    {truncateText(props.dockerfileData.dockerfile_raw, 50)}...
                  </li>
                )}
              </ul>
            </Section>
          )}

          <Section className="rounded border border-neutral-250 bg-neutral-100 p-4">
            <div className="flex justify-between">
              <Heading>Triggers</Heading>
              <Button type="button" variant="plain" size="md" onClick={props.gotoConfigureJob}>
                <Icon className="text-base" iconName="gear-complex" />
              </Button>
            </div>
            {props.jobType === ServiceTypeEnum.LIFECYCLE_JOB && (
              <>
                {props.configureData.on_start?.enabled && (
                  <>
                    <ul className="flex list-none flex-col gap-2 text-sm text-neutral-400">
                      <li>
                        <strong className="font-medium">Events:</strong> Environment Start
                      </li>
                      <li>
                        <strong className="font-medium">Entrypoint:</strong>{' '}
                        {props.configureData.on_start?.entrypoint || 'null'}
                      </li>
                      <li>
                        <strong className="font-medium">CMD Arguments:</strong>{' '}
                        {props.configureData.on_start?.arguments || 'null'}
                      </li>
                    </ul>
                    <hr className="my-4 border-t border-dashed border-neutral-250" />
                  </>
                )}
                {props.configureData.on_stop?.enabled && (
                  <>
                    <ul className="flex list-none flex-col gap-2 text-sm text-neutral-400">
                      <li>
                        <strong className="font-medium">Events:</strong> Environment Stop
                      </li>
                      <li>
                        <strong className="font-medium">Entrypoint:</strong>{' '}
                        {props.configureData.on_stop?.entrypoint || 'null'}
                      </li>
                      <li>
                        <strong className="font-medium">CMD Arguments:</strong>{' '}
                        {props.configureData.on_stop?.arguments || 'null'}
                      </li>
                    </ul>
                    <hr className="my-4 border-t border-dashed border-neutral-250" />
                  </>
                )}
                {props.configureData.on_delete?.enabled && (
                  <>
                    <ul className="flex list-none flex-col gap-2 text-sm text-neutral-400">
                      <li>
                        <strong className="font-medium">Events:</strong> Environment Delete
                      </li>
                      <li>
                        <strong className="font-medium">Entrypoint:</strong>{' '}
                        {props.configureData.on_delete?.entrypoint || 'null'}
                      </li>
                      <li>
                        <strong className="font-medium">CMD Arguments:</strong>{' '}
                        {props.configureData.on_delete?.arguments || 'null'}
                      </li>
                    </ul>
                    <hr className="my-4 border-t border-dashed border-neutral-250" />
                  </>
                )}
              </>
            )}
            {props.jobType === ServiceTypeEnum.CRON_JOB && (
              <>
                <ul className="flex list-none flex-col gap-2 text-sm text-neutral-400">
                  <li>
                    <strong className="font-medium">Scheduled at:</strong> {props.configureData.schedule}
                  </li>
                  <li>
                    <strong className="font-medium">Timezone:</strong> {props.configureData.timezone}
                  </li>
                </ul>
                <hr className="my-4 border-t border-dashed border-neutral-250" />
              </>
            )}
            <ul className="flex list-none flex-col gap-2 text-sm text-neutral-400">
              <li>
                <strong className="font-medium">Max restarts:</strong> {props.configureData.nb_restarts}
              </li>
              <li>
                <strong className="font-medium">Max duration:</strong> {props.configureData.max_duration}
              </li>
              <li>
                <strong className="font-medium">Port:</strong> {props.configureData.port}
              </li>
            </ul>
          </Section>

          <Section className="rounded border border-neutral-250 bg-neutral-100 p-4">
            <div className="flex justify-between">
              <Heading>Resources</Heading>
              <Button type="button" variant="plain" size="md" onClick={props.gotoResources}>
                <Icon className="text-base" iconName="gear-complex" />
              </Button>
            </div>
            <ul className="flex list-none flex-col gap-2 text-sm text-neutral-400">
              <li>
                <strong className="font-medium">CPU:</strong> {props.resourcesData['cpu']}
              </li>
              <li>
                <strong className="font-medium">Memory:</strong> {props.resourcesData.memory} MB
              </li>
              <li>
                <strong className="font-medium">GPU:</strong> {props.resourcesData.gpu}
              </li>
            </ul>
          </Section>
          <Section className="rounded border border-neutral-250 bg-neutral-100 p-4">
            <div className="flex justify-between">
              <Heading>Environment variables</Heading>
              <Button type="button" variant="plain" size="md" onClick={props.gotoVariables}>
                <Icon className="text-base" iconName="gear-complex" />
              </Button>
            </div>
            <ul className="flex list-none flex-col gap-2 text-sm text-neutral-400">
              {props.variableData.variables && props.variableData.variables.length > 0 ? (
                props.variableData.variables?.map((variable, index) => (
                  <li className="grid grid-cols-3" key={index}>
                    <strong className="truncate font-medium">
                      {variable.variable} = {variable.isSecret ? '********' : variable.value}
                    </strong>
                    <span>
                      <strong className="font-medium">Scope:</strong>{' '}
                      {variable.scope ? generateScopeLabel(variable.scope) : '-'}
                    </span>
                    <span>{variable.isSecret ? 'Secret' : 'Public'}</span>
                  </li>
                ))
              ) : (
                <li>No variable declared</li>
              )}
            </ul>
          </Section>
        </div>
        <div className="flex justify-between">
          <Button onClick={props.onPrevious} type="button" size="lg" variant="plain">
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              data-testid="button-create"
              loading={props.isLoadingCreate}
              onClick={() => props.onSubmit(false)}
              size="lg"
              type="button"
              variant="surface"
            >
              Create
            </Button>
            <Button
              data-testid="button-create-deploy"
              loading={props.isLoadingCreateAndDeploy}
              onClick={() => props.onSubmit(true)}
              type="button"
              size="lg"
            >
              Create and deploy
            </Button>
          </div>
        </div>
      </form>
    </Section>
  )
}

export function StepSummary() {
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
  } = useJobCreateContext()

  const dockerfileData = dockerfileForm.getValues()

  const navigate = useNavigate()
  const { organizationId = '', projectId = '', environmentId = '', slug, option } = useParams({ strict: false })
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
    organizationId,
    projectId,
    environmentId,
  })

  const gotoGlobalInformations = useCallback(() => {
    navigate({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/lifecycle-job/general',
      params: { organizationId, projectId, environmentId },
    })
  }, [navigate, organizationId, projectId, environmentId])

  const gotoResources = useCallback(() => {
    navigate({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/lifecycle-job/resources',
      params: { organizationId, projectId, environmentId },
    })
  }, [navigate, organizationId, projectId, environmentId])

  const gotoConfigureJob = useCallback(() => {
    navigate({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/lifecycle-job/configure',
      params: { organizationId, projectId, environmentId },
    })
  }, [navigate, organizationId, projectId, environmentId])

  const gotoDockerfileJob = useCallback(() => {
    navigate({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/lifecycle-job/dockerfile',
      params: { organizationId, projectId, environmentId },
    })
  }, [navigate, organizationId, projectId, environmentId])

  const gotoVariable = useCallback(() => {
    navigate({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/lifecycle-job/variables',
      params: { organizationId, projectId, environmentId },
    })
  }, [navigate, organizationId, projectId, environmentId])

  const { mutateAsync: importVariables } = useImportVariables()
  const { mutateAsync: createVariable } = useCreateVariable()

  useEffect(() => {
    !generalData?.name &&
      jobURL &&
      navigate({
        to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/lifecycle-job/general',
        params: { organizationId, projectId, environmentId },
      })
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
          if (fileVariable.scope) {
            createVariable({
              variableRequest: {
                key: fileVariable.variable ?? '',
                value: fileVariable.value ?? '',
                variable_scope: fileVariable.scope,
                variable_parent_id: match(fileVariable.scope)
                  .with('JOB', () => service.id)
                  .with('ENVIRONMENT', () => service.environment.id)
                  .with('PROJECT', () => projectId)
                  .with('BUILT_IN', 'APPLICATION', 'CONTAINER', 'HELM', 'TERRAFORM', () => {
                    throw new Error('Should not be possible')
                  })
                  .exhaustive(),
                is_secret: fileVariable.isSecret,
                mount_path: fileVariable.file.path,
                enable_interpolation_in_file: fileVariable.file.enable_interpolation ?? false,
              },
            })
          }
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
        navigate({
          to: '/organization/$organizationId/project/$projectId/environment/$environmentId/overview',
          params: { organizationId, projectId, environmentId },
        })
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
        <StepSummaryContent
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
