import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseSuggestionsProps {
  search: string
  organizationId?: string
  enabled: boolean
}

export function useSuggestions({ organizationId, enabled, search }: UseSuggestionsProps) {
  return useQuery({
    // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
    ...queries.spotlight.suggestions(organizationId!!),
    enabled: Boolean(organizationId) && enabled,
    select(data) {
      return data.filter(({ name }) => name.toLowerCase().includes(search.toLowerCase()))
    },
  })
}

export default useSuggestions
