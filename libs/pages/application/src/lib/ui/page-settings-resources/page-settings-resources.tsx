import { FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { MemorySizeEnum } from '@console/shared/enums'
import { ApplicationEntity } from '@console/shared/interfaces'
import {
  BlockContent,
  Button,
  ButtonSize,
  ButtonStyle,
  HelpSection,
  Icon,
  IconAwesomeEnum,
  InputSelect,
  InputText,
  Slider,
  WarningBox,
  WarningBoxEnum,
} from '@console/shared/ui'
import { convertCpuToVCpu } from '@console/shared/utils'

export interface PageSettingsResourcesProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  handleChangeMemoryUnit: () => void
  memorySize: MemorySizeEnum
  displayWarningCpu: boolean
  application?: ApplicationEntity
  loading?: boolean
}

export function PageSettingsResources(props: PageSettingsResourcesProps) {
  const { onSubmit, loading, handleChangeMemoryUnit, application, memorySize, displayWarningCpu } = props
  const { control, formState, watch } = useFormContext()

  const pattern = {
    value: /^[0-9]+$/,
    message: 'Please enter a number.',
  }

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
          <BlockContent title="RAM" key={`memory-${memorySize}`}>
            <div className="flex w-full gap-3">
              <div className="w-full">
                <Controller
                  name="memory"
                  control={control}
                  rules={{
                    required: 'Please enter a size.',
                    validate: (value: number) => value <= maxMemoryBySize,
                    max: maxMemoryBySize,
                    pattern: pattern,
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <InputText
                      type="number"
                      dataTestId="input-memory"
                      name={field.name}
                      onChange={field.onChange}
                      value={field.value}
                      label="Size"
                      error={
                        error?.type === 'required'
                          ? 'Please enter a size.'
                          : error?.type === 'max'
                          ? `Maximum allowed memory is: ${maxMemoryBySize} ${memorySize}.`
                          : undefined
                      }
                    />
                  )}
                />
                <p data-testid="current-consumption" className="text-text-400 text-xs mt-1 ml-4">
                  Current consumption:{' '}
                  {application?.memory &&
                    `${
                      application?.memory < 1024
                        ? application?.memory + ` ${MemorySizeEnum.MB}`
                        : application?.memory / 1024 + ` ${MemorySizeEnum.GB}`
                    }`}
                </p>
              </div>
              <InputSelect
                className="w-full h-full"
                onChange={handleChangeMemoryUnit}
                items={Object.values(MemorySizeEnum).map((size) => ({
                  label: size,
                  value: size,
                }))}
                value={memorySize}
                label="Unit"
              />
            </div>
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
