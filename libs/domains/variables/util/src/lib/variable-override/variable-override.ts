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
  key: string
  scope: VariableScope
  variable_type?: VariableType
  is_secret?: boolean
  overridden_variable?: { variable_type: VariableType }
}

// Whether a variable is a file or a plain value. An override only knows it through the variable it overrides,
// which a 409 body usually does not include: the kind is then unknown.
function getConflictingVariableKind({
  variable_type,
  overridden_variable,
}: Pick<ConflictingVariable, 'variable_type' | 'overridden_variable'>): 'FILE' | 'VALUE' | undefined {
  return match(variable_type)
    .with('FILE', () => 'FILE' as const)
    .with('VALUE', () => 'VALUE' as const)
    .with('OVERRIDE', () => (overridden_variable ? getConflictingVariableKind(overridden_variable) : undefined))
    .otherwise(() => undefined)
}

// Mirrors q-core's override rules: the existing variable must have the same key (a 409 can also come from a
// mount path clash with another key), the same secret kind, and live at a strictly higher scope than the one
// being created. It must also be a value or file of the same kind as the request, since the override form takes
// its file or value shape from the parent; an override whose kind is unknown falls back to the link.
export function canOverrideConflictingVariable(
  existingVariable: ConflictingVariable,
  request: { key: string; variable_scope: VariableScope; is_secret: boolean; mount_path?: string | null }
): boolean {
  if (existingVariable.key !== request.key) {
    return false
  }
  const existingRank = getVariableScopeRank(existingVariable.scope)
  const requestedRank = getVariableScopeRank(request.variable_scope)
  if (existingRank === undefined || requestedRank === undefined || existingRank >= requestedRank) {
    return false
  }
  if (existingVariable.is_secret === undefined || existingVariable.is_secret !== request.is_secret) {
    return false
  }
  const requestedKind = request.mount_path ? 'FILE' : 'VALUE'
  return getConflictingVariableKind(existingVariable) === requestedKind
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
