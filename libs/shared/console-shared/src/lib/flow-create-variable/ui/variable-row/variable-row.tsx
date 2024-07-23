import { type APIVariableScopeEnum } from 'qovery-typescript-axios'
import { useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { type FlowVariableData } from '@qovery/shared/interfaces'
import {
  Button,
  ButtonIcon,
  ButtonIconStyle,
  ButtonLegacySize,
  CodeEditor,
  Icon,
  IconAwesomeEnum,
  InputSelectSmall,
  InputTextSmall,
  InputToggle,
  Tooltip,
} from '@qovery/shared/ui'
import { generateScopeLabel } from '@qovery/shared/util-js'

export interface VariableRowProps {
  index: number
  onDelete: (index: number) => void
  availableScopes: APIVariableScopeEnum[]
  gridTemplateColumns?: string
}

export function VariableRow(props: VariableRowProps) {
  const { index, availableScopes, gridTemplateColumns = '6fr 6fr 204px 2fr 1fr 1fr' } = props
  const { control, trigger, watch } = useFormContext<FlowVariableData>()
  const [openEditor, setOpenEditor] = useState(true)
  const watchSecret = watch().variables[index]?.isSecret
  const watchReadOnly = watch().variables[index]?.isReadOnly
  const watchFile = watch().variables[index]?.file
  const watchDescription = watch().variables[index]?.description

  const pattern = /^[^\s]+$/

  return (
    <div data-testid="variable-row" className="mb-3 w-full items-center">
      <div key={index} data-testid="form-row" className="mb-3 grid" style={{ gridTemplateColumns }}>
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
              className="mr-3 flex-1 shrink-0 grow"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
              label="Variable"
              errorMessagePosition="left"
              readOnly={watchReadOnly}
              iconRight={
                watchDescription && (
                  <Tooltip content={watchDescription}>
                    <span>
                      <Icon iconName="info-circle" iconStyle="regular" />
                    </span>
                  </Tooltip>
                )
              }
            />
          )}
        />

        {watchFile ? (
          <Button
            size="md"
            color="neutral"
            variant="surface"
            type="button"
            className="mr-3 h-[36px] flex-1 shrink-0 grow justify-between"
            onClick={() => setOpenEditor((open) => !open)}
          >
            {openEditor ? (
              <>
                Close
                <Icon iconName="angle-up" className="text-neutral-400" />
              </>
            ) : (
              <>
                Edit
                <Icon iconName="edit" className="text-neutral-400" />
              </>
            )}
          </Button>
        ) : (
          <Controller
            name={`variables.${index}.value`}
            control={control}
            rules={{
              required: 'Please enter a value.',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputTextSmall
                className="mr-3 flex-1 shrink-0 grow"
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
        )}

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
              items={availableScopes.map((s) => ({ value: s, label: generateScopeLabel(s) }))}
            />
          )}
        />

        <div className="ml-1 flex w-14 items-center justify-center">
          <Controller
            name={`variables.${index}.isSecret`}
            control={control}
            render={({ field }) => <InputToggle small value={field.value} onChange={field.onChange} />}
          />
        </div>

        <div className="flex h-full w-full grow items-center">
          <ButtonIcon
            icon={IconAwesomeEnum.TRASH}
            style={ButtonIconStyle.STROKED}
            size={ButtonLegacySize.TINY}
            onClick={() => props.onDelete(index)}
            className="!h-8 !w-8 text-neutral-350 hover:text-neutral-400"
            iconClassName="!text-xs"
          />
        </div>
      </div>
      {watchFile && openEditor && (
        <Controller
          name={`variables.${index}.value`}
          control={control}
          rules={{
            required: true,
          }}
          render={({ field }) => (
            <CodeEditor
              language="json"
              height="496px"
              className="mt-3 overflow-hidden rounded border border-neutral-250"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      )}
    </div>
  )
}

export default VariableRow
