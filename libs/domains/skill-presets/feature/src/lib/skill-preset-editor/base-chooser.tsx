import { type SkillPresetBase } from '@qovery/domains/skill-presets/data-access'
import { InputSelect } from '@qovery/shared/ui'
import { SKILL_PRESET_BASES } from '../utils/qovery-skills'

export interface BaseChooserProps {
  value: SkillPresetBase
  onChange: (base: SkillPresetBase) => void
}

export function BaseChooser({ value, onChange }: BaseChooserProps) {
  return (
    <InputSelect
      label="Qovery skills"
      value={value}
      onChange={(base) => onChange(base as SkillPresetBase)}
      options={SKILL_PRESET_BASES.map((base) => ({
        value: base.value,
        label: base.title,
      }))}
    />
  )
}
