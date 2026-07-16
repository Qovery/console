import { type CatalogVariableField, type CatalogVariableValue } from '@qovery/shared/util-js'
import { Checkbox } from '../checkbox/checkbox'
import { InputSelect } from '../inputs/input-select/input-select'
import { InputText } from '../inputs/input-text/input-text'
import { InputToggle } from '../inputs/input-toggle/input-toggle'

export interface CatalogVariableInputProps {
  autoFocus?: boolean
  booleanControl?: 'checkbox' | 'toggle'
  error?: string
  field: CatalogVariableField
  onChange: (value: CatalogVariableValue) => void
  value: CatalogVariableValue | undefined
}

export function CatalogVariableInput({
  autoFocus,
  booleanControl = 'toggle',
  error,
  field,
  onChange,
  value,
}: CatalogVariableInputProps) {
  // Bool fields take precedence over allowedValues: a bool field carrying allowed
  // values must keep emitting booleans, not the allowed-value strings.
  if (field.type === 'bool') {
    if (booleanControl === 'toggle') {
      return (
        <div className="rounded-md border border-neutral bg-surface-neutral px-3 py-3">
          <InputToggle
            small
            align="top"
            name={field.key}
            value={typeof value === 'boolean' ? value : false}
            title={field.label}
            description={field.description}
            ariaLabel={field.label}
            autoFocus={autoFocus}
            onChange={onChange}
          />
          {error ? <p className="mt-1 pl-11 text-xs text-negative">{error}</p> : null}
        </div>
      )
    }

    return (
      <div className="rounded-md border border-neutral bg-surface-neutral px-3 py-3">
        <div className="flex items-center gap-2">
          <Checkbox
            name={field.key}
            id={field.key}
            autoFocus={autoFocus}
            checked={typeof value === 'boolean' ? value : false}
            onCheckedChange={(checked) => {
              if (checked === 'indeterminate') return
              onChange(checked)
            }}
          />
          <label htmlFor={field.key} className="cursor-pointer text-sm leading-5 text-neutral">
            {field.label}
          </label>
        </div>
        {field.description ? (
          <p className="mt-1 pl-6 text-ssm leading-[18px] text-neutral-subtle">{field.description}</p>
        ) : null}
        {error ? <p className="mt-1 pl-6 text-xs text-negative">{error}</p> : null}
      </div>
    )
  }

  if (field.allowedValues?.length) {
    return (
      <InputSelect
        label={field.label}
        value={typeof value === 'string' ? value : ''}
        options={field.allowedValues.map((allowedValue) => ({ label: allowedValue, value: allowedValue }))}
        hint={field.description}
        error={error}
        autoFocus={autoFocus}
        onChange={(value) => {
          if (Array.isArray(value)) return
          onChange(value)
        }}
      />
    )
  }

  return (
    <InputText
      name={field.key}
      label={field.label}
      type={field.type === 'number' ? 'number' : field.sensitive ? 'password' : 'text'}
      value={typeof value === 'string' ? value : ''}
      error={error}
      hint={field.description}
      autoFocus={autoFocus}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  )
}
