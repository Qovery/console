import clsx from 'clsx'
import { type ReactNode } from 'react'
import { Button, Icon, LogoIcon } from '@qovery/shared/ui'

export function BlueprintUpdateFlowShell({
  children,
  currentStep,
  onExit,
}: {
  children: ReactNode
  currentStep: 1 | 2
  onExit: () => void
}) {
  return (
    <div className="absolute inset-0 left-0 top-0 flex min-h-0 flex-col bg-background">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral bg-background-secondary">
        <div className="flex h-full items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center border-r border-neutral">
            <LogoIcon width={28} height={28} />
          </div>
          <div className="flex items-center gap-2">
            <StepIndicator completed={currentStep > 1} active={currentStep === 1} number={1} title="Review update" />
            <Icon iconName="angle-right" className="text-xs text-neutral-subtle" />
            <StepIndicator active={currentStep === 2} number={2} title="Preview changes" />
          </div>
        </div>
        <div className="flex h-full items-center px-4">
          <Button
            type="button"
            variant="surface"
            color="neutral"
            size="md"
            iconOnly
            aria-label="Close"
            onClick={onExit}
          >
            <Icon iconName="xmark" iconStyle="regular" />
          </Button>
        </div>
      </header>
      <div className="relative flex min-h-0 flex-grow">{children}</div>
    </div>
  )
}

function StepIndicator({
  active,
  completed,
  number,
  title,
}: {
  active?: boolean
  completed?: boolean
  number: number
  title: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      {completed ? (
        <Icon iconName="circle-check" className="text-xs text-positive" />
      ) : (
        <span
          className={clsx(
            'flex h-3.5 w-3.5 items-center justify-center rounded-full text-[10px] font-semibold',
            active
              ? 'bg-surface-brand-solid text-neutralInvert'
              : 'border border-neutral bg-background text-neutral-disabled'
          )}
        >
          {number}
        </span>
      )}
      <span className={clsx('text-sm leading-5', active || completed ? 'text-neutral' : 'text-neutral-disabled')}>
        {title}
      </span>
    </div>
  )
}
