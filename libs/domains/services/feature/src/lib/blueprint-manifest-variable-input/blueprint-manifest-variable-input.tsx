import { type BlueprintManifestVariableField } from 'qovery-typescript-axios'
import { InputSelect, InputText, InputToggle } from '@qovery/shared/ui'
import {
  type BlueprintFieldValue,
  formatFieldLabel,
  getBooleanFieldValue,
  getStringFieldValue,
} from '../blueprint-field-utils/blueprint-field-utils'

export interface BlueprintManifestVariableInputProps {
  autoFocus?: boolean
  error?: string
  field: BlueprintManifestVariableField
  label?: string
  onChange: (value: BlueprintFieldValue) => void
  value: BlueprintFieldValue | undefined
}

export function BlueprintManifestVariableInput({
  autoFocus,
  error,
  field,
  label,
  onChange,
  value,
}: BlueprintManifestVariableInputProps) {
  const inputLabel = label ?? formatFieldLabel(field.name)

  if (field.type.type === 'bool') {
    return (
      <div className="rounded-md border border-neutral bg-surface-neutral px-3 py-3">
        <InputToggle
          small
          align="top"
          name={field.name}
          value={getBooleanFieldValue(value)}
          title={inputLabel}
          description={field.description ?? undefined}
          ariaLabel={inputLabel}
          onChange={onChange}
        />
      </div>
    )
  }

  if (field.allowed_values?.length) {
    return (
      <InputSelect
        label={inputLabel}
        value={getStringFieldValue(value)}
        options={field.allowed_values.map((allowedValue) => ({ label: allowedValue, value: allowedValue }))}
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
      name={field.name}
      label={inputLabel}
      type={field.type.type === 'number' ? 'number' : field.is_secret ? 'password' : 'text'}
      value={getStringFieldValue(value)}
      error={error}
      hint={field.description ?? undefined}
      autoFocus={autoFocus}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  )
}
