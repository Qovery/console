import { type IconName } from '@fortawesome/fontawesome-common-types'
import { type ReactNode } from 'react'
import { Heading, Icon, Section } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'

export interface BlueprintSectionProps {
  active?: boolean
  completed?: boolean
  disabled?: boolean
  iconName: IconName
  action?: ReactNode
  headerClassName?: string
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
  action,
  headerClassName,
  onClick,
  title,
  description,
  children,
}: BlueprintSectionProps) {
  const isClickable = Boolean(onClick && !active && !action)
  const isDisabled = disabled && isClickable
  const headerContent = (
    <div className="flex items-center gap-2">
      <Icon iconName={iconName} className="text-sm text-neutral-subtle" />
      <Heading level={2} className={`text-base leading-6 ${active || completed ? 'text-neutral' : 'text-neutral-subtle'}`}>
        {title}
      </Heading>
      {description && (
        <>
          <span className="h-1 w-1 rounded-full bg-surface-neutral-component" aria-hidden="true" />
          <p className="text-sm leading-5 text-neutral-subtle">{description}</p>
        </>
      )}
    </div>
  )

  return (
    <Section className="rounded-xl border border-neutral bg-surface-neutral shadow-sm">
      {isClickable ? (
        <button
          type="button"
          className={twMerge(
            'flex w-full items-center justify-between gap-3 rounded-t-xl px-4 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-strong',
            headerClassName
          )}
          aria-expanded={active}
          disabled={isDisabled}
          onClick={onClick}
        >
          {headerContent}
          {completed && <Icon iconName="circle-check" className="text-sm text-positive" />}
        </button>
      ) : (
        <div className={twMerge('flex items-center justify-between gap-3 px-4 py-4', headerClassName)}>
          {headerContent}
          {(completed || action) && (
            <div className="flex items-center gap-2">
              {completed && <Icon iconName="circle-check" className="text-sm text-positive" />}
              {action}
            </div>
          )}
        </div>
      )}
      {children && <div className="flex flex-col gap-3 px-4 pb-4">{children}</div>}
    </Section>
  )
}
