import { DatabaseModeEnum } from 'qovery-typescript-axios'
import {
  ButtonIcon,
  ButtonIconStyle,
  ButtonLegacy,
  ButtonLegacySize,
  ButtonLegacyStyle,
  Callout,
  Icon,
  IconAwesomeEnum,
} from '@qovery/shared/ui'
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
    <div>
      <div className="mb-10">
        <div className="flex justify-between mb-2 items-center">
          <h3 className="text-neutral-400 text-lg">Ready to install your database</h3>
        </div>
        <p className="text-xs text-neutral-400 mb-2">
          The basic database setup is done, you can now deploy your database or move forward with some advanced setup.
        </p>
      </div>

      <div className="mb-10">
        {props.generalData.mode == DatabaseModeEnum.MANAGED && (
          <Callout.Root className="mb-5" color="yellow">
            <Callout.Icon>
              <Icon name={IconAwesomeEnum.TRIANGLE_EXCLAMATION} />
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
        <div className="flex p-4 w-full border rounded border-neutral-250 bg-neutral-100 mb-2">
          <Icon name={IconAwesomeEnum.CHECK} className="text-green-500 mr-2" />
          <div className="flex-grow mr-2">
            <div className="text-sm text-neutral-400 font-bold mb-2">General information</div>
            <ul className="text-neutral-350 text-sm list-none">
              <li>
                Name: <strong className="font-medium">{props.generalData.name}</strong>
              </li>
              <li>
                Mode:{' '}
                <strong className="font-medium">
                  {props.generalData.mode === DatabaseModeEnum.MANAGED ? 'Managed' : 'Container'}
                </strong>
              </li>
              <li>
                Database type: <strong className="font-medium">{props.generalData.type}</strong>
              </li>
              <li>
                Version: <strong className="font-medium">{props.generalData.version}</strong>
              </li>
              <li>
                Accessibility: <strong className="font-medium">{props.generalData.accessibility}</strong>
              </li>
            </ul>
          </div>

          <ButtonIcon
            onClick={props.gotoGlobalInformation}
            icon={IconAwesomeEnum.WHEEL}
            style={ButtonIconStyle.FLAT}
            className="text-neutral-400 hover:text-neutral-400"
          />
        </div>

        <div className="flex p-4 w-full border rounded border-neutral-250 bg-neutral-100 mb-10">
          <Icon name={IconAwesomeEnum.CHECK} className="text-green-500 mr-2" />
          <div className="flex-grow mr-2">
            <div className="text-sm text-neutral-400 font-bold mb-2">Resources</div>
            <ul className="text-neutral-350 text-sm list-none">
              {props.generalData.mode !== DatabaseModeEnum.MANAGED ? (
                <>
                  <li>
                    CPU: <strong className="font-medium">{props.resourcesData['cpu']}</strong>
                  </li>
                  <li>
                    Memory: <strong className="font-medium">{props.resourcesData.memory} MB</strong>
                  </li>
                </>
              ) : (
                <li>
                  Instance type: <strong className="font-medium">{props.resourcesData.instance_type}</strong>
                </li>
              )}
              <li>
                Storage: <strong className="font-medium">{props.resourcesData.storage} GB</strong>
              </li>
            </ul>
          </div>
          <ButtonIcon
            onClick={props.gotoResources}
            icon={IconAwesomeEnum.WHEEL}
            style={ButtonIconStyle.FLAT}
            className="text-neutral-400 hover:text-neutral-400"
          />
        </div>

        <div className="flex justify-between mt-10">
          <ButtonLegacy
            onClick={props.onPrevious}
            className="btn--no-min-w"
            type="button"
            size={ButtonLegacySize.XLARGE}
            style={ButtonLegacyStyle.STROKED}
          >
            Back
          </ButtonLegacy>
          <div className="flex gap-2">
            <ButtonLegacy
              dataTestId="button-create"
              loading={props.isLoadingCreate}
              onClick={() => props.onSubmit(false)}
              size={ButtonLegacySize.XLARGE}
              style={ButtonLegacyStyle.STROKED}
              className="btn--no-min-w"
            >
              Create
            </ButtonLegacy>
            <ButtonLegacy
              dataTestId="button-create-deploy"
              loading={props.isLoadingCreateAndDeploy}
              onClick={() => props.onSubmit(true)}
              size={ButtonLegacySize.XLARGE}
              style={ButtonLegacyStyle.BASIC}
            >
              Create and deploy
            </ButtonLegacy>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StepSummary
