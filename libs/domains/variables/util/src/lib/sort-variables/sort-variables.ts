import { APIVariableScopeEnum, type VariableResponse } from 'qovery-typescript-axios'

export function sortVariables(variables: VariableResponse[]): VariableResponse[] {
  const sortedAscii = variables
    .filter((sorted) => !sorted.aliased_variable && !sorted.overridden_variable)
    .sort((a, b) => {
      let serviceNameSorting = 0
      let scopeOrdering = 0
      if (a.scope === APIVariableScopeEnum.BUILT_IN && b.scope !== APIVariableScopeEnum.BUILT_IN) {
        scopeOrdering = -1
      }

      if (a.scope !== APIVariableScopeEnum.BUILT_IN && b.scope === APIVariableScopeEnum.BUILT_IN) {
        scopeOrdering = 1
      }

      if (a.service_name && b.service_name) {
        serviceNameSorting = a.service_name.localeCompare(b.service_name)
      } else {
        if (!a.service_name && b.service_name) {
          serviceNameSorting = 1
        } else if (a.service_name && !b.service_name) {
          serviceNameSorting = -1
        } else {
          serviceNameSorting = 0
        }
      }

      let keySorting = 0
      if (a.key && b.key) {
        keySorting = a.key.localeCompare(b.key)
      }
      if (a.key && !b.key) {
        keySorting = -1
      }
      if (!a.key && b.key) {
        keySorting = 1
      }

      return scopeOrdering || serviceNameSorting || keySorting
    })

  const withAliasOrOverride = variables.filter((sorted) => sorted.aliased_variable || sorted.overridden_variable)

  const final: VariableResponse[] = []

  sortedAscii.map((el) => {
    final.push(el)
    withAliasOrOverride.some((elAliasOrOverride) => {
      if (elAliasOrOverride.aliased_variable?.key === el.key || elAliasOrOverride.overridden_variable?.key === el.key) {
        final.push(elAliasOrOverride)
      }
    })
  })

  return final
}
