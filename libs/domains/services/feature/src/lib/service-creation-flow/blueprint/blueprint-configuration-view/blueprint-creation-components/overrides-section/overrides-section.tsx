import { type ReactNode } from 'react'
import { Heading, Icon, Section } from '@qovery/shared/ui'
import { BlueprintSection } from '../blueprint-section/blueprint-section'

export interface OverridesSectionProps {
  active: boolean
  children?: ReactNode
  disabled?: boolean
  onClick: () => void
}

export function OverridesSection({ active, children, disabled = false, onClick }: OverridesSectionProps) {
  if (!active) {
    return (
      <BlueprintSection
        disabled={disabled}
        iconName="code"
        title="Overrides"
        description="For advanced users"
        onClick={onClick}
      />
    )
  }

  return (
    <Section className="rounded-xl border border-neutral bg-surface-neutral shadow-sm">
      <div className="flex flex-col gap-1 px-4 py-4">
        <div className="flex items-center gap-2">
          <Icon iconName="code" className="text-sm text-neutral-subtle" />
          <Heading level={2} className="leading-6">
            Overrides
          </Heading>
          <span className="h-1 w-1 rounded-full bg-surface-neutral-component" aria-hidden="true" />
          <p className="text-sm leading-5 text-neutral-subtle">For advanced users</p>
        </div>
        <p className="text-sm leading-5 text-neutral-subtle">
          Use overrides to customize how your service is built or run. Entirely optional.
        </p>
      </div>

      {children && <div className="flex flex-col gap-3 px-4 pb-4">{children}</div>}
    </Section>
  )
}
