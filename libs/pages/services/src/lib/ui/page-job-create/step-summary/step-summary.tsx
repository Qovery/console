import { BuildModeEnum } from 'qovery-typescript-axios'
import { JobType, ServiceTypeEnum } from '@qovery/shared/enums'
import { FlowVariableData, JobConfigureData, JobGeneralData, JobResourcesData } from '@qovery/shared/interfaces'
import { Button, ButtonIcon, ButtonIconStyle, ButtonSize, ButtonStyle, Icon, IconAwesomeEnum } from '@qovery/shared/ui'

export interface StepSummaryProps {
  onSubmit: (withDeploy: boolean) => void
  onPrevious: () => void
  generalData: JobGeneralData
  resourcesData: JobResourcesData
  configureData: JobConfigureData
  variableData: FlowVariableData
  gotoGlobalInformation: () => void
  gotoResources: () => void
  gotoVariables: () => void
  gotoConfigureJob: () => void
  isLoadingCreate: boolean
  isLoadingCreateAndDeploy: boolean
  selectedRegistryName?: string
  jobType: JobType
}

export function StepSummary(props: StepSummaryProps) {
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
            <div className="text-sm text-text-600 font-bold mb-5">General informations</div>

            <div className="text-text-600 text-ssm mb-2 font-medium">General</div>

            <ul className="text-text-400 text-sm list-none">
              <li>{props.generalData.name}</li>
              <li>{props.generalData.description}</li>
            </ul>

            <div className="my-4 border-b border-element-light-lighter-500 border-dashed" />

            {props.generalData.serviceType === ServiceTypeEnum.APPLICATION && (
              <>
                <div className="text-text-600 text-ssm mb-2 font-medium">
                  For application created from a Git provider
                </div>
                <ul className="text-text-400 text-sm list-none">
                  <li>{props.generalData.repository}</li>
                  <li>{props.generalData.branch}</li>
                  <li>{props.generalData.root_path}</li>
                  {props.generalData.build_mode === BuildModeEnum.DOCKER && (
                    <li>{props.generalData.dockerfile_path}</li>
                  )}
                </ul>
              </>
            )}
            {props.generalData.serviceType === ServiceTypeEnum.CONTAINER && (
              <>
                <div className="text-text-600 text-ssm mb-2 font-medium">For application created from a Registry</div>
                <ul className="text-text-400 text-sm list-none">
                  <li>{props.selectedRegistryName}</li>
                  <li>Image name: {props.generalData.image_name}</li>
                  <li>Image tag: {props.generalData.image_tag}</li>
                  <li>Image entrypoint: {props.generalData.image_entry_point}</li>
                  <li>CMD arguments: {props.configureData.cmd_arguments}</li>
                </ul>
              </>
            )}
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
            <div className="text-sm text-text-600 font-bold mb-5">Configure job</div>

            {props.jobType === ServiceTypeEnum.LIFECYCLE_JOB && (
              <>
                <div className="text-text-600 text-ssm mb-2 font-medium">Lifecycle job</div>
                <ul className="text-text-400 text-sm list-none">
                  {props.configureData.on_start?.enabled && (
                    <li>
                      On start – Entrypoint: {props.configureData.on_start?.entrypoint || 'null'} / CMD:{' '}
                      {props.configureData.on_start?.arguments || 'null'}
                    </li>
                  )}
                  {props.configureData.on_stop?.enabled && (
                    <li>
                      On Stop – Entrypoint: {props.configureData.on_stop?.entrypoint || 'null'} / CMD:{' '}
                      {props.configureData.on_stop?.arguments || 'null'}
                    </li>
                  )}
                  {props.configureData.on_delete?.enabled && (
                    <li>
                      On Delete – Entrypoint: {props.configureData.on_delete?.entrypoint || 'null'} / CMD:{' '}
                      {props.configureData.on_delete?.arguments || 'null'}
                    </li>
                  )}
                </ul>
              </>
            )}

            {props.jobType === ServiceTypeEnum.CRON_JOB && (
              <>
                <div className="text-text-600 text-ssm mb-2 font-medium">CRON</div>
                <ul className="text-text-400 text-sm list-none">
                  <li>{props.configureData.schedule}</li>
                  {props.configureData.image_entry_point && <li>{props.configureData.image_entry_point}</li>}
                  {props.configureData.cmd_arguments && <li>{props.configureData.cmd_arguments}</li>}
                </ul>
              </>
            )}

            <div className="my-4 border-b border-element-light-lighter-500 border-dashed" />

            <div className="text-text-600 text-ssm mb-2 font-medium">Parameters</div>

            <ul className="text-text-400 text-sm list-none">
              <li>Max restarts: {props.configureData.nb_restarts}</li>
              <li>Max duration: {props.configureData.max_duration}</li>
              <li>Port: {props.configureData.port}</li>
            </ul>
          </div>

          <ButtonIcon
            onClick={props.gotoConfigureJob}
            icon={IconAwesomeEnum.WHEEL}
            style={ButtonIconStyle.FLAT}
            className="text-text-500 hover:text-text-700"
          />
        </div>

        <div className="flex p-4 w-full border rounded border-element-light-lighter-500 bg-element-light-lighter-200 mb-2">
          <Icon name={IconAwesomeEnum.CHECK} className="text-green-500 mr-2" />
          <div className="flex-grow mr-2">
            <div className="text-sm text-text-600 font-bold mb-5">Resources</div>

            <div className="text-text-600 text-ssm mb-2 font-medium">Parameters</div>
            <ul className="text-text-400 text-sm list-none">
              <li>CPU: {props.resourcesData['cpu'][0]}</li>
              <li>Memory: {props.resourcesData.memory} MB</li>
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
            <div className="text-sm text-text-600 font-bold mb-5">Environment variables</div>

            <div className="text-text-600 text-ssm mb-2 font-medium">
              Parameters{' '}
              {props.variableData.variables && props.variableData.variables.length
                ? `(${props.variableData.variables.length})`
                : ''}
            </div>
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

export default StepSummary
