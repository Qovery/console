import { type ReactNode } from 'react'
import { NeedHelp } from '@qovery/shared/assistant/feature'
import { Heading } from '@qovery/shared/ui'

export interface SettingsHeadingProps {
  title: string
  description?: ReactNode
  children?: ReactNode
}

export function SettingsHeading({ title, description, children }: SettingsHeadingProps) {
  return (
    <div className="mb-8 flex w-full justify-between gap-2 border-b border-neutral">
      <div className="flex w-full items-start justify-between gap-4 pb-6">
        <div className="flex flex-col gap-2">
          <Heading>{title}</Heading>
          {description && <p className="max-w-lg text-sm text-neutral-subtle">{description}</p>}
        </div>
        <NeedHelp className="mt-2" />
      </div>
      {children}
    </div>
  )
}
