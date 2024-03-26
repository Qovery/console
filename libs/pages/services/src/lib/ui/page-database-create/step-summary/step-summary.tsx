import { DatabaseModeEnum } from 'qovery-typescript-axios'
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
  isManaged?: boolean
}

export function StepSummary(props: StepSummaryProps) {
  return (
    <Section>
      <Heading className="mb-2">Ready to create your Database</Heading>

      <form className="space-y-10">
        <div>
          <p className="text-neutral-350 text-sm">
            The basic database setup is done, you can now deploy your database or move forward with some advanced setup.
          </p>
          {props.generalData.mode == DatabaseModeEnum.MANAGED && (
            <Callout.Root className="mb-5" color="yellow">
              <Callout.Icon>
                <Icon iconName="triangle-exclamation" />
              </Callout.Icon>
              <Callout.Text>
                <Callout.TextHeading>Qovery manages this resource for you</Callout.TextHeading>
                <Callout.TextDescription className="text-xs">
                  Use exclusively the Qovery console to update the resources managed by Qovery on your cloud account.
                  <br /> Do not manually update or upgrade them on the cloud provider console, otherwise you will risk a
                  drift in the configuration.
                </Callout.TextDescription>
              </Callout.Text>
            </Callout.Root>
          )}
        </div>

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
            </ul>
          </Section>

          <Section className="p-4 border rounded border-neutral-250 bg-neutral-100">
            <div className="flex justify-between">
              <Heading>Resources</Heading>
              <Button type="button" variant="plain" size="md" onClick={props.gotoResources}>
                <Icon className="text-base" iconName="gear-complex" />
              </Button>
            </div>
            <ul className="space-y-2 text-neutral-400 text-sm list-none">
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
              variant="outline"
            >
              Create
            </Button>
            <Button
              data-testid="button-create-deploy"
              loading={props.isLoadingCreateAndDeploy}
              onClick={() => props.onSubmit(true)}
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
