import { match } from 'ts-pattern'
import { Icon, Tooltip } from '@qovery/shared/ui'
import { QOVERY_STATUS_URL } from '@qovery/shared/util-const'
import { DotStatus } from '../../dot-status/dot-status'

export interface StatusFooterProps {
  isReadOnly: boolean
  appStatus?: {
    id: string
    status: 'OPERATIONAL' | 'MAJOROUTAGE' | 'MINOROUTAGE' | 'PARTIALOUTAGE'
  }
}

export function StatusFooter({ isReadOnly, appStatus }: StatusFooterProps) {
  const status = appStatus?.status

  const statusText = status
    ? match(status)
        .with('OPERATIONAL', () => 'All systems operational')
        .with('MAJOROUTAGE', () => 'Major outage ongoing')
        .with('MINOROUTAGE', () => 'Minor outage ongoing')
        .with('PARTIALOUTAGE', () => 'Partial outage ongoing')
        .exhaustive()
    : null

  const statusColor = status
    ? match(status)
        .with('OPERATIONAL', () => 'green' as const)
        .with('MAJOROUTAGE', () => 'red' as const)
        .with('MINOROUTAGE', () => 'yellow' as const)
        .with('PARTIALOUTAGE', () => 'yellow' as const)
        .exhaustive()
    : null

  return (
    <div className="flex w-full items-center justify-between">
      <div className="inline-flex items-center gap-2 text-xs text-neutral-350 dark:text-neutral-250">
        <span>{isReadOnly ? 'Read-only mode' : 'Read-write mode'}</span>
        <Tooltip
          content={isReadOnly ? "Your Copilot can't make any changes" : 'It can perform actions'}
          classNameContent="z-10"
        >
          <button type="button">
            <Icon iconName="circle-info" className="text-neutral-350 dark:text-neutral-250" />
          </button>
        </Tooltip>
      </div>
      {statusText && statusColor ? (
        <a
          className="inline-flex max-w-max animate-[fadein_0.22s_ease-in-out_forwards_0.20s] items-center gap-2 text-xs text-neutral-350 opacity-0 transition hover:text-neutral-600 dark:text-neutral-250"
          href={QOVERY_STATUS_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>{statusText}</span>
          <DotStatus color={statusColor as 'red' | 'green' | 'yellow'} />
        </a>
      ) : (
        <div className="h-4" />
      )}
    </div>
  )
}
