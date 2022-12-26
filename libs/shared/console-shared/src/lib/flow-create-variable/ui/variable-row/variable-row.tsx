import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { FlowVariableData } from '@qovery/shared/interfaces'
import {
  ButtonIcon,
  ButtonIconStyle,
  ButtonSize,
  IconAwesomeEnum,
  InputSelectSmall,
  InputTextSmall,
  InputToggle,
} from '@qovery/shared/ui'

export interface VariableRowProps {
  index: number
  onDelete: (index: number) => void
  availableScopes: APIVariableScopeEnum[]
  gridTemplateColumns?: string
}

export function VariableRow(props: VariableRowProps) {
  const { index, availableScopes, gridTemplateColumns = '6fr 6fr 204px 2fr 1fr 1fr' } = props
  const { control, trigger, watch } = useFormContext<FlowVariableData>()
  const watchSecret = watch().variables[index]?.isSecret

  const pattern = /^[^\s]+$/

  return (
    <div data-testid="variable-row" className="w-full items-center mb-3">
      <div key={index} data-testid="form-row" className="grid mb-3" style={{ gridTemplateColumns }}>
        <Controller
          name={`variables.${index}.variable`}
          control={control}
          rules={{
            required: 'Please enter a value.',
            pattern: {
              value: pattern,
              message: 'Variable name cannot contain spaces.',
            },
          }}
          render={({ field, fieldState: { error } }) => (
            <InputTextSmall
              className="shrink-0 grow flex-1 mr-3"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
              label={'Variable'}
              errorMessagePosition="left"
            />
          )}
        />

        <Controller
          name={`variables.${index}.value`}
          control={control}
          rules={{
            required: 'Please enter a value.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputTextSmall
              className="shrink-0 grow flex-1 mr-3"
              data-testid="value"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
              errorMessagePosition="left"
              type={watchSecret ? 'password' : 'text'}
              hasShowPasswordButton={watchSecret}
            />
          )}
        />

        <Controller
          name={`variables.${index}.scope`}
          control={control}
          render={({ field }) => (
            <InputSelectSmall
              data-testid="scope"
              className="w-[188px]"
              name={field.name}
              defaultValue={field.value}
              onChange={(e) => {
                field.onChange(e)
                trigger(`variables.${index}.value`).then()
              }}
              items={availableScopes.map((s) => ({ value: s, label: s.toLowerCase() }))}
            />
          )}
        />

        <div className="flex items-center justify-center w-14 ml-1">
          <Controller
            name={`variables.${index}.isSecret`}
            control={control}
            render={({ field }) => <InputToggle small value={field.value} onChange={field.onChange} />}
          />
        </div>

        <div className="flex items-center h-full w-full grow">
          <ButtonIcon
            icon={IconAwesomeEnum.TRASH}
            style={ButtonIconStyle.STROKED}
            size={ButtonSize.TINY}
            onClick={() => props.onDelete(index)}
            className="text-text-400 hover:text-text-500 !w-8 !h-8"
            iconClassName="!text-xs"
          />
        </div>
      </div>
    </div>
  )
}

export default VariableRow
