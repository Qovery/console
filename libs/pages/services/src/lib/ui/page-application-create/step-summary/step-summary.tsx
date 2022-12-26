import { BuildModeEnum } from 'qovery-typescript-axios'
import { isApplication, isContainer } from '@qovery/shared/enums'
import { ApplicationGeneralData, ApplicationResourcesData, FlowPortData } from '@qovery/shared/interfaces'
import { Button, ButtonIcon, ButtonIconStyle, ButtonSize, ButtonStyle, Icon, IconAwesomeEnum } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/utils'

export interface StepSummaryProps {
  onSubmit: (withDeploy: boolean) => void
  onPrevious: () => void
  generalData: ApplicationGeneralData
  resourcesData: ApplicationResourcesData
  portsData: FlowPortData
  gotoGlobalInformation: () => void
  gotoResources: () => void
  gotoPorts: () => void
  isLoadingCreate: boolean
  isLoadingCreateAndDeploy: boolean
  selectedRegistryName?: string
}

export function StepSummary(props: StepSummaryProps) {
  return (
    <div>
      <div className="mb-10">
        <div className="flex justify-between mb-2 items-center">
          <h3 className="text-text-700 text-lg">Ready to install your Application</h3>
        </div>
        <p className="text-xs text-text-500 mb-2">
          The basic application setup is done, you can now deploy your application or move forward with some advanced
          setup.
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
              {isApplication(props.generalData.serviceType) && (
                <>
                  <li>
                    Repository: <strong className="font-medium">{props.generalData.repository}</strong>
                  </li>
                  <li>
                    Branch: <strong>{props.generalData.branch}</strong>
                  </li>
                  <li>
                    Root application path: <strong>{props.generalData.root_path}</strong>
                  </li>
                  <li>
                    Build mode: <strong>{upperCaseFirstLetter(props.generalData.build_mode)}</strong>
                  </li>
                  {props.generalData.build_mode === BuildModeEnum.BUILDPACKS && (
                    <li>
                      Buildpack language: <strong>{props.generalData.buildpack_language}</strong>
                    </li>
                  )}
                  {props.generalData.build_mode === BuildModeEnum.DOCKER && (
                    <li>
                      Dockerfile path: <strong>{props.generalData.dockerfile_path}</strong>
                    </li>
                  )}
                </>
              )}
              {isContainer(props.generalData.serviceType) && (
                <>
                  <li>
                    Registry: <strong className="font-medium">{props.selectedRegistryName}</strong>
                  </li>
                  <li>
                    Image name: <strong>{props.generalData.image_name}</strong>
                  </li>
                  <li>
                    Image tag: <strong>{props.generalData.image_tag}</strong>
                  </li>
                  <li>
                    Image entrypoint: <strong>{props.generalData.image_entry_point}</strong>
                  </li>
                  <li>
                    CMD arguments: <strong>{props.generalData.cmd_arguments}</strong>
                  </li>
                </>
              )}
            </ul>
          </div>

          <ButtonIcon
            onClick={props.gotoGlobalInformation}
            icon={IconAwesomeEnum.WHEEL}
            style={ButtonIconStyle.FLAT}
            className="text-text-500 hover:text-text-700"
          />
        </div>

        <div className="flex p-4 w-full border rounded border-element-light-lighter-500 bg-element-light-lighter-200 mb-2">
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
                Instances:{' '}
                <strong className="font-medium">
                  {props.resourcesData.instances[0]} - {props.resourcesData.instances[1]}
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

        <div className="flex p-4 w-full border rounded border-element-light-lighter-500 bg-element-light-lighter-200 mb-2">
          <Icon name={IconAwesomeEnum.CHECK} className="text-green-500 mr-2" />
          <div className="flex-grow mr-2">
            <div className="text-sm text-text-600 font-bold mb-2">Ports</div>
            <ul className="text-text-400 text-sm">
              {props.portsData.ports && props.portsData.ports.length > 0 ? (
                props.portsData.ports?.map((port, index) => (
                  <li key={index}>
                    Application port: <strong className="font-medium">{port.application_port}</strong> – Public port:{' '}
                    <strong className="font-medium">{port.external_port}</strong> – Public:{' '}
                    <strong className="font-medium">{port.is_public ? 'Yes' : 'No'}</strong>
                  </li>
                ))
              ) : (
                <li>No port declared</li>
              )}
            </ul>
          </div>

          <ButtonIcon
            onClick={props.gotoPorts}
            icon={IconAwesomeEnum.WHEEL}
            style={ButtonIconStyle.FLAT}
            className="text-text-500 hover:text-text-700"
          />
        </div>
      </div>

      <div className="flex justify-between">
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
  )
}

export default StepSummary
