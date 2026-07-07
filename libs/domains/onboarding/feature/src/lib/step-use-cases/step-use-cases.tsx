import { type IconName } from '@fortawesome/fontawesome-common-types'
import { useState } from 'react'
import { Button, Icon } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'

const USE_CASES: Array<{ value: string; label: string; iconName: IconName }> = [
  {
    value: 'ai-workflows',
    label: 'Build workflows where AI can take actions on my systems with full auditability',
    iconName: 'microchip-ai',
  },
  {
    value: 'rde',
    label: 'Enable my non-tech team to ship apps',
    iconName: 'users',
  },
  {
    value: 'spec-to-prod',
    label: 'Go from spec to production with AI coding agents',
    iconName: 'diagram-project',
  },
  {
    value: 'automate-deployments',
    label: 'Automate deployments without manual steps',
    iconName: 'rocket',
  },
  {
    value: 'ephemeral-environments',
    label: 'Create environments on demand (testing/dev/QA)',
    iconName: 'flask',
  },
  {
    value: 'manage-kubernetes',
    label: 'Manage Kubernetes without the overhead',
    iconName: 'dharmachakra',
  },
]

interface UseCaseCardProps {
  value: string
  label: string
  iconName: IconName
  colSpan: string
  selected: boolean
  onToggle: (value: string) => void
}

function UseCaseCard({ value, label, iconName, colSpan, selected, onToggle }: UseCaseCardProps) {
  return (
    <div
      role="checkbox"
      aria-checked={selected}
      tabIndex={0}
      onClick={() => onToggle(value)}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          onToggle(value)
        }
      }}
      className={twMerge(
        'focus-visible:outline-brand-11 flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        colSpan,
        selected
          ? 'border-brand-component bg-surface-brand-subtle'
          : 'border-neutral bg-background hover:border-neutral-component hover:bg-surface-neutral-subtle'
      )}
    >
      <Icon iconName={iconName} iconStyle="regular" className="shrink-0 text-base text-neutral" />
      <span className="text-sm font-medium text-neutral">{label}</span>
    </div>
  )
}

export interface StepUseCasesProps {
  onSubmit: (useCases: string[]) => void
  onBack: () => void
}

export function StepUseCases({ onSubmit, onBack }: StepUseCasesProps) {
  const [selected, setSelected] = useState<string[]>([])

  const toggle = (value: string) => {
    setSelected((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
  }

  return (
    <div className="mx-auto max-w-content-with-navigation-left pb-10">
      <h1 className="h3 mb-3 text-neutral">What are you looking to do?</h1>
      <p className="mb-10 text-sm text-neutral">Select all that apply.</p>
      <div className="grid grid-cols-6 gap-3">
        {USE_CASES.map((useCase) => (
          <UseCaseCard
            key={useCase.value}
            value={useCase.value}
            label={useCase.label}
            iconName={useCase.iconName}
            colSpan="col-span-2"
            selected={selected.includes(useCase.value)}
            onToggle={toggle}
          />
        ))}
      </div>
      <div className="mt-10 flex justify-between border-t border-surface-neutral-subtle pt-5">
        <Button type="button" color="neutral" variant="surface" size="lg" onClick={onBack}>
          <Icon iconName="arrow-left" />
          Back
        </Button>
        <Button type="button" size="lg" onClick={() => onSubmit(selected)}>
          Continue
        </Button>
      </div>
    </div>
  )
}

export default StepUseCases
