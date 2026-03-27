import { type TerraformVariableDefinition } from 'qovery-typescript-axios'
import { CUSTOM_SOURCE, type UIVariable } from './terraform-variables-context'

export type VariableMetadata = {
  description?: string
  nullable: boolean
}

export const buildMetadataByKey = (
  variablesResponse: TerraformVariableDefinition[] | undefined
): Record<string, VariableMetadata> => {
  return Object.fromEntries(
    (variablesResponse ?? [])
      .filter((variable) => variable?.key)
      .map((variable) => [
        variable.key,
        {
          description: variable.description ?? undefined,
          nullable: variable.nullable ?? true,
        },
      ])
  )
}

export const isVariableChanged = (v: UIVariable): boolean => {
  // New variables are always considered changed
  if (v.isNew) return true

  // If originals are undefined (defensive), treat as changed
  const origKey = v.originalKey ?? undefined
  const origVal = v.originalValue ?? undefined
  const origSecret = v.originalSecret ?? undefined

  // Compare key, value and secret strictly
  const keyChanged = v.key !== origKey
  const valueChanged = v.value !== origVal
  const secretChanged = v.secret !== origSecret

  return keyChanged || valueChanged || secretChanged
}

export const formatSource = (v: UIVariable) => {
  return isVariableChanged(v) && v.source !== CUSTOM_SOURCE ? `Override from ${v.source}` : v.source
}

export const isCustomVariable = (v: UIVariable) => {
  return v.source === CUSTOM_SOURCE
}

export const getSourceBadgeClassName = (variable: UIVariable) => {
  if (isCustomVariable(variable)) {
    return 'text-neutral-subtle bg-surface-neutral-component border-neutral-component'
  }
  if (isVariableChanged(variable)) {
    return 'text-warning bg-surface-warning-component border-warning-subtle'
  }
  if (variable.source.includes('.tfvars')) {
    return 'text-positive bg-surface-positive-component border-positive-subtle'
  }
  return 'text-info bg-surface-info-component border-info-subtle'
}
