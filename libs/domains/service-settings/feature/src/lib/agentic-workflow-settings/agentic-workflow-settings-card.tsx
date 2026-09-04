import { type ReactNode } from 'react'
import { Heading } from '@qovery/shared/ui'

export function AgenticWorkflowSettingsCard({
  children,
  description,
  title,
}: {
  children: ReactNode
  description?: string
  title: string
}) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-neutral p-5">
      <div className="flex flex-col gap-1">
        <Heading level={2} weight="medium">
          {title}
        </Heading>
        {description ? <p className="text-ssm text-neutral-subtle">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}
