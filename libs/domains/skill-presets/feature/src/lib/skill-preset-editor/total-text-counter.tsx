import clsx from 'clsx'
import { useFormContext, useWatch } from 'react-hook-form'
import { SKILL_PRESET_LIMITS, totalPresetTextLength } from '@qovery/domains/skill-presets/data-access'
import { Icon } from '@qovery/shared/ui'
import { type SkillPresetFormValues, toSkillPresetRequest } from '../utils/skill-preset-form'

const format = (value: number) => value.toLocaleString('en-US')

/** All the text a save sends to the review, against q-core's 200,000 character limit. */
export function TotalTextCounter() {
  const { control, getValues } = useFormContext<SkillPresetFormValues>()
  // useWatch can hand back a partial object before every field registers: fill it from the form.
  const values = { ...getValues(), ...useWatch({ control }) } as SkillPresetFormValues
  const total = totalPresetTextLength(toSkillPresetRequest(values))
  const max = SKILL_PRESET_LIMITS.totalTextMaxLength
  const over = total > max

  return (
    <span
      className={clsx('flex items-center gap-1.5 text-xs tabular-nums', over ? 'text-negative' : 'text-neutral-subtle')}
      data-testid="total-text-counter"
    >
      {over && <Icon iconName="circle-exclamation" iconStyle="regular" aria-hidden="true" />}
      {format(total)} / {format(max)} characters
      {over && <span>: over the limit a model can review. Shorten the text to save.</span>}
    </span>
  )
}
