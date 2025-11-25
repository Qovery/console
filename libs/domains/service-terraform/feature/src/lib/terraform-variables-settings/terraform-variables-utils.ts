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

export const getSourceBadgeClassName = (variable: UIVariable) => {
  if (isCustomVariable(variable)) {
    return 'text-[#65636D] bg-[#F2EFF3] border-[#D0CDD780]'
  }
  if (isVariableChanged(variable)) {
    return 'text-[#AB6400] bg-[#FFF7C2] border-[#DC9B004D]'
  }
  if (variable.source.includes('.tfvars')) {
    return 'text-[#218358] bg-[#E6F6EB] border-[#008F3E33]'
  }
  return 'text-[#0D74CE] bg-[#E6F4FE] border-[#0083EB33]'
}
