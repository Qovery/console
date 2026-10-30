import {
  type APIVariableScopeEnum,
  type ExistingVariableResponse,
  type VariableRequest,
  type VariableResponse,
} from 'qovery-typescript-axios'
import { match } from 'ts-pattern'

type VariableScope = keyof typeof APIVariableScopeEnum

// Rank of a scope in the override hierarchy: a variable can only be overridden from a strictly higher rank.
// Built-in variables cannot take part in an override and have no rank.
export function getVariableScopeRank(scope?: VariableScope): number | undefined {
  return match(scope)
    .with('PROJECT', () => 1)
    .with('ENVIRONMENT', () => 2)
    .with('APPLICATION', 'CONTAINER', 'JOB', 'HELM', 'TERRAFORM', 'AGENTIC_WORKFLOW', () => 3)
    .otherwise(() => undefined)
}

// Mirrors q-core's override rules: the existing variable must have the same key (a 409 can also come from a
// mount path clash with another key), the same secret kind, and live at a strictly higher scope than the one
// being created. It must also be a value or file of the same kind as the request, since the override form takes
// its file or value shape from the parent. An existing override falls back to the link: the 409 body doesn't
// include the variable it overrides, so its kind is unknown.
export function canOverrideConflictingVariable(
  existingVariable: Pick<ExistingVariableResponse, 'key' | 'scope' | 'variable_type' | 'is_secret'>,
  request: Pick<VariableRequest, 'key' | 'variable_scope' | 'is_secret' | 'mount_path'>
): boolean {
  if (existingVariable.key !== request.key) {
    return false
  }
  const existingRank = getVariableScopeRank(existingVariable.scope)
  const requestedRank = getVariableScopeRank(request.variable_scope)
  if (existingRank === undefined || requestedRank === undefined || existingRank >= requestedRank) {
    return false
  }
  if (existingVariable.is_secret !== request.is_secret) {
    return false
  }
  const requestedKind = request.mount_path ? 'FILE' : 'VALUE'
  return existingVariable.variable_type === requestedKind
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
