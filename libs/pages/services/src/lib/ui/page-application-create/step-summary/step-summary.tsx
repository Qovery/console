import { BuildModeEnum, type OrganizationAnnotationsGroupResponse } from 'qovery-typescript-axios'
import { ProbeTypeEnum } from '@qovery/shared/enums'
import {
  type ApplicationGeneralData,
  type ApplicationResourcesData,
  type FlowPortData,
} from '@qovery/shared/interfaces'
import { Button, Heading, Icon, Section, Truncate } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

export interface StepSummaryProps {
  onSubmit: (withDeploy: boolean) => void
  onPrevious: () => void
  generalData: ApplicationGeneralData
  resourcesData: ApplicationResourcesData
  portsData: FlowPortData
  gotoGlobalInformation: () => void
  gotoResources: () => void
  gotoPorts: () => void
  gotoHealthchecks: () => void
  isLoadingCreate: boolean
  isLoadingCreateAndDeploy: boolean
  selectedRegistryName?: string
  annotationsGroup: OrganizationAnnotationsGroupResponse[]
}

export function StepSummary({
  onSubmit,
  onPrevious,
  generalData,
  resourcesData,
  portsData,
  gotoGlobalInformation,
  gotoResources,
  gotoHealthchecks,
  gotoPorts,
  isLoadingCreate,
  isLoadingCreateAndDeploy,
  selectedRegistryName,
  annotationsGroup,
}: StepSummaryProps) {
  return (
    <Section>
      <Heading className="mb-2">Ready to create your Application</Heading>

      <form className="space-y-10">
        <p className="text-neutral-350 text-sm">
          The basic application setup is done, you can now deploy your application or move forward with some advanced
          setup.
        </p>

        <div className="flex flex-col gap-6">
          <Section className="p-4 border rounded border-neutral-250 bg-neutral-100">
            <div className="flex justify-between">
              <Heading>General information</Heading>
              <Button type="button" variant="plain" size="md" onClick={gotoGlobalInformation}>
                <Icon className="text-base" iconName="gear-complex" />
              </Button>
            </div>
            <ul className="space-y-2 text-neutral-400 text-sm list-none">
              <li>
                <strong className="font-medium">Name:</strong> {generalData.name}
              </li>
              {generalData.description && (
                <li>
                  <strong className="font-medium">Description:</strong>
                  <br />
                  {generalData.description}
                </li>
              )}
              <div className="py-2">
                <hr className="border-t border-dashed border-neutral-250" />
              </div>

              {generalData.serviceType === 'APPLICATION' && (
                <>
                  <li>
                    <strong className="font-medium">Repository:</strong> {generalData.repository}
                  </li>
                  <li>
                    <strong className="font-medium">Branch:</strong> {generalData.branch}
                  </li>
                  <li>
                    <strong className="font-medium">Root application path:</strong> {generalData.root_path}
                  </li>
                  <li>
                    <strong className="font-medium">Build mode:</strong> {upperCaseFirstLetter(generalData.build_mode)}
                  </li>
                  {generalData.build_mode === BuildModeEnum.BUILDPACKS && (
                    <li>
                      <strong className="font-medium">Buildpack language:</strong> {generalData.buildpack_language}
                    </li>
                  )}
                  {generalData.build_mode === BuildModeEnum.DOCKER && (
                    <li>
                      <strong className="font-medium">Dockerfile path:</strong> {generalData.dockerfile_path}
                    </li>
                  )}
                </>
              )}
              {generalData.serviceType === 'CONTAINER' && (
                <>
                  <li>
                    <strong className="font-medium">Registry:</strong> {selectedRegistryName}
                  </li>
                  <li>
                    <strong className="font-medium">Image name:</strong> {generalData.image_name}
                  </li>
                  <li>
                    <strong className="font-medium">Image tag:</strong> {generalData.image_tag}
                  </li>
                </>
              )}
              <li>
                <strong className="font-medium">Image entrypoint:</strong> {generalData.image_entry_point}
              </li>
              {generalData.cmd_arguments && (
                <li>
                  <strong className="font-medium">CMD arguments:</strong>{' '}
                  <Truncate text={generalData.cmd_arguments} truncateLimit={120} />
                </li>
              )}
              <li>
                <strong className="font-medium">Auto-deploy:</strong> {generalData.auto_deploy.toString()}
              </li>
              {annotationsGroup && generalData.annotations_groups && generalData.annotations_groups.length > 0 && (
                <li>
                  <strong className="font-medium">Annotations group:</strong>{' '}
                  {annotationsGroup
                    .filter(({ id }) => generalData.annotations_groups?.includes(id))
                    .map(({ name }) => name)
                    .join(', ')}
                </li>
              )}
            </ul>
          </Section>

          <Section className="p-4 border rounded border-neutral-250 bg-neutral-100">
            <div className="flex justify-between">
              <Heading>Resources</Heading>
              <Button type="button" variant="plain" size="md" onClick={gotoResources}>
                <Icon className="text-base" iconName="gear-complex" />
              </Button>
            </div>
            <ul className="space-y-2 text-neutral-400 text-sm list-none">
              <li>
                <strong className="font-medium">CPU:</strong> {resourcesData['cpu']}
              </li>
              <li>
                <strong className="font-medium">Memory:</strong> {resourcesData.memory} MB
              </li>
              <li>
                <strong className="font-medium">Instances:</strong> {resourcesData.min_running_instances} -{' '}
                {resourcesData.max_running_instances}
              </li>
            </ul>
          </Section>

          <Section className="p-4 border rounded border-neutral-250 bg-neutral-100">
            <div className="flex justify-between">
              <Heading>Ports</Heading>
              <Button type="button" variant="plain" size="md" onClick={gotoPorts}>
                <Icon className="text-base" iconName="gear-complex" />
              </Button>
            </div>
            <ul className="flex flex-col gap-2 text-neutral-400 text-sm list-none">
              {portsData.ports && portsData.ports.length > 0 ? (
                <>
                  {portsData.ports?.map((port, index) => (
                    <>
                      {!!index && <hr className="border-t border-dashed border-neutral-250" />}
                      <li key={index} className="grid grid-cols-2 grid-flow-col gap-2 my-2">
                        <div>
                          <strong className="font-medium">Application port:</strong> {port.application_port}
                        </div>
                        <div className="space-y-2">
                          <p>
                            <strong className="font-medium">Protocol:</strong> {port.protocol}
                          </p>
                          {port.is_public && (
                            <p>
                              <strong className="font-medium">Public port:</strong> {port.external_port}
                            </p>
                          )}{' '}
                          {port.is_public && (
                            <p>
                              <strong className="font-medium">Port name:</strong> {port.name}
                            </p>
                          )}{' '}
                          <p>
                            <strong className="font-medium">Public:</strong> {port.is_public ? 'Yes' : 'No'}
                          </p>
                        </div>
                      </li>
                    </>
                  ))}
                </>
              ) : (
                <li>No port declared</li>
              )}
            </ul>
          </Section>

          {portsData.ports &&
            portsData.ports.length > 0 &&
            portsData.healthchecks?.item &&
            portsData.healthchecks?.item.readiness_probe && (
              <Section className="p-4 border rounded border-neutral-250 bg-neutral-100">
                <div className="flex justify-between">
                  <Heading>Health checks</Heading>
                  <Button type="button" variant="plain" size="md" onClick={gotoHealthchecks}>
                    <Icon className="text-base" iconName="gear-complex" />
                  </Button>
                </div>
                <ul className="flex flex-col gap-2 text-neutral-400 text-sm list-none">
                  {portsData.healthchecks.item.liveness_probe &&
                    portsData.healthchecks.typeLiveness !== ProbeTypeEnum.NONE && (
                      <li className="grid grid-cols-2 grid-flow-col gap-2 my-2">
                        <div>
                          <strong className="font-medium">Liveness</strong>
                        </div>
                        <div className="space-y-2">
                          <p>
                            <strong className="font-medium">Type:</strong> {portsData.healthchecks.typeLiveness}
                          </p>
                          <p>
                            <strong className="font-medium">Initial Delay:</strong>{' '}
                            {portsData.healthchecks.item.liveness_probe.initial_delay_seconds} seconds
                          </p>
                          <p>
                            <strong className="font-medium">Period:</strong>{' '}
                            {portsData.healthchecks.item.liveness_probe.period_seconds} seconds
                          </p>
                          <p>
                            <strong className="font-medium">Timeout:</strong>{' '}
                            {portsData.healthchecks.item.liveness_probe.timeout_seconds} seconds
                          </p>
                          <p>
                            <strong className="font-medium">Success Threshold:</strong>{' '}
                            {portsData.healthchecks.item.liveness_probe.success_threshold}
                          </p>
                          <p>
                            <strong className="font-medium">Failure Threshold:</strong>{' '}
                            {portsData.healthchecks.item.liveness_probe.failure_threshold}
                          </p>
                        </div>
                      </li>
                    )}
                  {portsData.healthchecks.item.readiness_probe &&
                    portsData.healthchecks.typeReadiness !== ProbeTypeEnum.NONE && (
                      <>
                        {portsData.healthchecks.item.liveness_probe &&
                          portsData.healthchecks.typeLiveness !== ProbeTypeEnum.NONE && (
                            <hr className="border-t border-dashed border-neutral-250" />
                          )}
                        <li className="grid grid-cols-2 grid-flow-col gap-2 my-2">
                          <div>
                            <strong className="font-medium">Readiness</strong>
                          </div>
                          <div className="space-y-2">
                            <p>
                              <strong className="font-medium">Type:</strong> {portsData.healthchecks.typeReadiness}
                            </p>
                            <p>
                              <strong className="font-medium">Initial Delay:</strong>{' '}
                              {portsData.healthchecks.item.readiness_probe.initial_delay_seconds} seconds
                            </p>
                            <p>
                              <strong className="font-medium">Period:</strong>{' '}
                              {portsData.healthchecks.item.readiness_probe.period_seconds} seconds
                            </p>
                            <p>
                              <strong className="font-medium">Timeout:</strong>{' '}
                              {portsData.healthchecks.item.readiness_probe.timeout_seconds} seconds
                            </p>
                            <p>
                              <strong className="font-medium">Success Threshold:</strong>{' '}
                              {portsData.healthchecks.item.readiness_probe.success_threshold}
                            </p>
                            <p>
                              <strong className="font-medium">Failure Threshold:</strong>{' '}
                              {portsData.healthchecks.item.readiness_probe.failure_threshold}
                            </p>
                          </div>
                        </li>
                      </>
                    )}
                </ul>
              </Section>
            )}
        </div>

        <div className="flex justify-between">
          <Button onClick={onPrevious} type="button" size="lg" variant="plain">
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              data-testid="button-create"
              loading={isLoadingCreate}
              onClick={() => onSubmit(false)}
              size="lg"
              variant="outline"
              type="button"
            >
              Create
            </Button>
            <Button
              data-testid="button-create-deploy"
              loading={isLoadingCreateAndDeploy}
              onClick={() => onSubmit(true)}
              size="lg"
              type="button"
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
