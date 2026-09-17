import { useState } from 'react'
import { Button, Checkbox, Heading, Icon, Section } from '@qovery/shared/ui'
import { type AgenticWorkflowContextService } from '../../agentic-workflow-context'

export function QoveryServiceContextModal({
  isLoading,
  onSave,
  services,
  setOpen,
  value,
}: {
  isLoading: boolean
  onSave: (services: AgenticWorkflowContextService[]) => Promise<void> | void
  services: AgenticWorkflowContextService[]
  setOpen?: (open: boolean) => void
  value: AgenticWorkflowContextService[]
}) {
  const [selectedIds, setSelectedIds] = useState(value.map(({ id }) => id))
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string>()
  const hasSelectedService = services.some(({ id }) => selectedIds.includes(id))

  return (
    <Section className="gap-5 p-5">
      <div className="flex flex-col gap-1 pr-8">
        <Heading level={2} className="text-xl font-medium leading-7 text-neutral">
          Import existing Qovery services
        </Heading>
        <p className="text-sm leading-5 text-neutral-subtle">
          Link Qovery services from this environment. The agent will use them as context.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-neutral">Services to include</h3>
          <Button
            type="button"
            variant="plain"
            color="neutral"
            size="xs"
            disabled={isLoading || isSaving}
            onClick={() => setSelectedIds(hasSelectedService ? [] : services.map(({ id }) => id))}
          >
            {hasSelectedService ? 'Unselect all' : 'Select all'}
          </Button>
        </div>
        <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
          {isLoading ? (
            <p className="py-4 text-center text-sm text-neutral-subtle">Loading services...</p>
          ) : services.length === 0 ? (
            <p className="py-4 text-center text-sm text-neutral-subtle">No service available in this environment.</p>
          ) : (
            services.map(({ id, name, type }) => {
              const checked = selectedIds.includes(id)

              return (
                <label
                  key={id}
                  className="flex h-11 cursor-pointer items-center gap-1 rounded border border-neutral bg-surface-neutral-subtle py-1.5 pl-1.5 pr-2"
                >
                  <Icon name={type} width={20} height={20} />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral">{name}</span>
                  <Checkbox
                    checked={checked}
                    disabled={isSaving}
                    onCheckedChange={(checked) =>
                      setSelectedIds((ids) =>
                        checked === true ? [...ids, id] : ids.filter((selectedId) => selectedId !== id)
                      )
                    }
                  />
                </label>
              )
            })
          )}
        </div>
      </div>
      {saveError ? <p className="text-sm text-negative">{saveError}</p> : null}
      <div className="flex justify-end gap-2">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="plain"
            color="neutral"
            size="md"
            disabled={isSaving}
            onClick={() => setOpen?.(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="md"
            loading={isSaving}
            disabled={isSaving}
            onClick={async () => {
              setSaveError(undefined)
              setIsSaving(true)
              try {
                await onSave(services.filter(({ id }) => selectedIds.includes(id)))
                setOpen?.(false)
              } catch {
                setSaveError('Unable to add the selected services. Try again.')
              } finally {
                setIsSaving(false)
              }
            }}
          >
            Confirm
          </Button>
        </div>
      </div>
    </Section>
  )
}
