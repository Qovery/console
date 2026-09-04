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
import { OverlaySheet, SheetHeader } from '../sheet/overlay-sheet'

function getHeadersError(value: string) {
  if (!value.trim()) return undefined
  let parsed: unknown
  try {
    parsed = JSON.parse(value)
  } catch {
    return 'Invalid JSON format.'
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return 'Headers must be a JSON object.'
  }
  if (!Object.values(parsed).every((headerValue) => typeof headerValue === 'string')) {
    return 'Header values must be strings.'
  }
  return undefined
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value)
    return (url.protocol === 'http:' || url.protocol === 'https:') && Boolean(url.hostname)
  } catch {
    return false
  }
}

function triggerDescription(trigger: AgenticWorkflowAutomationTrigger) {
  return formatCronExpression(trigger.cronExpression ?? '') || trigger.cronExpression || ''
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
  onRemove?: () => void
  title: string
}) {
  return (
    <div className="flex h-11 items-center justify-between gap-3 rounded-md border border-neutral bg-surface-neutral-component px-3">
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <span className="shrink-0 text-sm text-neutral-subtle">{icon}</span>
        <span className="shrink-0 text-sm font-medium text-neutral">{title}</span>
        {children ? <span className="min-w-0 truncate text-sm text-neutral-subtle">{children}</span> : null}
      </span>
      {onEdit || onRemove ? (
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
            {onRemove ? (
              <DropdownMenu.Item color="red" icon={<Icon iconName="trash" />} onSelect={onRemove}>
                Delete
              </DropdownMenu.Item>
            ) : null}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      ) : null}
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
            {trigger ? 'Update trigger' : 'Add trigger'}
          </Button>
        </div>
      </Section>
    </FormProvider>
  )
}

function WebhookOutputModal({
  allowEmptyUrl,
  onSave,
  output,
  setOpen,
}: {
  allowEmptyUrl?: boolean
  onSave: (output: AgenticWorkflowOutput) => void
  output?: AgenticWorkflowOutput
  setOpen?: (open: boolean) => void
}) {
  const [name, setName] = useState(output?.name ?? '')
  const [url, setUrl] = useState(output?.url ?? '')
  const [headersJson, setHeadersJson] = useState(output?.headersJson ?? '{}')
  const [prompt, setPrompt] = useState(output?.prompt ?? '')
  const headersError = getHeadersError(headersJson)
  const urlError = url.trim() && !isValidUrl(url) ? 'Please enter a valid URL.' : undefined
  const invalid = (!allowEmptyUrl && !url.trim()) || Boolean(urlError) || Boolean(headersError)

  return (
    <Section className="gap-5 p-5">
      <div className="flex flex-col gap-1 pr-8">
        <Heading level={2} className="text-xl font-medium leading-7 text-neutral">
          {output ? 'Edit output' : 'Add output'}
        </Heading>
        <p className="text-sm leading-5 text-neutral-subtle">Send the automation result to a webhook.</p>
      </div>
      <div className="flex flex-col gap-4">
        {allowEmptyUrl ? (
          <InputText
            name="output-name"
            label="Name"
            value={name}
            error={!name.trim() ? 'Please enter an output name.' : undefined}
            onChange={(event) => setName(event.currentTarget.value)}
          />
        ) : null}
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
          disabled={invalid || (allowEmptyUrl && !name.trim())}
          onClick={() => {
            onSave({ name: name.trim() || output?.name, url: url.trim() || null, headersJson, prompt })
            setOpen?.(false)
          }}
        >
          {output ? 'Update output' : 'Add output'}
        </Button>
      </div>
    </Section>
  )
}

export function AutomationSheet({
  allowEmptyOutputUrl = false,
  automation,
  lockWebhookTrigger = false,
  onClose,
  onSave,
}: {
  allowEmptyOutputUrl?: boolean
  automation: AgenticWorkflowAutomation
  lockWebhookTrigger?: boolean
  onClose: () => void
  onSave: (automation: AgenticWorkflowAutomation) => void
}) {
  const { closeModal, openModal } = useModal()
  const [draft, setDraft] = useState<AgenticWorkflowAutomation>(automation)
  const scheduleTrigger = draft.triggers.find((trigger) => trigger.type === 'schedule')
  const webhookTrigger = draft.triggers.find((trigger) => trigger.type === 'webhook')

  const saveTrigger = (trigger: AgenticWorkflowAutomationTrigger) => {
    setDraft((current) => ({
      ...current,
      triggers: current.triggers.some((item) => item.id === trigger.id)
        ? current.triggers.map((item) => (item.id === trigger.id ? trigger : item))
        : [...current.triggers, trigger],
    }))
  }

  const removeTrigger = (id: string) => {
    setDraft((current) => ({ ...current, triggers: current.triggers.filter((item) => item.id !== id) }))
  }

  const addWebhookTrigger = () => {
    if (webhookTrigger) return
    saveTrigger({ id: crypto.randomUUID(), type: 'webhook' })
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

  const openOutputModal = (index?: number) => {
    openModal({
      content: (
        <WebhookOutputModal
          allowEmptyUrl={allowEmptyOutputUrl}
          output={typeof index === 'number' ? draft.outputs[index] : undefined}
          onSave={(output) =>
            setDraft((current) => ({
              ...current,
              outputs:
                typeof index === 'number'
                  ? current.outputs.map((item, itemIndex) => (itemIndex === index ? output : item))
                  : [...current.outputs, output],
            }))
          }
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
      <SheetHeader title="Configure automation" onClose={onClose} />
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
                  disabled={Boolean(scheduleTrigger)}
                  onSelect={() => openScheduleModal()}
                >
                  On a schedule
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  icon={<Icon iconName="webhook" />}
                  disabled={Boolean(webhookTrigger)}
                  onSelect={addWebhookTrigger}
                >
                  From a webhook
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          }
        >
          {draft.triggers.length ? (
            <div className="flex flex-col gap-3">
              {draft.triggers.map((trigger) =>
                trigger.type === 'webhook' ? (
                  <AutomationItemCard
                    key={trigger.id}
                    icon={<Icon iconName="webhook" iconStyle="regular" />}
                    title="Webhook"
                    onRemove={lockWebhookTrigger ? undefined : () => removeTrigger(trigger.id)}
                  >
                    Runs when the agent task webhook is called.
                  </AutomationItemCard>
                ) : (
                  <AutomationItemCard
                    key={trigger.id}
                    icon={<Icon iconName="calendar-day" iconStyle="regular" />}
                    title="Schedule"
                    onEdit={() => openScheduleModal(trigger)}
                    onRemove={() => removeTrigger(trigger.id)}
                  >
                    {triggerDescription(trigger)}
                  </AutomationItemCard>
                )
              )}
            </div>
          ) : null}
        </AutomationSection>
        <AutomationSection
          title="Outputs"
          description="Optional. Send the automation result to one or more webhooks."
          action={
            <Button type="button" variant="outline" color="neutral" size="sm" onClick={() => openOutputModal()}>
              <Icon iconName="circle-plus" iconStyle="regular" />
              Add
            </Button>
          }
        >
          {draft.outputs.length ? (
            <div className="flex flex-col gap-2">
              {draft.outputs.map((output, index) => (
                <AutomationItemCard
                  key={index}
                  icon={<Icon iconName="webhook" iconStyle="regular" />}
                  title="Webhook"
                  onEdit={() => openOutputModal(index)}
                  onRemove={() =>
                    setDraft((current) => ({
                      ...current,
                      outputs: current.outputs.filter((_, itemIndex) => itemIndex !== index),
                    }))
                  }
                >
                  {output.url || output.name || 'No webhook URL'}
                </AutomationItemCard>
              ))}
            </div>
          ) : null}
        </AutomationSection>
      </div>
      <div className="flex justify-end gap-2 border-t border-neutral p-4">
        <Button type="button" variant="plain" color="neutral" size="md" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          size="md"
          disabled={draft.triggers.length === 0}
          onClick={() => {
            onSave(draft)
            onClose()
          }}
        >
          Apply changes
        </Button>
      </div>
    </OverlaySheet>
  )
}
