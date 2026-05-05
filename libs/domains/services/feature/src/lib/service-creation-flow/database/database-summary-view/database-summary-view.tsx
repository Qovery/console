import {
  DatabaseModeEnum,
  type OrganizationAnnotationsGroupResponse,
  type OrganizationLabelsGroupEnrichedResponse,
} from 'qovery-typescript-axios'
import { Button, Callout, Heading, Icon, Section, SummaryValue } from '@qovery/shared/ui'
import {
  type DatabaseCreateGeneralData,
  type DatabaseCreateResourcesData,
  formatDatabaseTypeLabel,
} from '../database-create-utils/database-create-utils'

export interface DatabaseSummaryViewProps {
  generalData: DatabaseCreateGeneralData
  resourcesData: DatabaseCreateResourcesData
  labelsGroup: OrganizationLabelsGroupEnrichedResponse[]
  annotationsGroup: OrganizationAnnotationsGroupResponse[]
  onEditGeneral: () => void
  onEditResources: () => void
  onBack: () => void
  onSubmit: (withDeploy: boolean) => void
  isLoadingCreate: boolean
  isLoadingCreateAndDeploy: boolean
}

function EditSectionButton({ onClick, label, testId }: { onClick: () => void; label: string; testId: string }) {
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

export function DatabaseSummaryView({
  generalData,
  resourcesData,
  labelsGroup,
  annotationsGroup,
  onEditGeneral,
  onEditResources,
  onBack,
  onSubmit,
  isLoadingCreate,
  isLoadingCreateAndDeploy,
}: DatabaseSummaryViewProps) {
  const isManaged = generalData.mode === DatabaseModeEnum.MANAGED

  return (
    <Section className="space-y-10">
      <div className="flex flex-col gap-2">
        <Heading className="mb-2">Ready to create your Database</Heading>
        <p className="text-sm text-neutral-subtle">
          The basic database setup is done, you can now deploy your database or move forward with some advanced setup.
        </p>
      </div>

      {isManaged ? (
        <Callout.Root color="yellow">
          <Callout.Icon>
            <Icon iconName="triangle-exclamation" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>
            <Callout.TextHeading>Qovery manages this resource for you</Callout.TextHeading>
            <Callout.TextDescription>
              Use exclusively the Qovery console to update the resources managed by Qovery on your cloud account.
              <br />
              Do not manually update or upgrade them on the cloud provider console, otherwise you will risk a drift in
              the configuration.
            </Callout.TextDescription>
          </Callout.Text>
        </Callout.Root>
      ) : null}

      <div className="flex flex-col gap-6">
        <Section className="rounded-md border border-neutral bg-surface-neutral-subtle p-4">
          <div className="flex justify-between">
            <Heading>General information</Heading>
            <EditSectionButton onClick={onEditGeneral} label="Edit general information" testId="edit-general-button" />
          </div>
          <ul className="list-none space-y-2 text-sm text-neutral-subtle">
            <SummaryValue label="Name" value={generalData.name} />
            {generalData.description ? (
              <li>
                <strong className="font-medium text-neutral">Description:</strong>
                <br />
                {generalData.description}
              </li>
            ) : null}
            <li className="py-2">
              <hr className="border-t border-dashed border-neutral" />
            </li>
            <SummaryValue
              label="Mode"
              value={generalData.mode === DatabaseModeEnum.MANAGED ? 'Managed' : 'Container'}
            />
            <SummaryValue
              label="Database type"
              value={generalData.type ? formatDatabaseTypeLabel(generalData.type) : ''}
            />
            <SummaryValue label="Version" value={generalData.version} />
            <SummaryValue label="Accessibility" value={generalData.accessibility} />
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
            <EditSectionButton onClick={onEditResources} label="Edit resources" testId="edit-resources-button" />
          </div>
          <ul className="list-none space-y-2 text-sm text-neutral-subtle">
            {isManaged ? (
              <SummaryValue label="Instance type" value={resourcesData.instance_type} />
            ) : (
              <>
                <SummaryValue label="CPU" value={resourcesData.cpu} />
                <SummaryValue label="Memory" value={`${resourcesData.memory} MB`} />
              </>
            )}
            {!(isManaged && generalData.type === 'REDIS') ? (
              <SummaryValue label="Storage" value={`${resourcesData.storage} GB`} />
            ) : null}
          </ul>
        </Section>
      </div>

      <div className="flex justify-between">
        <Button onClick={onBack} type="button" size="lg" variant="plain">
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            data-testid="button-create"
            loading={isLoadingCreate}
            onClick={() => onSubmit(false)}
            size="lg"
            type="button"
            variant="outline"
          >
            Create
          </Button>
          <Button
            data-testid="button-create-deploy"
            loading={isLoadingCreateAndDeploy}
            onClick={() => onSubmit(true)}
            type="button"
            size="lg"
          >
            Create and deploy
          </Button>
        </div>
      </div>
    </Section>
  )
}

export default DatabaseSummaryView
