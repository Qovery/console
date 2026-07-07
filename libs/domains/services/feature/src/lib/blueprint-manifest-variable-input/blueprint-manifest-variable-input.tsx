import { type BlueprintManifestVariableField } from 'qovery-typescript-axios'
import { InputSelect, InputText } from '@qovery/shared/ui'
import {
  type BlueprintFieldValue,
  formatFieldLabel,
  getBooleanFieldValue,
  getStringFieldValue,
} from '../blueprint-field-utils/blueprint-field-utils'
import { CheckboxField } from './checkbox-field'

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

  if (field.type.type === 'bool') {
    return (
      <CheckboxField
        autoFocus={autoFocus}
        checked={getBooleanFieldValue(value)}
        description={field.description ?? ''}
        label={inputLabel}
        name={field.name}
        onChange={onChange}
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
