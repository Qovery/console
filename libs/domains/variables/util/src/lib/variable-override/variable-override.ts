import { type APIVariableScopeEnum, type APIVariableTypeEnum, type VariableResponse } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'

type VariableScope = keyof typeof APIVariableScopeEnum
type VariableType = keyof typeof APIVariableTypeEnum

// Rank of a scope in the override hierarchy: a variable can only be overridden from a strictly higher rank.
// Built-in variables cannot take part in an override and have no rank.
export function getVariableScopeRank(scope?: VariableScope): number | undefined {
  return match(scope)
    .with('PROJECT', () => 1)
    .with('ENVIRONMENT', () => 2)
    .with('APPLICATION', 'CONTAINER', 'JOB', 'HELM', 'TERRAFORM', 'AGENTIC_WORKFLOW', () => 3)
    .otherwise(() => undefined)
}

export type ConflictingVariable = {
  scope: VariableScope
  variable_type?: VariableType
  is_secret?: boolean
}

// Mirrors q-core's override rules: the existing variable must be a plain value, a file or an override,
// with the same secret kind, and live at a strictly higher scope than the one being created.
export function canOverrideConflictingVariable(
  existingVariable: ConflictingVariable,
  request: { variable_scope: VariableScope; is_secret: boolean }
): boolean {
  const existingRank = getVariableScopeRank(existingVariable.scope)
  const requestedRank = getVariableScopeRank(request.variable_scope)
  if (existingRank === undefined || requestedRank === undefined || existingRank >= requestedRank) {
    return false
  }
  if (existingVariable.is_secret === undefined || existingVariable.is_secret !== request.is_secret) {
    return false
  }
  return match(existingVariable.variable_type)
    .with('VALUE', 'FILE', 'OVERRIDE', () => true)
    .otherwise(() => false)
}

// Maps the id of every overridden variable to the variable that overrides it.
export function getOverridesByParentId(variables: VariableResponse[]): Map<string, VariableResponse> {
  const overridesByParentId = new Map<string, VariableResponse>()
  for (const variable of variables) {
    if (variable.overridden_variable) {
      overridesByParentId.set(variable.overridden_variable.id, variable)
    }
  }
  return overridesByParentId
}
