import { type ScalarFieldSchemaResponse } from 'qovery-typescript-axios'
import { toCatalogScalarField } from '@qovery/shared/util-js'
import { CatalogVariableInput } from '../catalog-variable-input/catalog-variable-input'

const NO_VALUE_LABEL = 'No limit'
const MISSING_VALUE_ERROR = 'The resolved value is missing. Refresh the page and try again.'

interface CatalogReadOnlyInputProps {
  field: ScalarFieldSchemaResponse
  value: string | null | undefined
  path: string
  error?: string
}

export function CatalogReadOnlyInput({ field, value, path, error }: CatalogReadOnlyInputProps) {
  const message = error ?? (value === undefined ? MISSING_VALUE_ERROR : undefined)

  if (field.type === 'string' && field.format === 'kubernetes-resource-yaml') {
    return (
      <section aria-labelledby={`${path}-label`} className="flex min-w-0 flex-col gap-2">
        <h4 id={`${path}-label`} className="text-sm font-medium">
          {field.label}
        </h4>
        {field.description ? <p className="text-ssm text-neutral-subtle">{field.description}</p> : null}
        {value !== undefined ? (
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-all rounded-sm bg-surface-neutral-subtle p-3 font-code text-xs text-neutral">
            {value ?? NO_VALUE_LABEL}
          </pre>
        ) : null}
        {message ? (
          <p role="alert" className="text-xs text-negative">
            {message}
          </p>
        ) : null}
      </section>
    )
  }

  const variableField = toCatalogScalarField(field, path)
  if (field.type === 'bool' && (value === 'true' || value === 'false')) {
    return (
      <CatalogVariableInput
        disabled
        booleanControl="checkbox"
        inputId={path}
        field={variableField}
        value={value === 'true'}
        error={message}
        onChange={() => undefined}
      />
    )
  }

  return (
    <CatalogVariableInput
      disabled
      inputId={path}
      field={{ ...variableField, type: 'string', allowedValues: undefined }}
      value={value === undefined ? '' : value ?? NO_VALUE_LABEL}
      error={message}
      onChange={() => undefined}
    />
  )
}
