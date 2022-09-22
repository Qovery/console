import { useEffect } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { ButtonIcon, ButtonIconStyle, IconAwesomeEnum, InputText, InputToggle } from '@qovery/shared/ui'
import { PortData } from '../../../../feature/page-application-create-feature/application-creation-flow.interface'

export interface PortRowProps {
  index: number
  onDelete: (index: number) => void
}

export function PortRow(props: PortRowProps) {
  const { index } = props
  const { control, watch, setValue, resetField } = useFormContext<PortData>()

  const isPublicWatch = watch(`ports.${index}.is_public`)

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
        render={({ field, fieldState: { error } }) => (
          <InputText
            className="flex-grow"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label={`Application Port ${index + 1}`}
            error={error?.message}
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
            value={field.value}
            label={`External Port ${index + 1}`}
            error={error?.message}
            type="number"
            disabled
          />
        )}
      />
      <Controller
        name={`ports.${index}.is_public`}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <InputToggle onChange={field.onChange} value={field.value} title={'Public'} />
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
