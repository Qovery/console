import { FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { MemorySizeEnum } from '@qovery/shared/enums'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import {
  BlockContent,
  Button,
  ButtonSize,
  ButtonStyle,
  HelpSection,
  Icon,
  IconAwesomeEnum,
  InputSizeUnit,
  Slider,
  WarningBox,
  WarningBoxEnum,
  inputSizeUnitRules,
} from '@qovery/shared/ui'
import { convertCpuToVCpu } from '@qovery/shared/utils'

export interface PageSettingsResourcesProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  getMemoryUnit: (value: string | MemorySizeEnum) => string
  memorySize: MemorySizeEnum | string
  displayWarningCpu: boolean
  application?: ApplicationEntity
  loading?: boolean
}

export function PageSettingsResources(props: PageSettingsResourcesProps) {
  const { onSubmit, loading, getMemoryUnit, application, memorySize, displayWarningCpu } = props
  const { control, formState, watch } = useFormContext()

  const maxMemoryBySize =
    memorySize === MemorySizeEnum.GB ? (application?.maximum_memory || 0) / 1024 : application?.maximum_memory || 0

  if (!application) return null

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <h2 className="h5 mb-8 text-text-700">Resources</h2>
        <form onSubmit={onSubmit}>
          <p className="text-text-500 text-xs mb-3">Adapt the application's consumption accordingly</p>
          <BlockContent title="vCPU">
            <p className="flex items-center text-text-600 mb-3 font-medium">
              {displayWarningCpu && (
                <Icon name={IconAwesomeEnum.TRIANGLE_EXCLAMATION} className="mr-1.5 text-error-500 text-sm" />
              )}
              {watch('cpu')}
            </p>
            <Controller
              name="cpu"
              control={control}
              // rules={{
              //   max: (application?.cpu || 0) / 1000,
              // }}
              render={({ field }) => (
                <Slider
                  min={0}
                  max={convertCpuToVCpu(application?.maximum_cpu)}
                  step={0.25}
                  onChange={field.onChange}
                  value={field.value}
                />
              )}
            />
            <p className="text-text-400 text-xs mt-3">
              Max consumption by node accordingly to your cluster: {convertCpuToVCpu(application?.maximum_cpu)} vCPU
            </p>
            {displayWarningCpu && (
              <WarningBox
                dataTestId="warning-box"
                className="mt-3"
                title="Not enough resources"
                message="Increase the capacity of your cluster nodes or reduce the service consumption."
                type={WarningBoxEnum.ERROR}
              />
            )}
          </BlockContent>
          <BlockContent title="RAM">
            <Controller
              name="memory"
              control={control}
              rules={inputSizeUnitRules(maxMemoryBySize)}
              render={({ field, fieldState: { error } }) => (
                <InputSizeUnit
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  maxSize={maxMemoryBySize}
                  error={error}
                  currentSize={application?.memory}
                  currentUnit={memorySize}
                  getUnit={getMemoryUnit}
                />
              )}
            />
          </BlockContent>
          <BlockContent title="Instances">
            <p className="text-text-600 mb-3 font-medium">{`${watch('instances')[0]} - ${watch('instances')[1]}`}</p>
            <Controller
              name="instances"
              control={control}
              render={({ field }) => <Slider min={1} max={50} step={1} onChange={field.onChange} value={field.value} />}
            />
            <p className="text-text-400 text-xs mt-3">
              {application?.instances?.items && (
                <span className="flex mb-1">
                  Current consumption: {application.instances.items.length} instance
                  {application.instances.items.length > 1 ? 's' : ''}
                </span>
              )}
              Application auto-scaling is based on real-time CPU consumption. When your app goes above 60% (default) of
              CPU consumption for 5 minutes, your app will be auto-scaled and more instances will be added.
            </p>
          </BlockContent>
          <div className="flex justify-end">
            <Button
              dataTestId="submit-button"
              className="btn--no-min-w"
              size={ButtonSize.LARGE}
              style={ButtonStyle.BASIC}
              type="submit"
              disabled={!formState.isValid}
              loading={loading}
            >
              Save
            </Button>
          </div>
        </form>
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#resources',
            linkLabel: 'How to configure my application',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsResources
