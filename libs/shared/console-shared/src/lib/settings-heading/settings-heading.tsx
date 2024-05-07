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
    <div className="flex w-full justify-between mb-8">
      <div>
        <Heading className={description ? 'mb-2' : 'mb-3'}>{title}</Heading>
        {description && <p className="text-sm text-neutral-400 max-w-lg mb-3">{description}</p>}
        <NeedHelp />
      </div>
      {children}
    </div>
  )
}
