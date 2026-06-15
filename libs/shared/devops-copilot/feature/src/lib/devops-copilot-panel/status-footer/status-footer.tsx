import clsx from 'clsx'
import { match } from 'ts-pattern'
import { Icon, Tooltip } from '@qovery/shared/ui'
import { QOVERY_STATUS_URL } from '@qovery/shared/util-const'
import { DotStatus } from '../../dot-status/dot-status'

export interface StatusFooterProps {
  isReadOnly: boolean
  status?: 'OPERATIONAL' | 'MAJOROUTAGE' | 'MINOROUTAGE' | 'PARTIALOUTAGE'
  setIsReadOnly?: (value: boolean) => void
  userAccess?: { read_only?: boolean }
  threadLength?: number
}

export function StatusFooter({ isReadOnly, status, setIsReadOnly, userAccess, threadLength }: StatusFooterProps) {
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

  const canToggle = userAccess?.read_only === false && threadLength === 0 && !!setIsReadOnly

  return (
    <div className="flex w-full items-center justify-between pt-1">
      <div className="inline-flex items-center gap-2 text-xs text-neutral-subtle">
        <Tooltip
          content={isReadOnly ? "Your Copilot can't make any changes" : 'It can perform actions'}
          classNameContent="z-10"
        >
          <button type="button">
            <Icon iconName="circle-info" className="text-neutral-subtle" />
          </button>
        </Tooltip>
        <span>Read-write mode</span>
        {canToggle && (
          <Tooltip content={isReadOnly ? 'Enable read-write mode' : 'Disable read-write mode'} delayDuration={400}>
            <button
              type="button"
              onClick={() => setIsReadOnly?.(!isReadOnly)}
              className={clsx(
                'relative inline-flex h-4 w-7 flex-shrink-0 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                {
                  'bg-surface-warning-solid': !isReadOnly,
                  'bg-surface-neutral-componentActive': isReadOnly,
                }
              )}
            >
              <span
                className={clsx(
                  'inline-block h-2.5 w-2.5 transform rounded-full bg-surface-neutralInvert transition-transform',
                  {
                    'translate-x-[14px]': !isReadOnly,
                    'translate-x-0.5': isReadOnly,
                  }
                )}
              />
            </button>
          </Tooltip>
        )}
      </div>
      {statusText && statusColor ? (
        <a
          className="inline-flex max-w-max animate-[fadein_0.22s_ease-in-out_forwards_0.20s] items-center gap-2 text-xs text-neutral-subtle opacity-0 transition hover:text-neutral"
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
