import { type IconName } from '@fortawesome/fontawesome-common-types'
import { type ReactNode } from 'react'
import { Icon } from '@qovery/shared/ui'

export interface BlueprintSectionProps {
  active?: boolean
  completed?: boolean
  disabled?: boolean
  iconName: IconName
  onClick?: () => void
  title: string
  description?: string
  children?: ReactNode
}

export function BlueprintSection({
  active = false,
  completed = false,
  disabled = false,
  iconName,
  onClick,
  title,
  description,
  children,
}: BlueprintSectionProps) {
  const isClickable = Boolean(onClick && !active)
  const isDisabled = disabled && isClickable
  const headerContent = (
    <>
      <div className="flex items-center gap-2">
        <Icon iconName={iconName} className="text-sm text-neutral-subtle" />
        <h2
          className={`text-base font-medium leading-6 ${active || completed ? 'text-neutral' : 'text-neutral-subtle'}`}
        >
          {title}
        </h2>
        {description && (
          <>
            <span className="h-1 w-1 rounded-full bg-surface-neutral-component" aria-hidden="true" />
            <p className="text-sm leading-5 text-neutral-subtle">{description}</p>
          </>
        )}
      </div>
      {completed && <Icon iconName="circle-check" className="text-sm text-positive" />}
    </>
  )

  return (
    <section className="rounded-xl border border-neutral bg-surface-neutral shadow-sm">
      {isClickable ? (
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 rounded-t-xl px-4 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-strong"
          aria-expanded={active}
          disabled={isDisabled}
          onClick={onClick}
        >
          {headerContent}
        </button>
      ) : (
        <div className="flex items-center justify-between gap-3 px-4 py-4">{headerContent}</div>
      )}
      {children && <div className="flex flex-col gap-3 px-4 pb-4">{children}</div>}
    </section>
  )
}
