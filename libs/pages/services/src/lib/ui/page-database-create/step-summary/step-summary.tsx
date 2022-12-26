import { DatabaseModeEnum } from 'qovery-typescript-axios'
import { Button, ButtonIcon, ButtonIconStyle, ButtonSize, ButtonStyle, Icon, IconAwesomeEnum } from '@qovery/shared/ui'
import {
  GeneralData,
  ResourcesData,
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
}

export function StepSummary(props: StepSummaryProps) {
  return (
    <div>
      <div className="mb-10">
        <div className="flex justify-between mb-2 items-center">
          <h3 className="text-text-700 text-lg">Ready to install your database</h3>
        </div>
        <p className="text-xs text-text-500 mb-2">
          The basic database setup is done, you can now deploy your database or move forward with some advanced setup.
        </p>
      </div>

      <div className="mb-10">
        <div className="flex p-4 w-full border rounded border-element-light-lighter-500 bg-element-light-lighter-200 mb-2">
          <Icon name={IconAwesomeEnum.CHECK} className="text-green-500 mr-2" />
          <div className="flex-grow mr-2">
            <div className="text-sm text-text-600 font-bold mb-2">General informations</div>
            <ul className="text-text-400 text-sm list-none">
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
            className="text-text-500 hover:text-text-700"
          />
        </div>

        {props.generalData.mode !== DatabaseModeEnum.MANAGED && (
          <div className="flex p-4 w-full border rounded border-element-light-lighter-500 bg-element-light-lighter-200 mb-10">
            <Icon name={IconAwesomeEnum.CHECK} className="text-green-500 mr-2" />
            <div className="flex-grow mr-2">
              <div className="text-sm text-text-600 font-bold mb-2">Resources</div>
              <ul className="text-text-400 text-sm list-none">
                <li>
                  CPU: <strong className="font-medium">{props.resourcesData['cpu'][0]}</strong>
                </li>
                <li>
                  Memory: <strong className="font-medium">{props.resourcesData.memory} MB</strong>
                </li>
                <li>
                  Storage: <strong className="font-medium">{props.resourcesData.storage} GB</strong>
                </li>
              </ul>
            </div>
            <ButtonIcon
              onClick={props.gotoResources}
              icon={IconAwesomeEnum.WHEEL}
              style={ButtonIconStyle.FLAT}
              className="text-text-500 hover:text-text-700"
            />
          </div>
        )}

        <div className="flex justify-between mt-10">
          <Button
            onClick={props.onPrevious}
            className="btn--no-min-w"
            type="button"
            size={ButtonSize.XLARGE}
            style={ButtonStyle.STROKED}
          >
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              dataTestId="button-create"
              loading={props.isLoadingCreate}
              onClick={() => props.onSubmit(false)}
              size={ButtonSize.XLARGE}
              style={ButtonStyle.STROKED}
              className="btn--no-min-w"
            >
              Create
            </Button>
            <Button
              dataTestId="button-create-deploy"
              loading={props.isLoadingCreateAndDeploy}
              onClick={() => props.onSubmit(true)}
              size={ButtonSize.XLARGE}
              style={ButtonStyle.BASIC}
            >
              Create and deploy
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StepSummary
