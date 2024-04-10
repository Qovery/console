import { BuildModeEnum, type OrganizationAnnotationsGroupResponse } from 'qovery-typescript-axios'
import { type JobType, ServiceTypeEnum } from '@qovery/shared/enums'
import {
  type FlowVariableData,
  type JobConfigureData,
  type JobGeneralData,
  type JobResourcesData,
} from '@qovery/shared/interfaces'
import { Button, Heading, Icon, Section } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

export interface StepSummaryProps {
  onSubmit: (withDeploy: boolean) => void
  onPrevious: () => void
  generalData: JobGeneralData
  resourcesData: JobResourcesData
  configureData: JobConfigureData
  variableData: FlowVariableData
  gotoGlobalInformation: () => void
  gotoResources: () => void
  gotoVariables: () => void
  gotoConfigureJob: () => void
  isLoadingCreate: boolean
  isLoadingCreateAndDeploy: boolean
  selectedRegistryName?: string
  jobType: JobType
  annotationsGroup: OrganizationAnnotationsGroupResponse[]
}

export function StepSummary(props: StepSummaryProps) {
  return (
    <Section>
      <Heading className="mb-2">Ready to create your {props.jobType === 'CRON_JOB' ? 'Cron' : 'Lifecycle'} job</Heading>
      <form className="space-y-10">
        <p className="text-neutral-350 text-sm">
          The basic application setup is done, you can now deploy your application or move forward with some advanced
          setup.
        </p>

        <div className="flex flex-col gap-6">
          <Section className="p-4 border rounded border-neutral-250 bg-neutral-100">
            <div className="flex justify-between">
              <Heading>General information</Heading>
              <Button type="button" variant="plain" size="md" onClick={props.gotoGlobalInformation}>
                <Icon className="text-base" iconName="gear-complex" />
              </Button>
            </div>
            <ul className="space-y-2 text-neutral-400 text-sm list-none">
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
              <div className="py-2">
                <hr className="border-t border-dashed border-neutral-250" />
              </div>

              {props.generalData.serviceType === ServiceTypeEnum.APPLICATION && (
                <>
                  <li>
                    <strong className="font-medium">Repository:</strong> {props.generalData.repository}
                  </li>
                  <li>
                    <strong className="font-medium">Branch:</strong> {props.generalData.branch}
                  </li>
                  <li>
                    <strong className="font-medium">Root path:</strong> {props.generalData.root_path}
                  </li>
                  {props.generalData.build_mode === BuildModeEnum.DOCKER && (
                    <li>
                      <strong className="font-medium">Dockerfile path:</strong> {props.generalData.dockerfile_path}
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
                  {props.annotationsGroup &&
                    props.generalData.annotations_groups &&
                    props.generalData.annotations_groups.length > 0 && (
                      <li>
                        <strong className="font-medium">Annotations group:</strong>{' '}
                        {props.annotationsGroup
                          .filter((annotation) => props.generalData.annotations_groups?.includes(annotation.id))
                          .map((annotation) => annotation.name)
                          .join(', ')}
                      </li>
                    )}
                </>
              )}
            </ul>
          </Section>

          <Section className="p-4 border rounded border-neutral-250 bg-neutral-100">
            <div className="flex justify-between">
              <Heading>Job configuration</Heading>
              <Button type="button" variant="plain" size="md" onClick={props.gotoConfigureJob}>
                <Icon className="text-base" iconName="gear-complex" />
              </Button>
            </div>
            {props.jobType === ServiceTypeEnum.LIFECYCLE_JOB && (
              <>
                {props.configureData.on_start?.enabled && (
                  <>
                    <ul className="flex flex-col gap-2 text-neutral-400 text-sm list-none">
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
                    <ul className="flex flex-col gap-2 text-neutral-400 text-sm list-none">
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
                    <ul className="flex flex-col gap-2 text-neutral-400 text-sm list-none">
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
                <ul className="flex flex-col gap-2 text-neutral-400 text-sm list-none">
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
            <ul className="flex flex-col gap-2 text-neutral-400 text-sm list-none">
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

          <Section className="p-4 border rounded border-neutral-250 bg-neutral-100">
            <div className="flex justify-between">
              <Heading>Resources</Heading>
              <Button type="button" variant="plain" size="md" onClick={props.gotoResources}>
                <Icon className="text-base" iconName="gear-complex" />
              </Button>
            </div>
            <ul className="flex flex-col gap-2 text-neutral-400 text-sm list-none">
              <li>
                <strong className="font-medium">CPU:</strong> {props.resourcesData['cpu']}
              </li>
              <li>
                <strong className="font-medium">Memory:</strong> {props.resourcesData.memory} MB
              </li>
            </ul>
          </Section>
          <Section className="p-4 border rounded border-neutral-250 bg-neutral-100">
            <div className="flex justify-between">
              <Heading>Environment variables</Heading>
              <Button type="button" variant="plain" size="md" onClick={props.gotoVariables}>
                <Icon className="text-base" iconName="gear-complex" />
              </Button>
            </div>
            <ul className="flex flex-col gap-2 text-neutral-400 text-sm list-none">
              {props.variableData.variables && props.variableData.variables.length > 0 ? (
                props.variableData.variables?.map((variable, index) => (
                  <li className="grid grid-cols-3" key={index}>
                    <strong className="font-medium truncate">
                      {variable.variable} = {variable.isSecret ? '********' : variable.value}
                    </strong>
                    <span>
                      <strong className="font-medium">Scope:</strong> {upperCaseFirstLetter(variable.scope)}
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

export default StepSummary
