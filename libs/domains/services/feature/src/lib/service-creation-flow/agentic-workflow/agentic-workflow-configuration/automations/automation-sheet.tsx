import { type ReactNode, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Button, DropdownMenu, Heading, Icon, InputText, InputTextArea, Section, useModal } from '@qovery/shared/ui'
import { formatCronExpression } from '@qovery/shared/util-js'
import { TimezoneSetting } from '../../../../timezone-setting/timezone-setting'
import {
  type AgenticWorkflowAutomation,
  type AgenticWorkflowAutomationTrigger,
  type AgenticWorkflowOutput,
} from '../../agentic-workflow-context'
import { OverlaySheet, SheetHeader } from '../sheet'

function getJsonError(value: string) {
  if (!value.trim()) return undefined
  try {
    JSON.parse(value)
    return undefined
  } catch {
    return 'Invalid JSON format.'
  }
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value)
    return (url.protocol === 'http:' || url.protocol === 'https:') && Boolean(url.hostname)
  } catch {
    return false
  }
}

function triggerIconName(trigger: AgenticWorkflowAutomationTrigger) {
  return trigger.type === 'schedule' ? 'calendar-day' : 'webhook'
}

function triggerTitle(trigger: AgenticWorkflowAutomationTrigger) {
  return trigger.type === 'schedule' ? 'Schedule' : 'Webhook'
}

function triggerDescription(trigger: AgenticWorkflowAutomationTrigger) {
  if (trigger.type === 'schedule') {
    return formatCronExpression(trigger.cronExpression ?? '') || trigger.cronExpression || ''
  }
  return 'Runs when the agent task webhook is called.'
}

function AutomationItemCard({
  children,
  icon,
  onEdit,
  onRemove,
  title,
}: {
  children?: ReactNode
  icon: ReactNode
  onEdit?: () => void
  onRemove: () => void
  title: string
}) {
  return (
    <div className="flex h-11 items-center justify-between gap-3 rounded-md border border-neutral bg-surface-neutral-component px-3">
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <span className="shrink-0 text-sm text-neutral-subtle">{icon}</span>
        <span className="shrink-0 text-sm font-medium text-neutral">{title}</span>
        {children ? <span className="min-w-0 truncate text-sm text-neutral-subtle">{children}</span> : null}
      </span>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button type="button" variant="plain" color="neutral" size="xs" iconOnly aria-label={`${title} actions`}>
            <Icon iconName="ellipsis" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" className="z-dropdown w-32">
          {onEdit ? (
            <DropdownMenu.Item icon={<Icon iconName="pen" />} onSelect={onEdit}>
              Edit
            </DropdownMenu.Item>
          ) : null}
          <DropdownMenu.Item color="red" icon={<Icon iconName="trash" />} onSelect={onRemove}>
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  )
}

function AutomationSection({
  action,
  children,
  description,
  title,
}: {
  action?: ReactNode
  children?: ReactNode
  description: string
  title: string
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-neutral pt-4">
      <div className="flex items-center gap-5">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-5 text-neutral">{title}</p>
          <p className="text-ssm leading-[18px] text-neutral-subtle">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

function ScheduledTriggerModal({
  onSave,
  setOpen,
  trigger,
}: {
  onSave: (trigger: AgenticWorkflowAutomationTrigger) => void
  setOpen?: (open: boolean) => void
  trigger?: AgenticWorkflowAutomationTrigger
}) {
  const [cronExpression, setCronExpression] = useState(trigger?.cronExpression ?? '0 8 * * 1-5')
  const methods = useForm<{ timezone: string }>({
    defaultValues: { timezone: trigger?.timezone ?? 'Etc/UTC' },
    mode: 'onChange',
  })
  const formattedSchedule = formatCronExpression(cronExpression)
  const invalid = !formattedSchedule

  return (
    <FormProvider {...methods}>
      <Section className="gap-5 p-5">
        <div className="flex flex-col gap-1 pr-8">
          <Heading level={2} className="text-xl font-medium leading-7 text-neutral">
            {trigger ? 'Edit schedule trigger' : 'Add schedule trigger'}
          </Heading>
          <p className="text-sm leading-5 text-neutral-subtle">Run this agent task automatically on a schedule.</p>
        </div>
        <div className="flex flex-col gap-4">
          <InputText
            name="cron-expression"
            label="Cron expression"
            value={cronExpression}
            hint={
              formattedSchedule ? `${formattedSchedule} (${methods.watch('timezone')})` : 'Invalid cron expression.'
            }
            error={invalid ? 'Invalid cron expression.' : undefined}
            onChange={(event) => setCronExpression(event.currentTarget.value)}
          />
          <TimezoneSetting portal />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="plain" color="neutral" size="md" onClick={() => setOpen?.(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            size="md"
            disabled={invalid}
            onClick={() => {
              onSave({
                id: trigger?.id ?? crypto.randomUUID(),
                type: 'schedule',
                cronExpression,
                timezone: methods.getValues('timezone'),
              })
              setOpen?.(false)
            }}
          >
            {trigger ? 'Save trigger' : 'Add trigger'}
          </Button>
        </div>
      </Section>
    </FormProvider>
  )
}

function WebhookOutputModal({
  onSave,
  output,
  setOpen,
}: {
  onSave: (output: AgenticWorkflowOutput) => void
  output?: AgenticWorkflowOutput
  setOpen?: (open: boolean) => void
}) {
  const [url, setUrl] = useState(output?.url ?? '')
  const [headersJson, setHeadersJson] = useState(output?.headersJson ?? '{}')
  const [prompt, setPrompt] = useState(output?.prompt ?? '')
  const headersError = getJsonError(headersJson)
  const urlError = url.trim() && !isValidUrl(url) ? 'Please enter a valid URL.' : undefined
  const invalid = !url.trim() || Boolean(urlError) || Boolean(headersError)

  return (
    <Section className="gap-5 p-5">
      <div className="flex flex-col gap-1 pr-8">
        <Heading level={2} className="text-xl font-medium leading-7 text-neutral">
          {output ? 'Edit output' : 'Add output'}
        </Heading>
        <p className="text-sm leading-5 text-neutral-subtle">Send the automation result to a webhook.</p>
      </div>
      <div className="flex flex-col gap-4">
        <InputText
          name="output-url"
          label="Webhook URL"
          value={url}
          error={urlError}
          onChange={(event) => setUrl(event.currentTarget.value)}
        />
        <InputTextArea
          name="output-headers"
          label="Headers (JSON)"
          value={headersJson}
          error={headersError}
          onChange={(event) => setHeadersJson(event.currentTarget.value)}
        />
        <InputTextArea
          name="output-prompt"
          label="Prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.currentTarget.value)}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="plain" color="neutral" size="md" onClick={() => setOpen?.(false)}>
          Cancel
        </Button>
        <Button
          type="button"
          size="md"
          disabled={invalid}
          onClick={() => {
            onSave({ url, headersJson, prompt })
            setOpen?.(false)
          }}
        >
          {output ? 'Save output' : 'Add output'}
        </Button>
      </div>
    </Section>
  )
}

export function AutomationSheet({
  automation,
  onClose,
  onRemove,
  onSave,
}: {
  automation?: AgenticWorkflowAutomation
  onClose: () => void
  onRemove?: () => void
  onSave: (automation: AgenticWorkflowAutomation) => void
}) {
  const { closeModal, openModal } = useModal()
  const [draft, setDraft] = useState<AgenticWorkflowAutomation>(
    () =>
      automation ?? {
        id: crypto.randomUUID(),
        triggers: [],
        output: undefined,
      }
  )
  const canSave = draft.triggers.length > 0

  const saveTrigger = (trigger: AgenticWorkflowAutomationTrigger) => {
    setDraft((current) => ({
      ...current,
      triggers: current.triggers.some((item) => item.id === trigger.id)
        ? current.triggers.map((item) => (item.id === trigger.id ? trigger : item))
        : [...current.triggers, trigger],
    }))
  }

  const openScheduleModal = (trigger?: AgenticWorkflowAutomationTrigger) => {
    openModal({
      content: (
        <ScheduledTriggerModal
          trigger={trigger}
          onSave={saveTrigger}
          setOpen={(open) => {
            if (!open) closeModal()
          }}
        />
      ),
      options: { width: 488 },
    })
  }

  const addWebhookTrigger = () => {
    if (draft.triggers.some((trigger) => trigger.type === 'webhook')) return
    saveTrigger({ id: crypto.randomUUID(), type: 'webhook' })
  }

  const openOutputModal = () => {
    openModal({
      content: (
        <WebhookOutputModal
          output={draft.output}
          onSave={(output) => setDraft((current) => ({ ...current, output }))}
          setOpen={(open) => {
            if (!open) closeModal()
          }}
        />
      ),
      options: { width: 488 },
    })
  }

  return (
    <OverlaySheet onClose={onClose}>
      <SheetHeader title={automation ? 'Edit automation' : 'Add automation'} onClose={onClose} />
      <div className="flex flex-1 flex-col gap-4 overflow-auto px-5 pb-5">
        <AutomationSection
          title="Triggers"
          description="At least one trigger is required. A trigger can be a schedule or a webhook."
          action={
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button type="button" variant="outline" color="neutral" size="sm">
                  Add
                  <Icon iconName="angle-down" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end" className="z-dropdown w-56">
                <DropdownMenu.Item
                  icon={<Icon iconName="calendar-day" iconStyle="regular" />}
                  onSelect={() => openScheduleModal()}
                >
                  On a schedule
                </DropdownMenu.Item>
                <DropdownMenu.Item icon={<Icon iconName="webhook" />} onSelect={addWebhookTrigger}>
                  From a webhook
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          }
        >
          {draft.triggers.length ? (
            <div className="flex flex-col gap-2">
              {draft.triggers.map((trigger) => (
                <AutomationItemCard
                  key={trigger.id}
                  icon={<Icon iconName={triggerIconName(trigger)} iconStyle="regular" />}
                  title={triggerTitle(trigger)}
                  onEdit={trigger.type === 'schedule' ? () => openScheduleModal(trigger) : undefined}
                  onRemove={() =>
                    setDraft((current) => ({
                      ...current,
                      triggers: current.triggers.filter((item) => item.id !== trigger.id),
                    }))
                  }
                >
                  {triggerDescription(trigger)}
                </AutomationItemCard>
              ))}
            </div>
          ) : null}
        </AutomationSection>
        <AutomationSection
          title="Output"
          description="Optional. Send the automation result to a webhook."
          action={
            draft.output ? undefined : (
              <Button type="button" variant="outline" color="neutral" size="sm" onClick={openOutputModal}>
                <Icon iconName="circle-plus" iconStyle="regular" />
                Add
              </Button>
            )
          }
        >
          {draft.output ? (
            <AutomationItemCard
              icon={<Icon iconName="webhook" iconStyle="regular" />}
              title="Webhook"
              onEdit={openOutputModal}
              onRemove={() => setDraft((current) => ({ ...current, output: undefined }))}
            >
              {draft.output.url}
            </AutomationItemCard>
          ) : null}
        </AutomationSection>
      </div>
      <div className="flex items-center justify-between border-t border-neutral p-4">
        <div>
          {onRemove ? (
            <Button type="button" variant="plain" color="red" size="md" onClick={onRemove}>
              Remove
            </Button>
          ) : null}
        </div>
        <Button
          type="button"
          size="md"
          disabled={!canSave}
          onClick={() => {
            onSave(draft)
            onClose()
          }}
        >
          {automation ? 'Save automation' : 'Add automation'}
        </Button>
      </div>
    </OverlaySheet>
  )
}
