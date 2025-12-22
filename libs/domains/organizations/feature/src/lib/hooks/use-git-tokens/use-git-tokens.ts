import { useQuery } from '@tanstack/react-query'
import { type GitTokenResponse } from 'qovery-typescript-axios'
import { isDatePast } from '@qovery/shared/util-dates'
import { queries } from '@qovery/state/util-queries'

export interface UseGitTokensProps {
  organizationId: string
  enabled?: boolean
}

export function isGitTokenExpired(token: GitTokenResponse): boolean {
  return isDatePast(token.expired_at)
}

export function useGitTokens({ organizationId, enabled }: UseGitTokensProps) {
  return useQuery({
    ...queries.organizations.gitTokens({ organizationId }),
    select(data) {
      if (!data) {
        return data
      }
      return data.sort((a, b) => {
        const aExpired = isGitTokenExpired(a)
        const bExpired = isGitTokenExpired(b)
        if (aExpired !== bExpired) return aExpired ? 1 : -1
        return (a.name ?? '').localeCompare(b.name ?? '')
      })
    },
    enabled,
    refetchOnWindowFocus: false,
  })
}

export default useGitTokens
