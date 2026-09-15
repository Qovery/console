import { useState } from 'react'
import { Button, Heading, InputSelect, Section } from '@qovery/shared/ui'
import { type AgenticWorkflowContextService } from '../../agentic-workflow-context'

export function QoveryServiceContextModal({
  isLoading,
  onSave,
  services,
  setOpen,
  value,
}: {
  isLoading: boolean
  onSave: (services: AgenticWorkflowContextService[]) => void
  services: AgenticWorkflowContextService[]
  setOpen?: (open: boolean) => void
  value: AgenticWorkflowContextService[]
}) {
  const [selectedIds, setSelectedIds] = useState(value.map(({ id }) => id))

  return (
    <Section className="gap-5 p-5">
      <div className="flex flex-col gap-1 pr-8">
        <Heading level={2} className="text-xl font-medium leading-7 text-neutral">
          Add Qovery services
        </Heading>
        <p className="text-sm leading-5 text-neutral-subtle">
          Select services from this environment to give the agent their Qovery context.
        </p>
      </div>
      <InputSelect
        isMulti
        isSearchable
        portal
        label="Qovery services"
        value={selectedIds}
        options={services.map(({ id, name, type }) => ({ value: id, label: name, description: type }))}
        isLoading={isLoading}
        onChange={(ids) => setSelectedIds(ids as string[])}
      />
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="plain"
          color="neutral"
          size="md"
          disabled={selectedIds.length === 0}
          onClick={() => setSelectedIds([])}
        >
          Reset all
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="plain" color="neutral" size="md" onClick={() => setOpen?.(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            size="md"
            onClick={() => {
              onSave(services.filter(({ id }) => selectedIds.includes(id)))
              setOpen?.(false)
            }}
          >
            Apply changes
          </Button>
        </div>
      </div>
    </Section>
  )
}
