import { type BlueprintManifestVariableField } from 'qovery-typescript-axios'
import { DropdownVariable } from '@qovery/domains/variables/feature'
import { Button, Icon, InputSelect, InputText, InputToggle } from '@qovery/shared/ui'
import {
  type BlueprintFieldValue,
  formatFieldLabel,
  getBooleanFieldValue,
  getStringFieldValue,
} from '../blueprint-field-utils/blueprint-field-utils'

// Above this many allowed values, a plain dropdown means scrolling (e.g. RDS instance classes), so let users search.
const SEARCHABLE_ALLOWED_VALUES_THRESHOLD = 10

export interface BlueprintManifestVariableInputProps {
  autoFocus?: boolean
  environmentId?: string
  error?: string
  field: BlueprintManifestVariableField
  label?: string
  onChange: (value: BlueprintFieldValue) => void
  value: BlueprintFieldValue | undefined
}

export function BlueprintManifestVariableInput({
  autoFocus,
  environmentId,
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
          autoFocus={autoFocus}
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
        isSearchable={field.allowed_values.length > SEARCHABLE_ALLOWED_VALUES_THRESHOLD}
        onChange={(value) => {
          if (Array.isArray(value)) return
          onChange(value)
        }}
      />
    )
  }

  const textInput = (
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

  if (!environmentId || !field.is_secret || field.type.type === 'number') {
    return textInput
  }

  // The wand sits outside the input: the password eye already uses the input's right edge
  return (
    <div className="flex items-start gap-2">
      <div className="min-w-0 flex-1">{textInput}</div>
      <DropdownVariable environmentId={environmentId} onChange={(variableKey) => onChange(`{{${variableKey}}}`)}>
        <Button
          type="button"
          size="lg"
          color="neutral"
          variant="surface"
          iconOnly
          aria-label="Reference a variable"
          className="h-[52px] w-[52px] shrink-0 justify-center"
        >
          <Icon iconName="wand-magic-sparkles" className="text-sm" />
        </Button>
      </DropdownVariable>
    </div>
  )
}
