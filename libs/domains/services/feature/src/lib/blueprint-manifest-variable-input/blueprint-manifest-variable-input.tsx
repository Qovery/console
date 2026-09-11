import { type BlueprintManifestVariableField } from 'qovery-typescript-axios'
import { CatalogVariableInput } from '@qovery/shared/ui'
import { type BlueprintFieldValue, toCatalogVariableField } from '../blueprint-field-utils/blueprint-field-utils'

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
  return (
    <CatalogVariableInput
      field={toCatalogVariableField(field, label)}
      value={value}
      error={error}
      autoFocus={autoFocus}
      onChange={onChange}
    />
  )
}
