import { useQuery } from '@tanstack/react-query'
import { type VariableScope } from '@qovery/domains/variables/data-access'
import { sortVariables } from '@qovery/domains/variables/util'
import { queries } from '@qovery/state/util-queries'

export interface UseVariablesProps {
  parentId: string
  scope?: VariableScope
  isSecret?: boolean
}

export function useVariables({ parentId, scope, isSecret }: UseVariablesProps) {
  return useQuery({
    ...queries.variables.list({
      parentId,
      // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
      scope: scope!!,
      isSecret,
    }),
    select(data) {
      if (!data) {
        return data
      }
      return sortVariables(data)
        .map((v) => ({
          ...v,
          // NOTE: This is to simplify react-table usage and filtering of `is_secret`
          variable_kind: v.is_secret ? 'Private' : 'Public',
        }))
        .filter((v) => {
          if (scope === 'PROJECT' && v.scope === 'BUILT_IN') {
            return v.key === 'QOVERY_PROJECT_ID'
          }
          return true
        })
    },
    enabled: Boolean(scope),
  })
}

export default useVariables
