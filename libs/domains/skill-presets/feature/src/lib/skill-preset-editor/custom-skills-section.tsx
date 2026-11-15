import { Controller, useFieldArray, useFormContext, useFormState, useWatch } from 'react-hook-form'
import { SKILL_PRESET_LIMITS, type SkillPresetFinding } from '@qovery/domains/skill-presets/data-access'
import { Button, Icon, InputText, InputTextArea, useModal } from '@qovery/shared/ui'
import { MarkdownField } from '../markdown-field/markdown-field'
import { findingFieldId, findingsFor } from '../utils/skill-preset-findings'
import { type SkillPresetFormValues, effectiveQoverySkills } from '../utils/skill-preset-form'
import { type LibrarySkill, SkillLibraryModal } from './skill-library-modal'

interface CustomSkillRowProps {
  index: number
  findings: SkillPresetFinding[]
  onRemove: () => void
}

/** One skill of the organization. It watches only its own name, so typing elsewhere does not re-render it. */
function CustomSkillRow({ index, findings, onRemove }: CustomSkillRowProps) {
  const { control } = useFormContext<SkillPresetFormValues>()
  const skillName = useWatch({ control, name: `customSkills.${index}.skillName` }) ?? ''
  const descriptionFindings = findingsFor(findings, { field: 'skillDescription', skillName })
  const contentFindings = findingsFor(findings, { field: 'skillContent', skillName })

  return (
    <fieldset
      className="flex flex-col gap-3 rounded-md border border-neutral p-3"
      aria-label={skillName ? `Skill ${skillName}` : `New skill ${index + 1}`}
    >
      <div className="flex items-start gap-2">
        <Controller
          control={control}
          name={`customSkills.${index}.skillName`}
          render={({ field, fieldState }) => (
            <InputText
              className="flex-1"
              name={field.name}
              label="Skill name"
              value={field.value}
              onChange={(event) => field.onChange(event.target.value.toLowerCase())}
              hint="Lowercase letters, digits and hyphens. Can’t start with qovery."
              error={fieldState.error?.message}
            />
          )}
        />
        <Button
          type="button"
          size="lg"
          variant="outline"
          color="neutral"
          iconOnly
          aria-label={`Remove ${skillName || 'this skill'}`}
          onClick={onRemove}
        >
          <Icon iconName="trash-can" iconStyle="regular" />
        </Button>
      </div>
      <Controller
        control={control}
        name={`customSkills.${index}.description`}
        render={({ field, fieldState }) => (
          <div id={findingFieldId({ field: 'skillDescription', skillName })}>
            <InputTextArea
              name={field.name}
              label="When should agents use it?"
              value={field.value}
              onChange={field.onChange}
              hint="Agents only see this description until a task needs the skill. Say what it does and when to use it."
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
      <Controller
        control={control}
        name={`customSkills.${index}.content`}
        render={({ field, fieldState }) => (
          <MarkdownField
            id={findingFieldId({ field: 'skillContent', skillName })}
            label="Content"
            value={field.value}
            onChange={field.onChange}
            maxLength={SKILL_PRESET_LIMITS.skillContentMaxLength}
            error={fieldState.error?.message}
            findings={contentFindings}
          />
        )}
      />
    </fieldset>
  )
}

/** "5 of 50 skill changes used", recomputed only when skills are added, removed or switched. */
function SkillChangeCount() {
  const { control } = useFormContext<SkillPresetFormValues>()
  const [base, qoverySkills, customSkills] = useWatch({ control, name: ['base', 'qoverySkills', 'customSkills'] })
  const count = effectiveQoverySkills({ base, qoverySkills }).length + customSkills.length
  return (
    <p className="text-xs text-neutral-subtle">
      {count} of {SKILL_PRESET_LIMITS.maxSkills} skill changes used.
    </p>
  )
}

export interface CustomSkillsSectionProps {
  findings: SkillPresetFinding[]
  librarySkills: LibrarySkill[]
}

export function CustomSkillsSection({ findings, librarySkills }: CustomSkillsSectionProps) {
  const { control, setValue, getValues } = useFormContext<SkillPresetFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: 'customSkills', keyName: 'fieldKey' })
  const { errors } = useFormState({ control, name: 'customSkills' })
  const { openModal, closeModal } = useModal()
  const limitError = errors.customSkills?.root?.message

  const openLibrary = () =>
    openModal({
      content: (
        <SkillLibraryModal
          skills={librarySkills}
          base={getValues('base')}
          presentSkillNames={[
            ...getValues('customSkills').map(({ skillName }) => skillName),
            ...getValues('qoverySkills')
              .filter(({ choice }) => choice !== 'DISABLE')
              .map(({ skillName }) => skillName),
          ]}
          onClose={closeModal}
          onAdd={(picked) => {
            const qoverySkills = getValues('qoverySkills')
            picked.forEach((skill) => {
              if (skill.group === 'qovery') {
                const index = qoverySkills.findIndex(({ skillName }) => skillName === skill.skillName)
                if (index >= 0) setValue(`qoverySkills.${index}.choice`, 'AS_IS', { shouldDirty: true })
                return
              }
              append({ skillName: skill.skillName, description: skill.description, content: skill.content })
            })
            closeModal()
          }}
        />
      ),
      options: { width: 640 },
    })

  return (
    <div className="flex flex-col gap-3">
      {fields.length === 0 && (
        <p className="rounded-md border border-dashed border-neutral p-4 text-sm text-neutral-subtle">
          No skills of your own yet. Add one to teach agents a process Qovery can’t know, like your release checklist.
        </p>
      )}
      {fields.map((field, index) => (
        <CustomSkillRow key={field.fieldKey} index={index} findings={findings} onRemove={() => remove(index)} />
      ))}
      {limitError && <p className="text-xs text-negative">{limitError}</p>}
      <div className="flex gap-2">
        <Button
          type="button"
          size="md"
          variant="outline"
          color="neutral"
          onClick={() => append({ skillName: '', description: '', content: '' })}
        >
          <Icon iconName="plus" iconStyle="regular" />
          New skill
        </Button>
        <Button type="button" size="md" variant="outline" color="neutral" onClick={openLibrary}>
          <Icon iconName="books" iconStyle="regular" />
          Add from library
        </Button>
      </div>
      <SkillChangeCount />
    </div>
  )
}
