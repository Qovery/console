import { type PropsWithChildren } from 'react'
import { Accordion } from '@qovery/shared/ui'

export interface SectionExpandProps extends PropsWithChildren {
  title: string
  description: string
}

export function SectionExpand({ title, description, children }: SectionExpandProps) {
  return (
    <Accordion.Item value={title} className="overflow-hidden rounded border border-neutral">
      <Accordion.Trigger className="w-full cursor-pointer flex-row-reverse justify-between px-4 py-3">
        <div className="flex flex-col gap-1.5 text-left">
          <span className="font-medium">{title}</span>
          <p className="text-neutral-subtle">{description}</p>
        </div>
      </Accordion.Trigger>
      <Accordion.Content className="border-t border-neutral p-0 text-sm">{children}</Accordion.Content>
    </Accordion.Item>
  )
}

export default SectionExpand
