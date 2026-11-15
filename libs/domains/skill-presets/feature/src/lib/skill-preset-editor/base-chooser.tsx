import { type SkillPresetBase } from '@qovery/domains/skill-presets/data-access'
import { Icon, RadioGroup } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { SKILL_PRESET_BASES } from '../utils/qovery-skills'

export interface BaseChooserProps {
  value: SkillPresetBase
  onChange: (base: SkillPresetBase) => void
}

export function BaseChooser({ value, onChange }: BaseChooserProps) {
  return (
    <RadioGroup.Root
      value={value}
      onValueChange={(base) => onChange(base as SkillPresetBase)}
      className="grid grid-cols-1 gap-3 lg:grid-cols-3"
      aria-label="Qovery skills to start from"
    >
      {SKILL_PRESET_BASES.map((base) => {
        const checked = value === base.value
        return (
          <label
            key={base.value}
            className={twMerge(
              'flex cursor-pointer flex-col gap-2 rounded-md border border-neutral bg-surface-neutral p-3 transition-colors hover:bg-surface-neutral-subtle',
              checked && 'border-brand-strong'
            )}
          >
            <span className="flex items-center gap-2">
              <RadioGroup.Item
                value={base.value}
                aria-labelledby={`base-${base.value}-title`}
                aria-describedby={`base-${base.value}-description`}
              />
              <Icon iconName={base.icon} iconStyle="regular" className="text-neutral-subtle" aria-hidden="true" />
              <span id={`base-${base.value}-title`} className="text-sm font-medium text-neutral">
                {base.title}
              </span>
            </span>
            <span id={`base-${base.value}-description`} className="flex flex-col gap-1.5 text-xs">
              <span className="text-neutral-subtle">{base.description}</span>
              <span className="flex items-center gap-1.5 text-neutral">
                <Icon iconName="gauge-simple" iconStyle="regular" className="text-neutral-subtle" aria-hidden="true" />
                {base.weight}
              </span>
            </span>
          </label>
        )
      })}
    </RadioGroup.Root>
  )
}

export default BaseChooser
