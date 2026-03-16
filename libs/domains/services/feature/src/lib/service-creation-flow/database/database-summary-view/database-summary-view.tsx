import {
  DatabaseModeEnum,
  type OrganizationAnnotationsGroupResponse,
  type OrganizationLabelsGroupEnrichedResponse,
} from 'qovery-typescript-axios'
import { Button, Callout, Heading, Icon, Section } from '@qovery/shared/ui'
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
            <li>
              <strong className="font-medium text-neutral">Name:</strong> {generalData.name}
            </li>
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
            <li>
              <strong className="font-medium text-neutral">Mode:</strong>{' '}
              {generalData.mode === DatabaseModeEnum.MANAGED ? 'Managed' : 'Container'}
            </li>
            <li>
              <strong className="font-medium text-neutral">Database type:</strong>{' '}
              {generalData.type ? formatDatabaseTypeLabel(generalData.type) : ''}
            </li>
            <li>
              <strong className="font-medium text-neutral">Version:</strong> {generalData.version}
            </li>
            <li>
              <strong className="font-medium text-neutral">Accessibility:</strong> {generalData.accessibility}
            </li>
            {labelsGroup.length > 0 && generalData.labels_groups?.length ? (
              <li>
                <strong className="font-medium text-neutral">Labels group:</strong>{' '}
                {labelsGroup
                  .filter(({ id }) => generalData.labels_groups?.includes(id))
                  .map(({ name }) => name)
                  .join(', ')}
              </li>
            ) : null}
            {annotationsGroup.length > 0 && generalData.annotations_groups?.length ? (
              <li>
                <strong className="font-medium text-neutral">Annotations group:</strong>{' '}
                {annotationsGroup
                  .filter(({ id }) => generalData.annotations_groups?.includes(id))
                  .map(({ name }) => name)
                  .join(', ')}
              </li>
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
              <li>
                <strong className="font-medium text-neutral">Instance type:</strong> {resourcesData.instance_type}
              </li>
            ) : (
              <>
                <li>
                  <strong className="font-medium text-neutral">CPU:</strong> {resourcesData.cpu}
                </li>
                <li>
                  <strong className="font-medium text-neutral">Memory:</strong> {resourcesData.memory} MB
                </li>
              </>
            )}
            {!(isManaged && generalData.type === 'REDIS') ? (
              <li>
                <strong className="font-medium text-neutral">Storage:</strong> {resourcesData.storage} GB
              </li>
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
