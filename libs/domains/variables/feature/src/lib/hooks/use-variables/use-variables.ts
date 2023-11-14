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
    },
    enabled: Boolean(scope),
  })
}

export default useVariables
