import { ClusterGeneralData, ClusterResourcesData } from '@qovery/shared/interfaces'
import { Button, ButtonIcon, ButtonIconStyle, ButtonSize, ButtonStyle, Icon, IconAwesomeEnum } from '@qovery/shared/ui'

export interface StepSummaryProps {
  onSubmit: (withDeploy: boolean) => void
  onPrevious: () => void
  generalData: ClusterGeneralData
  resourcesData: ClusterResourcesData
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
        <div
          data-testid="summary-general"
          className="flex p-4 w-full border rounded border-element-light-lighter-500 bg-element-light-lighter-200 mb-2"
        >
          <Icon name={IconAwesomeEnum.CHECK} className="text-green-500 mr-2" />
          <div className="flex-grow mr-2">
            <div className="text-sm text-text-600 font-bold mb-2">General informations</div>
            <ul className="text-text-400 text-sm list-none">
              <li>
                Cluster name: <strong className="font-medium">{props.generalData.name}</strong>
              </li>
              <li>
                Provider:{' '}
                <strong className="font-medium">
                  {props.generalData.cloud_provider} <Icon name={props.generalData.cloud_provider} />
                </strong>
              </li>
              <li>
                Region: <strong className="font-medium">{props.generalData.region}</strong>
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

        <div
          data-testid="summary-resources"
          className="flex p-4 w-full border rounded border-element-light-lighter-500 bg-element-light-lighter-200 mb-10"
        >
          <Icon name={IconAwesomeEnum.CHECK} className="text-green-500 mr-2" />
          <div className="flex-grow mr-2">
            <div className="text-sm text-text-600 font-bold mb-2">Resources</div>
            <ul className="text-text-400 text-sm list-none">
              <li>
                Cluster type: <strong className="font-medium">{props.resourcesData.cluster_type}</strong>
              </li>
              <li>
                Instance type: <strong className="font-medium">{props.resourcesData.instance_type}</strong>
              </li>
              <li>
                Disk size: <strong className="font-medium">{props.resourcesData.disk_size} GB</strong>
              </li>
              <li>
                Nodes:
                <strong className="font-medium">
                  min {props.resourcesData.nodes[0]} - max {props.resourcesData.nodes[1]}
                </strong>
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

        <div
          data-testid="summary-features"
          className="flex p-4 w-full border rounded border-element-light-lighter-500 bg-element-light-lighter-200 mb-10"
        >
          <Icon name={IconAwesomeEnum.CHECK} className="text-green-500 mr-2" />
          <div className="flex-grow mr-2">
            <div className="text-sm text-text-600 font-bold mb-2">Features</div>
            <ul className="text-text-400 text-sm list-none">
              {/* {featuresData.map((feature) => (
                <li>
                  {feature.id}
                  {feature.value ? (
                    <>
                      :<strong className="font-medium">{feature.value}</strong>
                    </>
                  ) : (
                    ''
                  )}
                </li>
              ))} */}
            </ul>
          </div>
          <ButtonIcon
            onClick={props.gotoResources}
            icon={IconAwesomeEnum.WHEEL}
            style={ButtonIconStyle.FLAT}
            className="text-text-500 hover:text-text-700"
          />
        </div>

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
              Create and install
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StepSummary
