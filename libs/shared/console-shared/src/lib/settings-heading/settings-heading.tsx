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
    <div className="mb-8 flex w-full justify-between gap-2">
      <div>
        <Heading className={description ? 'mb-2' : 'mb-3'}>{title}</Heading>
        {description && <p className="mb-3 max-w-lg text-sm text-neutral-400">{description}</p>}
        <NeedHelp />
      </div>
      {children}
    </div>
  )
}
