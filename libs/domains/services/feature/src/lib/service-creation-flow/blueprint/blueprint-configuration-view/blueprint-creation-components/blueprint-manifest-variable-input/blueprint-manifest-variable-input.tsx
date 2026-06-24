import { type BlueprintManifestVariableField } from 'qovery-typescript-axios'
import { InputSelect, InputText } from '@qovery/shared/ui'
import {
  type BlueprintFieldValue,
  formatFieldLabel,
  getBooleanFieldValue,
  getStringFieldValue,
} from '../../../blueprint-creation-utils/blueprint-creation-utils'
import { CheckboxField } from '../checkbox-field/checkbox-field'

export interface BlueprintManifestVariableInputProps {
  autoFocus?: boolean
  error?: string
  field: BlueprintManifestVariableField
  onChange: (value: BlueprintFieldValue) => void
  value: BlueprintFieldValue | undefined
}

export function BlueprintManifestVariableInput({
  autoFocus,
  error,
  field,
  onChange,
  value,
}: BlueprintManifestVariableInputProps) {
  const label = formatFieldLabel(field.name)

  if (field.allowed_values?.length) {
    return (
      <InputSelect
        label={label}
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
        label={label}
        name={field.name}
        onChange={onChange}
      />
    )
  }

  return (
    <InputText
      name={field.name}
      label={label}
      type={field.type.type === 'number' ? 'number' : field.is_secret ? 'password' : 'text'}
      value={getStringFieldValue(value)}
      error={error}
      hint={field.description ?? undefined}
      autoFocus={autoFocus}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  )
}
