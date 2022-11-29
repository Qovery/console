import { BuildModeEnum } from 'qovery-typescript-axios'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { FlowVariableData } from '@qovery/shared/interfaces'
import { Button, ButtonIcon, ButtonIconStyle, ButtonSize, ButtonStyle, Icon, IconAwesomeEnum } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/utils'
import { GeneralData, ResourcesData } from '../../../feature/page-job-create-feature/job-creation-flow.interface'

export interface PostProps {
  onSubmit: (withDeploy: boolean) => void
  onPrevious: () => void
  generalData: GeneralData
  resourcesData: ResourcesData
  variableData: FlowVariableData
  gotoGlobalInformation: () => void
  gotoResources: () => void
  gotoVariables: () => void
  isLoadingCreate: boolean
  isLoadingCreateAndDeploy: boolean
  selectedRegistryName?: string
}

export function Post(props: PostProps) {
  return (
    <div>
      <div className="mb-10">
        <div className="flex justify-between mb-2 items-center">
          <h3 className="text-text-700 text-lg">Ready to create your Cronjob</h3>
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
                Cronjob name: <strong className="font-medium">{props.generalData.name}</strong>
              </li>
              {props.generalData.serviceType === ServiceTypeEnum.APPLICATION && (
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
              {props.generalData.serviceType === ServiceTypeEnum.CONTAINER && (
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
              <li>
                Port: <strong>{props.generalData.port}</strong>
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
            <div className="text-sm text-text-600 font-bold mb-2">Environment variables</div>
            <ul className="text-text-400 text-sm">
              {props.variableData.variables && props.variableData.variables.length > 0 ? (
                props.variableData.variables?.map((variable, index) => (
                  <li key={index}>
                    <strong className="font-medium">{variable.variable}</strong> ={' '}
                    <strong className="font-medium">{variable.isSecret ? '********' : variable.value}</strong> – Secret:{' '}
                    <strong className="font-medium">{variable.isSecret ? 'Yes' : 'No'}</strong>
                  </li>
                ))
              ) : (
                <li>No variable declared</li>
              )}
            </ul>
          </div>

          <ButtonIcon
            onClick={props.gotoVariables}
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

export default Post
