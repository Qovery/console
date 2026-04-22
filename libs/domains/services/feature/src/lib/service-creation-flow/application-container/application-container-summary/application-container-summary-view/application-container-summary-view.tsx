import {
  type OrganizationAnnotationsGroupResponse,
  type OrganizationLabelsGroupEnrichedResponse,
} from 'qovery-typescript-axios'
import { Fragment } from 'react'
import { match } from 'ts-pattern'
import {
  type ApplicationGeneralData,
  type ApplicationResourcesData,
  type FlowPortData,
  type VariableData,
} from '@qovery/shared/interfaces'
import { Button, Heading, Icon, Section, SummaryValue, Truncate } from '@qovery/shared/ui'
import { generateScopeLabel } from '@qovery/shared/util-js'

export interface ApplicationContainerSummaryViewProps {
  generalData: ApplicationGeneralData
  resourcesData: ApplicationResourcesData
  portsData: FlowPortData
  variablesData: VariableData[]
  selectedRegistryName?: string
  annotationsGroup: OrganizationAnnotationsGroupResponse[]
  labelsGroup: OrganizationLabelsGroupEnrichedResponse[]
  onEditGeneral: () => void
  onEditResources: () => void
  onEditPorts: () => void
  onEditHealthchecks: () => void
  onEditVariables: () => void
  onBack: () => void
  onSubmit: (withDeploy: boolean) => void
  isLoadingCreate: boolean
  isLoadingCreateAndDeploy: boolean
}

function EditSectionButton({ onClick, testId, label }: { onClick: () => void; testId: string; label: string }) {
  return (
    <Button
      aria-label={label}
      data-testid={testId}
      type="button"
      variant="outline"
      color="neutral"
      size="md"
      onClick={onClick}
      iconOnly
    >
      <Icon className="text-base" iconName="gear-complex" />
    </Button>
  )
}

export function ApplicationContainerSummaryView({
  generalData,
  resourcesData,
  portsData,
  variablesData,
  selectedRegistryName,
  annotationsGroup,
  labelsGroup,
  onEditGeneral,
  onEditResources,
  onEditPorts,
  onEditHealthchecks,
  onEditVariables,
  onBack,
  onSubmit,
  isLoadingCreate,
  isLoadingCreateAndDeploy,
}: ApplicationContainerSummaryViewProps) {
  const serviceLabel = match(generalData.serviceType)
    .with('APPLICATION', () => 'Application')
    .otherwise(() => 'Container')

  const hasHealthchecks = Boolean(
    portsData.healthchecks?.item?.liveness_probe || portsData.healthchecks?.item?.readiness_probe
  )

  return (
    <Section className="space-y-10">
      <div className="flex flex-col gap-2">
        <Heading className="mb-2">Ready to create your {serviceLabel}</Heading>
        <p className="text-sm text-neutral-subtle">
          The basic {serviceLabel.toLowerCase()} setup is done, you can now deploy your {serviceLabel.toLowerCase()} or
          move forward with some advanced setup.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <Section className="rounded-md border border-neutral bg-surface-neutral-subtle p-4">
          <div className="flex justify-between">
            <Heading>General information</Heading>
            <EditSectionButton onClick={onEditGeneral} testId="edit-general-button" label="Edit general information" />
          </div>
          <ul className="list-none space-y-2 text-sm text-neutral-subtle">
            <SummaryValue label="Name" value={generalData.name} />
            {generalData.description && (
              <li>
                <strong className="font-medium text-neutral">Description:</strong>
                <br />
                {generalData.description}
              </li>
            )}
            <li className="py-2">
              <hr className="border-t border-dashed border-neutral" />
            </li>

            {generalData.serviceType === 'APPLICATION' && (
              <>
                <SummaryValue label="Repository" value={generalData.repository || generalData.git_repository?.url} />
                <SummaryValue label="Branch" value={generalData.branch} />
                <SummaryValue label="Root application path" value={generalData.root_path || '/'} />
                <SummaryValue label="Dockerfile path" value={generalData.dockerfile_path} />
                {generalData.docker_target_build_stage && (
                  <SummaryValue label="Dockerfile stage" value={generalData.docker_target_build_stage} />
                )}
              </>
            )}

            {generalData.serviceType === 'CONTAINER' && (
              <>
                <SummaryValue label="Registry" value={selectedRegistryName} />
                <SummaryValue label="Image name" value={generalData.image_name} />
                <SummaryValue label="Image tag" value={generalData.image_tag} />
              </>
            )}

            {generalData.image_entry_point && (
              <SummaryValue label="Image entrypoint" value={generalData.image_entry_point} />
            )}
            {generalData.cmd_arguments && (
              <li>
                <strong className="font-medium text-neutral">CMD arguments:</strong>{' '}
                <Truncate text={generalData.cmd_arguments} truncateLimit={120} />
              </li>
            )}
            <SummaryValue label="Auto-deploy" value={generalData.auto_deploy.toString()} />
            {labelsGroup.length > 0 && generalData.labels_groups?.length ? (
              <SummaryValue
                label="Labels group"
                value={labelsGroup
                  .filter(({ id }) => generalData.labels_groups?.includes(id))
                  .map(({ name }) => name)
                  .join(', ')}
              />
            ) : null}
            {annotationsGroup.length > 0 && generalData.annotations_groups?.length ? (
              <SummaryValue
                label="Annotations group"
                value={annotationsGroup
                  .filter(({ id }) => generalData.annotations_groups?.includes(id))
                  .map(({ name }) => name)
                  .join(', ')}
              />
            ) : null}
          </ul>
        </Section>

        <Section className="rounded-md border border-neutral bg-surface-neutral-subtle p-4">
          <div className="flex justify-between">
            <Heading>Resources</Heading>
            <EditSectionButton onClick={onEditResources} testId="edit-resources-button" label="Edit resources" />
          </div>
          <ul className="list-none space-y-2 text-sm text-neutral-subtle">
            <SummaryValue label="CPU" value={resourcesData.cpu} />
            <SummaryValue label="Memory" value={`${resourcesData.memory} MB`} />
            <SummaryValue
              label={resourcesData.autoscaling_mode === 'NONE' ? 'Instances' : 'Instances (min/max)'}
              value={
                resourcesData.autoscaling_mode === 'NONE'
                  ? resourcesData.min_running_instances
                  : `${resourcesData.min_running_instances} - ${resourcesData.max_running_instances}`
              }
            />
            <SummaryValue
              label="Scaling method"
              value={match(resourcesData.autoscaling_mode)
                .with('KEDA', () => 'KEDA')
                .with('HPA', () => 'HPA')
                .otherwise(() => 'Fixed')}
            />
            <SummaryValue label="GPU" value={resourcesData.gpu} />
          </ul>
        </Section>

        <Section className="rounded-md border border-neutral bg-surface-neutral-subtle p-4">
          <div className="flex justify-between">
            <Heading>Ports</Heading>
            <EditSectionButton onClick={onEditPorts} testId="edit-ports-button" label="Edit ports" />
          </div>
          <ul className="flex list-none flex-col gap-2 text-sm text-neutral-subtle">
            {portsData.ports?.length ? (
              portsData.ports.map((port, index) => (
                <Fragment key={`${port.name}-${port.protocol}-${port.application_port}-${port.external_port}`}>
                  {!!index && <hr className="border-t border-dashed border-neutral" />}
                  <li className="my-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                    <div>
                      <strong className="font-medium text-neutral">Application port:</strong> {port.application_port}
                    </div>
                    <div className="space-y-2">
                      <p>
                        <strong className="font-medium text-neutral">Protocol:</strong> {port.protocol}
                      </p>
                      <p>
                        <strong className="font-medium text-neutral">Public:</strong> {port.is_public ? 'Yes' : 'No'}
                      </p>
                      {port.is_public && (
                        <p>
                          <strong className="font-medium text-neutral">External port:</strong> {port.external_port}
                        </p>
                      )}
                      {port.public_path && (
                        <p>
                          <strong className="font-medium text-neutral">Public path:</strong> {port.public_path}
                        </p>
                      )}
                      {port.public_path_rewrite && (
                        <p>
                          <strong className="font-medium text-neutral">Rewrite public path:</strong>{' '}
                          {port.public_path_rewrite}
                        </p>
                      )}
                    </div>
                  </li>
                </Fragment>
              ))
            ) : (
              <li>No port declared</li>
            )}
          </ul>
        </Section>

        {portsData.ports?.length && hasHealthchecks ? (
          <Section className="rounded-md border border-neutral bg-surface-neutral-subtle p-4">
            <div className="flex justify-between">
              <Heading>Health checks</Heading>
              <EditSectionButton
                onClick={onEditHealthchecks}
                testId="edit-healthchecks-button"
                label="Edit health checks"
              />
            </div>
            <ul className="flex list-none flex-col gap-2 text-sm text-neutral-subtle">
              {portsData.healthchecks?.item?.liveness_probe && portsData.healthchecks.typeLiveness ? (
                <li className="my-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div>
                    <strong className="font-medium text-neutral">Liveness</strong>
                  </div>
                  <div className="space-y-2">
                    <p>
                      <strong className="font-medium text-neutral">Type:</strong> {portsData.healthchecks.typeLiveness}
                    </p>
                    <p>
                      <strong className="font-medium text-neutral">Initial Delay:</strong>{' '}
                      {portsData.healthchecks.item.liveness_probe.initial_delay_seconds} seconds
                    </p>
                    <p>
                      <strong className="font-medium text-neutral">Period:</strong>{' '}
                      {portsData.healthchecks.item.liveness_probe.period_seconds} seconds
                    </p>
                    <p>
                      <strong className="font-medium text-neutral">Timeout:</strong>{' '}
                      {portsData.healthchecks.item.liveness_probe.timeout_seconds} seconds
                    </p>
                    <p>
                      <strong className="font-medium text-neutral">Success Threshold:</strong>{' '}
                      {portsData.healthchecks.item.liveness_probe.success_threshold}
                    </p>
                    <p>
                      <strong className="font-medium text-neutral">Failure Threshold:</strong>{' '}
                      {portsData.healthchecks.item.liveness_probe.failure_threshold}
                    </p>
                  </div>
                </li>
              ) : null}

              {portsData.healthchecks?.item?.readiness_probe && portsData.healthchecks.typeReadiness ? (
                <>
                  {portsData.healthchecks?.item?.liveness_probe && (
                    <hr className="border-t border-dashed border-neutral" />
                  )}
                  <li className="my-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                    <div>
                      <strong className="font-medium text-neutral">Readiness</strong>
                    </div>
                    <div className="space-y-2">
                      <p>
                        <strong className="font-medium text-neutral">Type:</strong>{' '}
                        {portsData.healthchecks.typeReadiness}
                      </p>
                      <p>
                        <strong className="font-medium text-neutral">Initial Delay:</strong>{' '}
                        {portsData.healthchecks.item.readiness_probe.initial_delay_seconds} seconds
                      </p>
                      <p>
                        <strong className="font-medium text-neutral">Period:</strong>{' '}
                        {portsData.healthchecks.item.readiness_probe.period_seconds} seconds
                      </p>
                      <p>
                        <strong className="font-medium text-neutral">Timeout:</strong>{' '}
                        {portsData.healthchecks.item.readiness_probe.timeout_seconds} seconds
                      </p>
                      <p>
                        <strong className="font-medium text-neutral">Success Threshold:</strong>{' '}
                        {portsData.healthchecks.item.readiness_probe.success_threshold}
                      </p>
                      <p>
                        <strong className="font-medium text-neutral">Failure Threshold:</strong>{' '}
                        {portsData.healthchecks.item.readiness_probe.failure_threshold}
                      </p>
                    </div>
                  </li>
                </>
              ) : null}
            </ul>
          </Section>
        ) : null}

        <Section className="rounded-md border border-neutral bg-surface-neutral-subtle p-4">
          <div className="flex justify-between">
            <Heading>Environment variables</Heading>
            <EditSectionButton
              onClick={onEditVariables}
              testId="edit-variables-button"
              label="Edit environment variables"
            />
          </div>
          <ul className="flex list-none flex-col gap-2 text-sm text-neutral-subtle">
            {variablesData.length ? (
              variablesData.map((variable, index) => (
                <li className="grid grid-cols-1 gap-2 md:grid-cols-3" key={`${variable.variable}-${index}`}>
                  <strong className="truncate font-medium text-neutral">
                    {variable.variable} = {variable.isSecret ? '********' : variable.value}
                  </strong>
                  <span>
                    <strong className="font-medium text-neutral">Scope:</strong>{' '}
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
        <Button onClick={onBack} type="button" size="lg" variant="plain" color="neutral">
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
    </Section>
  )
}

export default ApplicationContainerSummaryView
