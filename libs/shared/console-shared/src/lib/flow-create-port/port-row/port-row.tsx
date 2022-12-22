import { useEffect } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { FlowPortData } from '@qovery/shared/interfaces'
import { ButtonIcon, ButtonIconStyle, Icon, IconAwesomeEnum, InputText, InputToggle, Tooltip } from '@qovery/shared/ui'

export interface PortRowProps {
  index: number
  onDelete: (index: number) => void
}

export function PortRow(props: PortRowProps) {
  const { index } = props
  const { control, watch, setValue, resetField } = useFormContext<FlowPortData>()

  const isPublicWatch = watch(`ports.${index}.is_public`)
  const externalPortWatch = watch(`ports.${index}.external_port`)

  useEffect(() => {
    setValue(`ports.${index}.external_port`, isPublicWatch ? 443 : undefined)
  }, [isPublicWatch, index, setValue, resetField])

  return (
    <div data-testid={'port-row'} className="flex gap-3 mb-5 w-full items-center">
      <Controller
        name={`ports.${index}.application_port`}
        control={control}
        rules={{
          required: 'Please enter a value',
        }}
        render={({ field }) => (
          <InputText
            className="flex-grow"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label={`Application port`}
            type="number"
          />
        )}
      />
      <Controller
        name={`ports.${index}.external_port`}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <InputText
            className="flex-grow"
            name={field.name}
            onChange={field.onChange}
            value={externalPortWatch} // passing a watch here because setValue with undefined does not work: https://github.com/react-hook-form/react-hook-form/issues/8133
            label={`External port`}
            error={error?.message}
            type="number"
            disabled
            rightElement={
              <Tooltip content="Only HTTP protocol is supported">
                <div>
                  <Icon name={IconAwesomeEnum.CIRCLE_INFO} className="text-text-400" />
                </div>
              </Tooltip>
            }
          />
        )}
      />
      <Controller
        name={`ports.${index}.is_public`}
        control={control}
        render={({ field }) => (
          <InputToggle small onChange={field.onChange} value={field.value} title="Publicly exposed" />
        )}
      />
      <ButtonIcon
        dataTestId="delete-port"
        className="text-text-500"
        style={ButtonIconStyle.FLAT}
        icon={IconAwesomeEnum.TRASH}
        onClick={() => props.onDelete(index)}
      />
    </div>
  )
}

export default PortRow
