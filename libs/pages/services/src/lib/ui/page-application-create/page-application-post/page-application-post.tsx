import { BuildModeEnum } from 'qovery-typescript-axios'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { Button, ButtonIcon, ButtonIconStyle, ButtonSize, ButtonStyle, Icon, IconAwesomeEnum } from '@qovery/shared/ui'
import {
  GeneralData,
  PortData,
  ResourcesData,
} from '../../../feature/page-application-create-feature/application-creation-flow.interface'

export interface PageApplicationPostProps {
  onSubmit: (withDeploy: boolean) => void
  onPrevious: () => void
  generalData: GeneralData
  resourcesData: ResourcesData
  portsData: PortData
  gotoGlobalInformation: () => void
  gotoResources: () => void
  gotoPorts: () => void
  isLoadingCreate: boolean
  isLoadingCreateAndDeploy: boolean
}

export function PageApplicationPost(props: PageApplicationPostProps) {
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
          <div className="mr-auto flex-grow mr-2">
            <div className="text-sm text-text-600 font-bold mb-2">General informations</div>
            <ul className="text-text-400 text-sm list-none">
              <li>
                name: <strong className="font-medium">{props.generalData.name}</strong>
              </li>
              {props.generalData.serviceType === ServiceTypeEnum.APPLICATION && (
                <>
                  <li>
                    repository: <strong className="font-medium">{props.generalData.repository}</strong>
                  </li>
                  <li>
                    branch: <strong>{props.generalData.branch}</strong>
                  </li>
                  <li>
                    root application path: <strong>{props.generalData.root_path}</strong>
                  </li>
                  <li>
                    build mode: <strong>{props.generalData.build_mode}</strong>
                  </li>
                  {props.generalData.build_mode === BuildModeEnum.BUILDPACKS && (
                    <li>
                      buildpack language: <strong>{props.generalData.buildpack_language}</strong>
                    </li>
                  )}
                  {props.generalData.build_mode === BuildModeEnum.DOCKER && (
                    <li>
                      dockerfile path: <strong>{props.generalData.dockerfile_path}</strong>
                    </li>
                  )}
                </>
              )}
              {props.generalData.serviceType === ServiceTypeEnum.CONTAINER && (
                <>
                  <li>
                    registry: <strong className="font-medium">{props.generalData.registry}</strong>
                  </li>
                  <li>
                    image name: <strong>{props.generalData.image_name}</strong>
                  </li>
                  <li>
                    image tag: <strong>{props.generalData.image_tag}</strong>
                  </li>
                  <li>
                    image entrypoint: <strong>{props.generalData.image_entry_point}</strong>
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
            iconClassName="text-element-light-lighter-700"
          />
        </div>

        <div className="flex p-4 w-full border rounded border-element-light-lighter-500 bg-element-light-lighter-200 mb-2">
          <Icon name={IconAwesomeEnum.CHECK} className="text-green-500 mr-2" />
          <div className="mr-auto flex-grow mr-2">
            <div className="text-sm text-text-600 font-bold mb-2">Resources</div>
            <ul className="text-text-400 text-sm list-none">
              <li>
                <strong className="font-medium">CPU:</strong> {props.resourcesData['cpu'][0]}
              </li>
              <li>
                <strong className="font-medium">Memory:</strong> {props.resourcesData.memory}
                {props.resourcesData.memory_unit}
              </li>
              <li>
                <strong className="font-medium">Instances:</strong> {props.resourcesData.instances[0]} -{' '}
                {props.resourcesData.instances[1]}
              </li>
            </ul>
          </div>

          <ButtonIcon
            onClick={props.gotoResources}
            icon={IconAwesomeEnum.WHEEL}
            style={ButtonIconStyle.FLAT}
            iconClassName="text-element-light-lighter-700"
          />
        </div>

        <div className="flex p-4 w-full border rounded border-element-light-lighter-500 bg-element-light-lighter-200 mb-2">
          <Icon name={IconAwesomeEnum.CHECK} className="text-green-500 mr-2" />
          <div className="mr-auto flex-grow mr-2">
            <div className="text-sm text-text-600 font-bold mb-2">Ports</div>
            <ul className="text-text-400 text-sm">
              {props.portsData.ports ? (
                props.portsData.ports?.map((port, index) => (
                  <li key={index}>
                    <strong className="font-medium">application port:</strong> {port.application_port} –{' '}
                    <strong className="font-medium">external port:</strong> {port.external_port} –
                    <strong className="font-medium">public:</strong> {port.is_public ? 'yes' : 'no'}
                  </li>
                ))
              ) : (
                <li>no port declared</li>
              )}
            </ul>
          </div>

          <ButtonIcon
            onClick={props.gotoPorts}
            icon={IconAwesomeEnum.WHEEL}
            style={ButtonIconStyle.FLAT}
            iconClassName="text-element-light-lighter-700"
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
          >
            Just create
          </Button>
          <Button
            dataTestId="button-create-deploy"
            loading={props.isLoadingCreateAndDeploy}
            onClick={() => props.onSubmit(true)}
            size={ButtonSize.XLARGE}
            style={ButtonStyle.BASIC}
          >
            Create and Deploy
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PageApplicationPost
