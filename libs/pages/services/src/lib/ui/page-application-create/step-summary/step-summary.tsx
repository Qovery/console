import { BuildModeEnum } from 'qovery-typescript-axios'
import { ProbeTypeEnum, isApplication, isContainer } from '@qovery/shared/enums'
import {
  type ApplicationGeneralData,
  type ApplicationResourcesData,
  type FlowPortData,
} from '@qovery/shared/interfaces'
import { Button, ButtonIcon, ButtonIconStyle, ButtonSize, ButtonStyle, Icon, IconAwesomeEnum } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

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

export function StepSummary({
  onSubmit,
  onPrevious,
  generalData,
  resourcesData,
  portsData,
  gotoGlobalInformation,
  gotoResources,
  gotoPorts,
  isLoadingCreate,
  isLoadingCreateAndDeploy,
  selectedRegistryName,
}: StepSummaryProps) {
  return (
    <div>
      <div className="mb-10">
        <div className="flex justify-between mb-2 items-center">
          <h3 className="text-neutral-400 text-lg">Ready to install your Application</h3>
        </div>
        <p className="text-xs text-neutral-400 mb-2">
          The basic application setup is done, you can now deploy your application or move forward with some advanced
          setup.
        </p>
      </div>

      <div className="mb-10">
        <div className="flex p-4 w-full border rounded border-neutral-250 bg-neutral-100 mb-2">
          <Icon name={IconAwesomeEnum.CHECK} className="text-green-500 mr-2" />
          <div className="flex-grow mr-2">
            <div className="text-sm text-neutral-400 font-bold mb-2">General information</div>
            <ul className="text-neutral-350 text-sm list-none">
              <li>
                Name: <strong className="font-medium">{generalData.name}</strong>
              </li>
              {isApplication(generalData.serviceType) && (
                <>
                  <li>
                    Repository: <strong className="font-medium">{generalData.repository}</strong>
                  </li>
                  <li>
                    Branch: <strong>{generalData.branch}</strong>
                  </li>
                  <li>
                    Root application path: <strong>{generalData.root_path}</strong>
                  </li>
                  <li>
                    Build mode: <strong>{upperCaseFirstLetter(generalData.build_mode)}</strong>
                  </li>
                  {generalData.build_mode === BuildModeEnum.BUILDPACKS && (
                    <li>
                      Buildpack language: <strong>{generalData.buildpack_language}</strong>
                    </li>
                  )}
                  {generalData.build_mode === BuildModeEnum.DOCKER && (
                    <li>
                      Dockerfile path: <strong>{generalData.dockerfile_path}</strong>
                    </li>
                  )}
                </>
              )}
              {isContainer(generalData.serviceType) && (
                <>
                  <li>
                    Registry: <strong className="font-medium">{selectedRegistryName}</strong>
                  </li>
                  <li>
                    Image name: <strong>{generalData.image_name}</strong>
                  </li>
                  <li>
                    Image tag: <strong>{generalData.image_tag}</strong>
                  </li>
                </>
              )}
              <li>
                Image entrypoint: <strong>{generalData.image_entry_point}</strong>
              </li>
              <li>
                CMD arguments: <strong>{generalData.cmd_arguments}</strong>
              </li>
            </ul>
          </div>

          <ButtonIcon
            onClick={gotoGlobalInformation}
            icon={IconAwesomeEnum.WHEEL}
            style={ButtonIconStyle.FLAT}
            className="text-neutral-400 hover:text-neutral-400"
          />
        </div>

        <div className="flex p-4 w-full border rounded border-neutral-250 bg-neutral-100 mb-2">
          <Icon name={IconAwesomeEnum.CHECK} className="text-green-500 mr-2" />
          <div className="flex-grow mr-2">
            <div className="text-sm text-neutral-400 font-bold mb-2">Resources</div>
            <ul className="text-neutral-350 text-sm list-none">
              <li>
                CPU: <strong className="font-medium">{resourcesData['cpu']}</strong>
              </li>
              <li>
                Memory: <strong className="font-medium">{resourcesData.memory} MB</strong>
              </li>
              <li>
                Instances:{' '}
                <strong className="font-medium">
                  {resourcesData.instances[0]} - {resourcesData.instances[1]}
                </strong>
              </li>
            </ul>
          </div>

          <ButtonIcon
            onClick={gotoResources}
            icon={IconAwesomeEnum.WHEEL}
            style={ButtonIconStyle.FLAT}
            className="text-neutral-400 hover:text-neutral-400"
          />
        </div>

        <div className="flex p-4 w-full border rounded border-neutral-250 bg-neutral-100 mb-2">
          <Icon name={IconAwesomeEnum.CHECK} className="text-green-500 mr-2" />
          <div className="flex-grow mr-2">
            <div className="text-sm text-neutral-400 font-bold mb-2">Ports</div>
            <ul className="text-neutral-350 text-sm">
              {portsData.ports && portsData.ports.length > 0 ? (
                <>
                  {portsData.ports?.map((port, index) => (
                    <li key={index}>
                      Application port: <strong className="font-medium">{port.application_port}</strong>– Protocol:{' '}
                      <strong className="font-medium">{port.protocol}</strong>
                      {port.is_public && (
                        <>
                          – Public port: <strong className="font-medium">{port.external_port}</strong>
                        </>
                      )}{' '}
                      {port.is_public && (
                        <>
                          – Port name: <strong className="font-medium">{port.name}</strong>
                        </>
                      )}{' '}
                      – Public: <strong className="font-medium">{port.is_public ? 'Yes' : 'No'}</strong>
                    </li>
                  ))}
                  {portsData.healthchecks?.item && portsData.healthchecks?.item.readiness_probe && (
                    <>
                      {portsData.healthchecks.item.liveness_probe &&
                        portsData.healthchecks.typeLiveness !== ProbeTypeEnum.NONE && (
                          <li className="flex flex-col mt-1">
                            <span className="font-bold text-neutral-400">Liveness</span>
                            <ul className="relative border-l border-neutral-250 mt-2 mb-1">
                              <li className="pl-5">
                                Type: <strong className="font-medium">{portsData.healthchecks.typeLiveness}</strong>
                              </li>
                              <li className="pl-5 mt-1">
                                Initial Delay:{' '}
                                <strong className="font-medium">
                                  {portsData.healthchecks.item.liveness_probe.initial_delay_seconds} seconds
                                </strong>
                              </li>
                              <li className="pl-5 mt-1">
                                Period:{' '}
                                <strong className="font-medium">
                                  {portsData.healthchecks.item.liveness_probe.period_seconds} seconds
                                </strong>
                              </li>
                              <li className="pl-5 mt-1">
                                Timeout:{' '}
                                <strong className="font-medium">
                                  {portsData.healthchecks.item.liveness_probe.timeout_seconds} seconds
                                </strong>
                              </li>
                              <li className="pl-5 mt-1">
                                Success Threshold:{' '}
                                <strong className="font-medium">
                                  {portsData.healthchecks.item.liveness_probe.success_threshold}
                                </strong>
                              </li>
                              <li className="pl-5 mt-1">
                                Failure Threshold:{' '}
                                <strong className="font-medium">
                                  {portsData.healthchecks.item.liveness_probe.failure_threshold}
                                </strong>
                              </li>
                            </ul>
                          </li>
                        )}
                      {portsData.healthchecks.item.readiness_probe &&
                        portsData.healthchecks.typeReadiness !== ProbeTypeEnum.NONE && (
                          <li className="flex flex-col mt-1">
                            <span className="font-bold text-neutral-400">Readiness</span>
                            <ul className="relative border-l border-neutral-250 mt-2 mb-1">
                              <li className="pl-5">
                                Type: <strong className="font-medium">{portsData.healthchecks.typeReadiness}</strong>
                              </li>
                              <li className="pl-5 mt-1">
                                Initial Delay:{' '}
                                <strong className="font-medium">
                                  {portsData.healthchecks.item.readiness_probe.initial_delay_seconds} seconds
                                </strong>
                              </li>
                              <li className="pl-5 mt-1">
                                Period:{' '}
                                <strong className="font-medium">
                                  {portsData.healthchecks.item.readiness_probe.period_seconds} seconds
                                </strong>
                              </li>
                              <li className="pl-5 mt-1">
                                Timeout:{' '}
                                <strong className="font-medium">
                                  {portsData.healthchecks.item.readiness_probe.timeout_seconds} seconds
                                </strong>
                              </li>
                              <li className="pl-5 mt-1">
                                Success Threshold:{' '}
                                <strong className="font-medium">
                                  {portsData.healthchecks.item.readiness_probe.success_threshold}
                                </strong>
                              </li>
                              <li className="pl-5 mt-1">
                                Failure Threshold:{' '}
                                <strong className="font-medium">
                                  {portsData.healthchecks.item.readiness_probe.failure_threshold}
                                </strong>
                              </li>
                            </ul>
                          </li>
                        )}
                    </>
                  )}
                </>
              ) : (
                <li>No port declared</li>
              )}
            </ul>
          </div>

          <ButtonIcon
            onClick={gotoPorts}
            icon={IconAwesomeEnum.WHEEL}
            style={ButtonIconStyle.FLAT}
            className="text-neutral-400 hover:text-neutral-400"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          onClick={onPrevious}
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
            loading={isLoadingCreate}
            onClick={() => onSubmit(false)}
            size={ButtonSize.XLARGE}
            style={ButtonStyle.STROKED}
            className="btn--no-min-w"
          >
            Create
          </Button>
          <Button
            dataTestId="button-create-deploy"
            loading={isLoadingCreateAndDeploy}
            onClick={() => onSubmit(true)}
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
