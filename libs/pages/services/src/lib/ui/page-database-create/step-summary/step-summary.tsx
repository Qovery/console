import {
  DatabaseModeEnum,
  type OrganizationAnnotationsGroupResponse,
  type OrganizationLabelsGroupEnrichedResponse,
} from 'qovery-typescript-axios'
import { Button, Callout, Heading, Icon, Section } from '@qovery/shared/ui'
import {
  type GeneralData,
  type ResourcesData,
} from '../../../feature/page-database-create-feature/database-creation-flow.interface'

export interface StepSummaryProps {
  onSubmit: (withDeploy: boolean) => void
  onPrevious: () => void
  generalData: GeneralData
  resourcesData: ResourcesData
  gotoGlobalInformation: () => void
  gotoResources: () => void
  isLoadingCreate: boolean
  isLoadingCreateAndDeploy: boolean
  labelsGroup?: OrganizationLabelsGroupEnrichedResponse[]
  annotationsGroup?: OrganizationAnnotationsGroupResponse[]
  isManaged?: boolean
}

export function StepSummary(props: StepSummaryProps) {
  return (
    <Section>
      <Heading className="mb-2">Ready to create your Database</Heading>

      <form className="space-y-10">
        <p className="text-sm text-neutral-350">
          The basic database setup is done, you can now deploy your database or move forward with some advanced setup.
        </p>
        {props.generalData.mode === DatabaseModeEnum.MANAGED && (
          <Callout.Root color="yellow">
            <Callout.Icon>
              <Icon iconName="triangle-exclamation" iconStyle="regular" />
            </Callout.Icon>
            <Callout.Text>
              <Callout.TextHeading>Qovery manages this resource for you</Callout.TextHeading>
              <Callout.TextDescription>
                Use exclusively the Qovery console to update the resources managed by Qovery on your cloud account.
                <br /> Do not manually update or upgrade them on the cloud provider console, otherwise you will risk a
                drift in the configuration.
              </Callout.TextDescription>
            </Callout.Text>
          </Callout.Root>
        )}

        <div className="flex flex-col gap-6">
          <Section className="rounded border border-neutral-250 bg-neutral-100 p-4">
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
              <div className="py-2">
                <hr className="border-t border-dashed border-neutral-250" />
              </div>
              <li>
                <strong className="font-medium">Mode:</strong>{' '}
                {props.generalData.mode === DatabaseModeEnum.MANAGED ? 'Managed' : 'Container'}
              </li>
              <li>
                <strong className="font-medium">Database type:</strong> {props.generalData.type}
              </li>
              <li>
                <strong className="font-medium">Version:</strong> {props.generalData.version}
              </li>
              <li>
                <strong className="font-medium">Accessibility:</strong> {props.generalData.accessibility}
              </li>
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

          <Section className="rounded border border-neutral-250 bg-neutral-100 p-4">
            <div className="flex justify-between">
              <Heading>Resources</Heading>
              <Button type="button" variant="plain" size="md" onClick={props.gotoResources}>
                <Icon className="text-base" iconName="gear-complex" />
              </Button>
            </div>
            <ul className="list-none space-y-2 text-sm text-neutral-400">
              {props.generalData.mode !== DatabaseModeEnum.MANAGED ? (
                <>
                  <li>
                    <strong className="font-medium">CPU:</strong> {props.resourcesData['cpu']}
                  </li>
                  <li>
                    <strong className="font-medium">Memory:</strong> {props.resourcesData.memory} MB
                  </li>
                </>
              ) : (
                <li>
                  <strong className="font-medium">Instance type:</strong> {props.resourcesData.instance_type}
                </li>
              )}
              <li>
                <strong className="font-medium">Storage:</strong> {props.resourcesData.storage} GB
              </li>
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
              variant="outline"
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
