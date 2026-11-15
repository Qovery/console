import { useState } from 'react'
import { Controller, useFieldArray, useFormContext, useFormState, useWatch } from 'react-hook-form'
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

interface QoverySkillRowProps {
  index: number
  skillName: string
  findings: SkillPresetFinding[]
  selected: boolean
  onSelect: (checked: boolean) => void
}

/** One Qovery skill. It watches only its own fields, so typing elsewhere does not re-render it. */
function QoverySkillRow({ index, skillName, findings, selected, onSelect }: QoverySkillRowProps) {
  const { control, getFieldState } = useFormContext<SkillPresetFormValues>()
  const choice = useWatch({ control, name: `qoverySkills.${index}.choice` })
  const formState = useFormState({
    control,
    name: [`qoverySkills.${index}.content`, `qoverySkills.${index}.description`],
  })
  const contentFindings = findingsFor(findings, { field: 'skillContent', skillName })
  const descriptionFindings = findingsFor(findings, { field: 'skillDescription', skillName })
  const size = QOVERY_SKILL_SIZES[skillName]
  const hasIssue =
    contentFindings.length + descriptionFindings.length > 0 ||
    getFieldState(`qoverySkills.${index}.content`, formState).invalid ||
    getFieldState(`qoverySkills.${index}.description`, formState).invalid

  return (
    <li className="flex flex-col gap-3 p-3" data-testid={`qovery-skill-${skillName}`}>
      <div className="flex flex-wrap items-center gap-3">
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelect(checked === true)}
          aria-label={`Select ${skillName}`}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex items-center gap-2">
            <span className="font-code text-sm font-medium text-neutral">{skillName}</span>
            {hasIssue && (
              <span className="flex items-center gap-1 text-xs text-negative">
                <Icon iconName="circle-exclamation" iconStyle="regular" aria-hidden="true" />
                Needs a change
              </span>
            )}
          </span>
          <span className="text-xs text-neutral-subtle">
            {qoverySkillDescription(skillName)}
            {size && choice !== 'DISABLE' && choice !== 'REPLACE' && (
              <> · {formatTokens(size.skillMd)} tokens when loaded</>
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
              aria-label={`How agents use ${skillName}`}
              className="text-xs"
            >
              {CHOICES.map((item) => (
                // SegmentedControl.Item renders its label twice (active and inactive layers), so screen
                // readers read it twice. The aria-label gives each item a single name.
                <SegmentedControl.Item
                  key={item.value}
                  value={item.value}
                  aria-label={item.label}
                  className="[&_span]:px-2.5"
                >
                  {item.label}
                </SegmentedControl.Item>
              ))}
            </SegmentedControl.Root>
          )}
        />
      </div>

      {choice === 'DISABLE' && (
        <p className="pl-7 text-xs text-neutral-subtle">
          <Icon iconName="ban" iconStyle="regular" className="mr-1.5" aria-hidden="true" />
          Agents never load this skill.
        </p>
      )}

      {choice === 'REPLACE' && (
        <div className="pl-7">
          <Controller
            control={control}
            name={`qoverySkills.${index}.description`}
            render={({ field, fieldState }) => (
              <div id={findingFieldId({ field: 'skillDescription', skillName })}>
                <InputText
                  name={field.name}
                  label="Description"
                  value={field.value}
                  onChange={field.onChange}
                  hint="Agents read it to decide when to load the skill."
                  error={
                    fieldState.error?.message ??
                    (descriptionFindings.length > 0
                      ? descriptionFindings.map((finding) => `Line ${finding.line}: ${finding.reason}.`).join(' ')
                      : undefined)
                  }
                />
              </div>
            )}
          />
        </div>
      )}

      {(choice === 'OVERLAY' || choice === 'REPLACE') && (
        <div className="pl-7">
          <Controller
            control={control}
            name={`qoverySkills.${index}.content`}
            render={({ field, fieldState }) => (
              <MarkdownField
                id={findingFieldId({ field: 'skillContent', skillName })}
                label={choice === 'OVERLAY' ? `Team instructions for ${skillName}` : `Replacement for ${skillName}`}
                hint={
                  choice === 'OVERLAY'
                    ? 'Loaded right after the Qovery skill, every time an agent uses it.'
                    : 'Loaded instead of the Qovery skill. Write the whole skill, not just the differences.'
                }
                value={field.value}
                onChange={field.onChange}
                maxLength={SKILL_PRESET_LIMITS.skillContentMaxLength}
                error={fieldState.error?.message}
                findings={contentFindings}
                minLines={choice === 'OVERLAY' ? 4 : 6}
              />
            )}
          />
        </div>
      )}
    </li>
  )
}

export interface QoverySkillsSectionProps {
  findings: SkillPresetFinding[]
}

export function QoverySkillsSection({ findings }: QoverySkillsSectionProps) {
  const { control, setValue, getValues } = useFormContext<SkillPresetFormValues>()
  // The list of Qovery skills never changes while editing: only their fields do.
  const { fields } = useFieldArray({ control, name: 'qoverySkills', keyName: 'fieldKey' })
  const [selected, setSelected] = useState<string[]>([])

  const allSelected = selected.length === fields.length
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
          onCheckedChange={(checked) => setSelected(checked === true ? fields.map(({ skillName }) => skillName) : [])}
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
        {fields.map((field, index) => (
          <QoverySkillRow
            key={field.fieldKey}
            index={index}
            skillName={field.skillName}
            findings={findings}
            selected={selected.includes(field.skillName)}
            onSelect={(checked) => toggle(field.skillName, checked)}
          />
        ))}
      </ul>
    </div>
  )
}
