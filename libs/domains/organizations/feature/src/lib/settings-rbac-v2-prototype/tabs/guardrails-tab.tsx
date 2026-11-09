import { useState } from 'react'
import { Button, Icon, InputSelect, InputText, InputToggle } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { GUARDRAILS, type Guardrail, type ResourceLimitRule, TAG_KEYS } from '../rbac-v2-mock-data'
import { Panel } from '../rbac-v2-ui'

function ResourceLimitRules({
  rules,
  disabled,
  onChange,
}: {
  rules: ResourceLimitRule[]
  disabled: boolean
  onChange: (rules: ResourceLimitRule[]) => void
}) {
  const taggedRules = rules.filter((rule) => rule.condition)
  const defaultRule = rules.find((rule) => !rule.condition)
  const update = (id: string, patch: Partial<ResourceLimitRule>) =>
    onChange(rules.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)))

  const limits = (rule: ResourceLimitRule) => (
    <>
      <span className="whitespace-nowrap text-xs text-neutral-subtle">then max</span>
      <InputText
        className="w-24"
        name={`${rule.id}-cpu`}
        label="vCPU"
        disabled={disabled}
        value={rule.maxCpu}
        onChange={(event) => update(rule.id, { maxCpu: event.target.value })}
      />
      <InputText
        className="w-24"
        name={`${rule.id}-memory`}
        label="Memory (GB)"
        disabled={disabled}
        value={rule.maxMemory}
        onChange={(event) => update(rule.id, { maxMemory: event.target.value })}
      />
    </>
  )

  return (
    <div className={twMerge('mt-3 flex flex-col gap-2 rounded border border-neutral p-3', disabled && 'opacity-60')}>
      {taggedRules.map((rule) => {
        const tagKey = TAG_KEYS.find((tag) => tag.key === rule.condition?.key)
        return (
          <div key={rule.id} className="flex items-center gap-2">
            <span className="w-14 text-xs font-medium text-neutral-subtle">If label</span>
            <InputSelect
              className="w-40"
              label="Key"
              portal
              disabled={disabled}
              value={rule.condition?.key}
              onChange={(value) => update(rule.id, { condition: { key: value as string, operator: '=', value: '' } })}
              options={TAG_KEYS.map((tag) => ({ label: tag.key, value: tag.key }))}
            />
            <span className="text-xs text-neutral-subtle">=</span>
            <InputSelect
              className="w-36"
              label="Value"
              portal
              disabled={disabled}
              value={rule.condition?.value}
              onChange={(value) =>
                update(rule.id, {
                  condition: { key: rule.condition?.key ?? '', operator: '=', value: value as string },
                })
              }
              options={(tagKey?.values ?? []).map((value) => ({ label: value, value }))}
            />
            {limits(rule)}
            <Button
              type="button"
              variant="plain"
              color="neutral"
              size="md"
              iconOnly
              disabled={disabled}
              aria-label="Remove rule"
              onClick={() => onChange(rules.filter((r) => r.id !== rule.id))}
            >
              <Icon iconName="trash-can" iconStyle="regular" />
            </Button>
          </div>
        )
      })}
      <Button
        type="button"
        size="sm"
        variant="outline"
        color="neutral"
        className="self-start"
        disabled={disabled}
        onClick={() =>
          onChange([
            ...taggedRules,
            {
              id: `rule-${Date.now()}`,
              condition: { key: 'env_type', operator: '=', value: 'staging' },
              maxCpu: '2',
              maxMemory: '4',
            },
            ...(defaultRule ? [defaultRule] : []),
          ])
        }
      >
        <Icon iconName="plus" />
        Add rule
      </Button>
      {defaultRule && (
        <div className="flex items-center gap-2 border-t border-neutral pt-2">
          <span className="w-[13.5rem] text-xs font-medium text-neutral-subtle">
            Otherwise, for every other service
          </span>
          {limits(defaultRule)}
        </div>
      )}
      <p className="text-xs text-neutral-subtle">
        When several rules match a service, the strictest applies. A role can set its own limits; the stricter of the
        two wins.
      </p>
    </div>
  )
}

// A flat list for now: Qovery provides the guardrails, admins turn them on or off and set their values
export function GuardrailsTab() {
  const [guardrails, setGuardrails] = useState(GUARDRAILS)
  const update = (id: string, patch: Partial<Guardrail>) =>
    setGuardrails(guardrails.map((guardrail) => (guardrail.id === id ? { ...guardrail, ...patch } : guardrail)))

  return (
    <Panel
      title="Company guardrails"
      description="Checks that apply to every principal, admins and agents included. RBAC is checked first, then guardrails: a guardrail always wins, no role can lift it. Turn on the ones you need."
    >
      <div className="divide-y divide-neutral">
        {guardrails.map((guardrail) => (
          <div key={guardrail.id} className="px-4 py-3">
            <div className="flex items-center gap-4">
              <InputToggle small value={guardrail.enabled} onChange={(enabled) => update(guardrail.id, { enabled })} />
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral">{guardrail.title}</p>
                <p className="text-xs text-neutral-subtle">{guardrail.description}</p>
              </div>
              <span className="w-36 text-right text-xs text-neutral-subtle">
                {guardrail.blockedLast30d > 0 ? `${guardrail.blockedLast30d} actions blocked (30d)` : 'Nothing blocked'}
              </span>
            </div>
            {guardrail.rules && (
              <div className="pl-12">
                <ResourceLimitRules
                  rules={guardrail.rules}
                  disabled={!guardrail.enabled}
                  onChange={(rules) => update(guardrail.id, { rules })}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </Panel>
  )
}
