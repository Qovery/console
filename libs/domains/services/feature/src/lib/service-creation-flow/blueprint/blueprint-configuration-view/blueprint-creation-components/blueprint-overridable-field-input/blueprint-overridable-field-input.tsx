import { useRef } from 'react'
import { DropdownVariable } from '@qovery/domains/variables/feature'
import { Button, Icon, InputText } from '@qovery/shared/ui'
import {
  type OverridableBlueprintManifestContextVariableField,
  formatFieldLabel,
} from '../../../../../blueprint-field-utils/blueprint-field-utils'

export interface BlueprintOverridableFieldInputProps {
  field: OverridableBlueprintManifestContextVariableField
  environmentId: string
  value: string
  onChange: (value: string) => void
  autoFocus?: boolean
}

export function BlueprintOverridableFieldInput({
  field,
  environmentId,
  value,
  onChange,
  autoFocus,
}: BlueprintOverridableFieldInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Insert the selected variable as an interpolation (`{{VARIABLE_KEY}}`) at the
  // current cursor position, falling back to appending when no selection is known.
  const handleInsertVariable = (variableKey: string) => {
    const interpolation = `{{${variableKey}}}`
    const input = inputRef.current
    const startPos = input?.selectionStart ?? value.length
    const endPos = input?.selectionEnd ?? value.length
    onChange(value.substring(0, startPos) + interpolation + value.substring(endPos))
  }

  return (
    <InputText
      ref={inputRef}
      name={field.name}
      label={formatFieldLabel(field.name)}
      value={value}
      hint={field.source ? `Automatically sourced from ${field.source}` : undefined}
      autoFocus={autoFocus}
      onChange={(event) => onChange(event.currentTarget.value)}
      rightElement={
        <DropdownVariable environmentId={environmentId} onChange={handleInsertVariable}>
          <Button type="button" size="sm" variant="plain" color="neutral" iconOnly aria-label="Insert variable">
            <Icon iconName="wand-magic-sparkles" />
          </Button>
        </DropdownVariable>
      }
    />
  )
}

export default BlueprintOverridableFieldInput
