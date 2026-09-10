import { useParams } from '@tanstack/react-router'
import clsx from 'clsx'
import { type DeploymentHistoryEnvironmentV2, type EnvironmentStatus } from 'qovery-typescript-axios'
import { type PropsWithChildren, useState } from 'react'
import { Badge, DeploymentAction, Icon, StatusChip, Tooltip } from '@qovery/shared/ui'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'
import { trimId } from '@qovery/shared/util-js'

export interface HeaderEnvironmentStagesProps extends PropsWithChildren {
  environmentStatus: EnvironmentStatus
  deploymentHistory?: DeploymentHistoryEnvironmentV2
}

export function HeaderEnvironmentStages({
  environmentStatus,
  deploymentHistory,
  children,
}: HeaderEnvironmentStagesProps) {
  const { deploymentId } = useParams({ strict: false })
  const totalDurationSec = environmentStatus?.total_deployment_duration_in_seconds ?? 0
  const [isCopied, setIsCopied] = useState(false)
  const [, copyToClipboard] = useCopyToClipboard()

  const handleCopyExecutionId = () => {
    if (!deploymentId) return

    copyToClipboard(deploymentId)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 1000)
  }

  return (
    <div className="flex h-12 w-full items-center justify-between">
      <div className="flex h-full">
        <div
          className={clsx('flex h-full items-center gap-4 text-sm font-medium text-neutral', {
            'pr-2': environmentStatus?.state === 'DEPLOYING',
          })}
        >
          <div className="flex items-center justify-between gap-3">
            <DeploymentAction
              status={deploymentHistory?.trigger_action}
              className="gap-3 text-2xl"
              iconClassName="text-neutral-subtle"
            />
            <StatusChip status={deploymentHistory?.status} className="h-5 w-5" />
          </div>

          <svg width="1" height="16" viewBox="0 0 1 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="1" height="16" fill="var(--neutral-6)" />
          </svg>

          {environmentStatus?.state !== 'DEPLOYING' && (
            <div className="flex items-center gap-2">
              <Badge variant="surface" className="max-w-full whitespace-nowrap">
                <span className="flex items-center gap-1.5">
                  <Icon iconName="stopwatch" iconStyle="regular" className="text-xs text-neutral-subtle" />
                  {Math.floor(totalDurationSec / 60)}m : {totalDurationSec % 60}s
                </span>
              </Badge>
              <Tooltip side="bottom" content={<span>Execution id: {deploymentId}</span>}>
                <button
                  type="button"
                  aria-label="Copy execution id"
                  disabled={!deploymentId}
                  onClick={handleCopyExecutionId}
                  className="group inline-flex disabled:cursor-default"
                >
                  <Badge
                    variant="surface"
                    className="max-w-full cursor-pointer whitespace-nowrap transition-colors hover:bg-surface-neutral-componentHover group-disabled:cursor-default group-disabled:hover:bg-surface-neutral-subtle"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="relative flex size-4 shrink-0 items-center justify-center">
                        <Icon
                          iconName="code"
                          iconStyle="regular"
                          className={clsx('absolute text-sm text-neutral-subtle transition-opacity', {
                            'opacity-0': isCopied,
                            'opacity-100 group-hover:opacity-0': !isCopied,
                          })}
                        />
                        <Icon
                          iconName="copy"
                          iconStyle="regular"
                          className={clsx('absolute text-sm text-neutral-subtle transition-opacity', {
                            'opacity-0': isCopied,
                            'opacity-0 group-hover:opacity-100': !isCopied,
                          })}
                        />
                        <Icon
                          iconName="check"
                          iconStyle="regular"
                          className={clsx('absolute text-sm text-neutral-subtle transition-opacity', {
                            'opacity-100': isCopied,
                            'opacity-0': !isCopied,
                          })}
                        />
                      </span>
                      <span className="font-normal text-neutral">{trimId(deploymentId ?? '')}</span>
                    </span>
                  </Badge>
                </button>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

export default HeaderEnvironmentStages
