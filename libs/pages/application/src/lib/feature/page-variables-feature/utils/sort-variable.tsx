import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import {
  EnvironmentVariableEntity,
  EnvironmentVariableSecretOrPublic,
  SecretEnvironmentVariableEntity,
} from '@qovery/shared/interfaces'

export function sortVariable(
  variables: EnvironmentVariableEntity[],
  secret: SecretEnvironmentVariableEntity[]
): EnvironmentVariableSecretOrPublic[] {
  const merged: EnvironmentVariableSecretOrPublic[] = [...variables, ...secret]

  const sortedAscii = merged
    .filter(
      (sorted) =>
        !(sorted as EnvironmentVariableEntity).aliased_variable &&
        !(sorted as EnvironmentVariableEntity).overridden_variable &&
        !(sorted as SecretEnvironmentVariableEntity).aliased_secret &&
        !(sorted as SecretEnvironmentVariableEntity).overridden_secret
    )
    .sort((a, b) => {
      let serviceNameSorting = 0
      let scopeOrdering = 0
      if (a.scope === APIVariableScopeEnum.BUILT_IN && b.scope !== APIVariableScopeEnum.BUILT_IN) {
        scopeOrdering = -1
      }

      if (a.scope !== APIVariableScopeEnum.BUILT_IN && b.scope === APIVariableScopeEnum.BUILT_IN) {
        scopeOrdering = 1
      }

      if ((a as EnvironmentVariableEntity).service_name && (b as EnvironmentVariableEntity).service_name) {
        serviceNameSorting = (a as EnvironmentVariableEntity).service_name.localeCompare(
          (b as EnvironmentVariableEntity).service_name
        )
      } else {
        if (!(a as EnvironmentVariableEntity).service_name && (b as EnvironmentVariableEntity).service_name) {
          serviceNameSorting = 1
        } else if ((a as EnvironmentVariableEntity).service_name && !(b as EnvironmentVariableEntity).service_name) {
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

  const withAliasOrOverride = merged.filter(
    (sorted) =>
      (sorted as EnvironmentVariableEntity).aliased_variable ||
      (sorted as SecretEnvironmentVariableEntity).overridden_secret ||
      (sorted as SecretEnvironmentVariableEntity).aliased_secret ||
      (sorted as EnvironmentVariableEntity).overridden_variable
  )

  const final: EnvironmentVariableSecretOrPublic[] = []

  sortedAscii.map((el) => {
    final.push(el)
    withAliasOrOverride.some((elAliasOrOverride) => {
      if (
        (elAliasOrOverride as EnvironmentVariableEntity).aliased_variable?.key === el.key ||
        (elAliasOrOverride as EnvironmentVariableEntity).overridden_variable?.key === el.key ||
        (elAliasOrOverride as SecretEnvironmentVariableEntity).aliased_secret?.key === el.key ||
        (elAliasOrOverride as SecretEnvironmentVariableEntity).overridden_secret?.key === el.key
      ) {
        final.push(elAliasOrOverride)
      }
    })
  })

  return final
}
