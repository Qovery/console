import { CUSTOM_SOURCE, type UIVariable } from './terraform-variables-context'

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

export const getSourceBadgeColor = (variable: UIVariable) => {
  if (isCustomVariable(variable)) {
    return 'tf_custom'
  }
  if (isVariableChanged(variable)) {
    return 'tf_override'
  }
  if (variable.source.includes('.tfvars')) {
    return 'tfvars_file'
  }
  return 'tf_file'
}
