import clsx from 'clsx'
import { type ReactNode } from 'react'
import { NeedHelp } from '@qovery/shared/assistant/feature'
import { Heading } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'

export interface SettingsHeadingProps {
  title: string
  titleBadge?: ReactNode
  description?: ReactNode
  children?: ReactNode
  showNeedHelp?: boolean
  stackActionsOnMobile?: boolean
}

export function SettingsHeading({
  title,
  titleBadge,
  description,
  children,
  showNeedHelp = true,
  stackActionsOnMobile = false,
}: SettingsHeadingProps) {
  return (
    <div
      className={clsx(
        'mb-8 flex w-full justify-between gap-2 border-b border-neutral',
        stackActionsOnMobile && 'max-md:flex-col max-md:items-start max-md:gap-4 max-md:pb-6'
      )}
    >
      <div
        className={twMerge(
          'flex w-full items-start justify-between gap-4 pb-6',
          stackActionsOnMobile && 'pb-0 md:pb-6'
        )}
      >
        <div className="flex flex-col gap-2">
          {titleBadge ? (
            <div className="flex items-center gap-2">
              <Heading>{title}</Heading>
              {titleBadge}
            </div>
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
