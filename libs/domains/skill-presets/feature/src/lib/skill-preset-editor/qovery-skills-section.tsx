import { useState } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { SKILL_PRESET_LIMITS, type SkillPresetFinding } from '@qovery/domains/skill-presets/data-access'
import { Button, Checkbox, Icon, InputText, SegmentedControl } from '@qovery/shared/ui'
import { MarkdownField } from '../markdown-field/markdown-field'
import { qoverySkillDescription } from '../utils/qovery-skills'
import { findingFieldId, findingsFor } from '../utils/skill-preset-findings'
import { type QoverySkillChoice, type SkillPresetFormValues } from '../utils/skill-preset-form'
import { QOVERY_SKILL_SIZES, formatTokens } from '../utils/token-budget'

const CHOICES: { value: QoverySkillChoice; label: string }[] = [
  { value: 'AS_IS', label: 'As is' },
  { value: 'OVERLAY', label: 'Add instructions' },
  { value: 'REPLACE', label: 'Replace' },
  { value: 'DISABLE', label: 'Disable' },
]

export interface QoverySkillsSectionProps {
  errors: Record<string, string>
  findings: SkillPresetFinding[]
}

export function QoverySkillsSection({ errors, findings }: QoverySkillsSectionProps) {
  const { control, setValue, getValues } = useFormContext<SkillPresetFormValues>()
  const qoverySkills = useWatch({ control, name: 'qoverySkills' })
  const [selected, setSelected] = useState<string[]>([])

  const allSelected = selected.length === qoverySkills.length
  const toggle = (skillName: string, checked: boolean) =>
    setSelected((current) => (checked ? [...current, skillName] : current.filter((name) => name !== skillName)))

  const applyToSelected = (choice: 'AS_IS' | 'DISABLE') => {
    getValues('qoverySkills').forEach((skill, index) => {
      if (selected.includes(skill.skillName)) {
        setValue(`qoverySkills.${index}.choice`, choice, { shouldDirty: true })
      }
    })
    setSelected([])
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-neutral">
      <div className="flex h-11 items-center gap-3 border-b border-neutral bg-surface-neutral-subtle px-3 text-xs text-neutral-subtle">
        <Checkbox
          checked={allSelected ? true : selected.length > 0 ? 'indeterminate' : false}
          onCheckedChange={(checked) =>
            setSelected(checked === true ? qoverySkills.map(({ skillName }) => skillName) : [])
          }
          aria-label="Select all Qovery skills"
        />
        {selected.length > 0 ? (
          <div className="flex flex-1 items-center gap-2" role="group" aria-label="Change the selected skills">
            <span className="font-medium text-neutral">{selected.length} selected</span>
            <span aria-hidden="true">·</span>
            <Button type="button" size="xs" variant="outline" color="neutral" onClick={() => applyToSelected('AS_IS')}>
              Use as is
            </Button>
            <Button
              type="button"
              size="xs"
              variant="outline"
              color="neutral"
              onClick={() => applyToSelected('DISABLE')}
            >
              Disable
            </Button>
          </div>
        ) : (
          <span className="flex-1">Select skills to change several at once</span>
        )}
      </div>
      <ul className="divide-y divide-neutral">
        {qoverySkills.map((skill, index) => {
          const contentFindings = findingsFor(findings, { field: 'skillContent', skillName: skill.skillName })
          const descriptionFindings = findingsFor(findings, { field: 'skillDescription', skillName: skill.skillName })
          const size = QOVERY_SKILL_SIZES[skill.skillName]
          const hasIssue =
            contentFindings.length + descriptionFindings.length > 0 ||
            Boolean(errors[`qoverySkills.${index}.content`] || errors[`qoverySkills.${index}.description`])

          return (
            <li
              key={skill.skillName}
              className="flex flex-col gap-3 p-3"
              data-testid={`qovery-skill-${skill.skillName}`}
            >
              <div className="flex flex-wrap items-center gap-3">
                <Checkbox
                  checked={selected.includes(skill.skillName)}
                  onCheckedChange={(checked) => toggle(skill.skillName, checked === true)}
                  aria-label={`Select ${skill.skillName}`}
                />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-center gap-2">
                    <span className="font-code text-sm font-medium text-neutral">{skill.skillName}</span>
                    {hasIssue && (
                      <span className="flex items-center gap-1 text-xs text-negative">
                        <Icon iconName="circle-exclamation" iconStyle="regular" aria-hidden="true" />
                        Needs a change
                      </span>
                    )}
                  </span>
                </div>
                <Controller
                  control={control}
                  name={`qoverySkills.${index}.choice`}
                  render={({ field }) => (
                    <SegmentedControl.Root
                      value={field.value}
                      onValueChange={(value) => field.onChange(value as QoverySkillChoice)}
                      aria-label={`How agents use ${skill.skillName}`}
                      className="text-xs"
                    >
                      {CHOICES.map((choice) => (
                        <SegmentedControl.Item
                          key={choice.value}
                          value={choice.value}
                          aria-label={choice.label}
                          className="[&_span]:px-2.5"
                        >
                          {choice.label}
                        </SegmentedControl.Item>
                      ))}
                    </SegmentedControl.Root>
                  )}
                />
              </div>

              <p className="-mt-2 pl-7 text-xs text-neutral-subtle">
                {qoverySkillDescription(skill.skillName)}
                {size && skill.choice !== 'DISABLE' && skill.choice !== 'REPLACE' && (
                  <> · {formatTokens(size.skillMd)} tokens when loaded</>
                )}
              </p>

              {skill.choice === 'DISABLE' && (
                <p className="pl-7 text-xs text-neutral-subtle">
                  <Icon iconName="ban" iconStyle="regular" className="mr-1.5" aria-hidden="true" />
                  Agents never load this skill.
                </p>
              )}

              {skill.choice === 'OVERLAY' && (
                <div className="pl-7">
                  <Controller
                    control={control}
                    name={`qoverySkills.${index}.content`}
                    render={({ field }) => (
                      <MarkdownField
                        id={findingFieldId({ field: 'skillContent', skillName: skill.skillName })}
                        label={`Team instructions for ${skill.skillName}`}
                        hint="Loaded right after the Qovery skill, every time an agent uses it."
                        value={field.value}
                        onChange={field.onChange}
                        maxLength={SKILL_PRESET_LIMITS.skillContentMaxLength}
                        error={errors[`qoverySkills.${index}.content`]}
                        findings={contentFindings}
                        minLines={4}
                      />
                    )}
                  />
                </div>
              )}

              {skill.choice === 'REPLACE' && (
                <div className="flex flex-col gap-3 pl-7">
                  <Controller
                    control={control}
                    name={`qoverySkills.${index}.description`}
                    render={({ field }) => (
                      <div id={findingFieldId({ field: 'skillDescription', skillName: skill.skillName })}>
                        <InputText
                          name={field.name}
                          label="Description"
                          value={field.value}
                          onChange={field.onChange}
                          hint="Agents read it to decide when to load the skill."
                          error={
                            errors[`qoverySkills.${index}.description`] ??
                            (descriptionFindings.length > 0
                              ? descriptionFindings
                                  .map((finding) => `Line ${finding.line}: ${finding.reason}.`)
                                  .join(' ')
                              : undefined)
                          }
                        />
                      </div>
                    )}
                  />
                  <Controller
                    control={control}
                    name={`qoverySkills.${index}.content`}
                    render={({ field }) => (
                      <MarkdownField
                        id={findingFieldId({ field: 'skillContent', skillName: skill.skillName })}
                        label={`Replacement for ${skill.skillName}`}
                        hint="Loaded instead of the Qovery skill. Write the whole skill, not just the differences."
                        value={field.value}
                        onChange={field.onChange}
                        maxLength={SKILL_PRESET_LIMITS.skillContentMaxLength}
                        error={errors[`qoverySkills.${index}.content`]}
                        findings={contentFindings}
                      />
                    )}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default QoverySkillsSection
