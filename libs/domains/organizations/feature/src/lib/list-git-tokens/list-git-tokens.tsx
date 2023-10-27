import { useParams } from 'react-router-dom'
import { BlockContent, Button, Icon, IconAwesomeEnum, Tooltip, Truncate } from '@qovery/shared/ui'
import { dateYearMonthDayHourMinuteSecond, timeAgo } from '@qovery/shared/util-dates'
import useGitTokens from '../hooks/use-git-tokens/use-git-tokens'

export function ListGitTokens() {
  const { organizationId = '' } = useParams()
  const { data: gitTokens } = useGitTokens({ organizationId })

  return (
    <BlockContent title="Git tokens" classNameContent="p-0">
      <ul>
        {gitTokens?.map((gitToken) => (
          <li
            key={gitToken.id}
            className="flex justify-between items-center px-5 py-4 border-b border-neutral-250 last:border-0"
          >
            <div className="flex">
              <Icon name={gitToken.type} width="20" height="20" />
              <div className="ml-4">
                <h2 className="flex text-xs text-neutral-400 font-medium mb-1">
                  <Truncate truncateLimit={60} text={gitToken.name ?? ''} />
                  {gitToken.description && (
                    <Tooltip content={gitToken.description}>
                      <div className="ml-1 cursor-pointer">
                        <Icon name={IconAwesomeEnum.CIRCLE_INFO} className="text-neutral-350" />
                      </div>
                    </Tooltip>
                  )}
                </h2>
                <p className="text-xs text-neutral-350">
                  <span className="inline-block">Last updated {timeAgo(new Date(gitToken.updated_at ?? ''))}</span>
                  <span className="inline-block ml-3">
                    Created since {dateYearMonthDayHourMinuteSecond(new Date(gitToken.created_at ?? ''), false)}
                  </span>
                  {gitToken.expired_at && (
                    <span className="inline-block ml-3">
                      Expiration: {dateYearMonthDayHourMinuteSecond(new Date(gitToken.expired_at ?? ''), false)}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div>
              <Button variant="surface" className="mr-2">
                <Icon name={IconAwesomeEnum.WHEEL} />
              </Button>
              <Button variant="surface">
                <Icon name={IconAwesomeEnum.TRASH} />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </BlockContent>
  )
}

export default ListGitTokens
