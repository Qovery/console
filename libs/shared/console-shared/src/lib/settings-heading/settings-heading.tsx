import { type ReactNode } from 'react'
import { NeedHelp } from '@qovery/shared/assistant/feature'
import { Heading } from '@qovery/shared/ui'

export interface SettingsHeadingProps {
  title: string
  /** Shown next to the title, for example a "Beta" badge. */
  titleBadge?: ReactNode
  description?: ReactNode
  children?: ReactNode
  showNeedHelp?: boolean
}

export function SettingsHeading({
  title,
  titleBadge,
  description,
  children,
  showNeedHelp = true,
}: SettingsHeadingProps) {
  return (
    <div className="mb-8 flex w-full justify-between gap-2 border-b border-neutral">
      <div className="flex w-full items-start justify-between gap-4 pb-6">
        <div className="flex flex-col gap-2">
          {titleBadge ? (
            <span className="flex items-center gap-2">
              <Heading>{title}</Heading>
              {titleBadge}
            </span>
          ) : (
            <Heading>{title}</Heading>
          )}
          {description && <p className="max-w-2xl text-sm text-neutral-subtle">{description}</p>}
          {showNeedHelp && <NeedHelp className="mt-2" />}{' '}
        </div>
      </div>
      {children}
    </div>
  )
}
