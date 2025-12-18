import { type GitTokenResponse } from 'qovery-typescript-axios'
import { Badge, Tooltip } from '@qovery/shared/ui'
import { dateMediumLocalFormat } from '@qovery/shared/util-dates'
import { isGitTokenExpired } from '../hooks/use-git-tokens/use-git-tokens'

export interface ExpiredTokenBadgeProps {
  token: GitTokenResponse
}

export function ExpiredTokenBadge({ token }: ExpiredTokenBadgeProps) {
  const expired = isGitTokenExpired(token)

  if (!expired || !token.expired_at) {
    return null
  }

  return (
    <Tooltip content={`This token expired on ${dateMediumLocalFormat(token.expired_at)}. Please renew it.`}>
      <Badge size="sm" color="red" variant="surface">
        Expired
      </Badge>
    </Tooltip>
  )
}

export default ExpiredTokenBadge
