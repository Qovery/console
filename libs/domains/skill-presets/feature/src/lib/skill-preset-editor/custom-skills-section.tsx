import { Controller, useFieldArray, useFormContext } from 'react-hook-form'
import { SKILL_PRESET_LIMITS, type SkillPresetFinding } from '@qovery/domains/skill-presets/data-access'
import { Button, Icon, InputText, InputTextArea, useModal } from '@qovery/shared/ui'
import { MarkdownField } from '../markdown-field/markdown-field'
import { findingFieldId, findingsFor } from '../utils/skill-preset-findings'
import { type SkillPresetFormValues, newCustomSkillKey } from '../utils/skill-preset-form'
import { type LibrarySkill, SkillLibraryModal } from './skill-library-modal'

export interface CustomSkillsSectionProps {
  errors: Record<string, string>
  findings: SkillPresetFinding[]
  librarySkills: LibrarySkill[]
}

export function CustomSkillsSection({ errors, findings, librarySkills }: CustomSkillsSectionProps) {
  const { control, watch, setValue, getValues } = useFormContext<SkillPresetFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: 'customSkills', keyName: 'fieldKey' })
  const { openModal, closeModal } = useModal()
  const customSkills = watch('customSkills')

  const addBlank = () => append({ key: newCustomSkillKey(), skillName: '', description: '', content: '' })

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
              append({
                key: newCustomSkillKey(),
                skillName: skill.skillName,
                description: skill.description,
                content: skill.content,
              })
            })
            closeModal()
          }}
        />
      ),
      options: { width: 640, fakeModal: true },
    })

  return (
    <div className="flex flex-col gap-3">
      {fields.length === 0 && (
        <p className="rounded-md border border-dashed border-neutral p-4 text-sm text-neutral-subtle">
          No skills of your own yet. Add one to teach agents a process Qovery can't know, like your release checklist.
        </p>
      )}
      {fields.map((field, index) => {
        const skillName = customSkills[index]?.skillName ?? ''
        const descriptionFindings = findingsFor(findings, { field: 'skillDescription', skillName })
        const contentFindings = findingsFor(findings, { field: 'skillContent', skillName })
        return (
          <fieldset
            key={field.fieldKey}
            className="flex flex-col gap-3 rounded-md border border-neutral p-3"
            aria-label={skillName ? `Skill ${skillName}` : `New skill ${index + 1}`}
          >
            <div className="flex items-start gap-2">
              <Controller
                control={control}
                name={`customSkills.${index}.skillName`}
                render={({ field: nameField }) => (
                  <InputText
                    className="flex-1"
                    name={nameField.name}
                    label="Skill name"
                    value={nameField.value}
                    onChange={(event) => nameField.onChange(event.target.value.toLowerCase())}
                    hint="Lowercase letters, digits and hyphens. Can't start with qovery."
                    error={errors[`customSkills.${index}.skillName`]}
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
                onClick={() => remove(index)}
              >
                <Icon iconName="trash-can" iconStyle="regular" />
              </Button>
            </div>
            <Controller
              control={control}
              name={`customSkills.${index}.description`}
              render={({ field: descriptionField }) => (
                <div id={findingFieldId({ field: 'skillDescription', skillName })}>
                  <InputTextArea
                    name={descriptionField.name}
                    label="When should agents use it?"
                    value={descriptionField.value}
                    onChange={descriptionField.onChange}
                    hint="Agents only see this description until a task needs the skill. Say what it does and when to use it."
                    error={
                      errors[`customSkills.${index}.description`] ??
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
              render={({ field: contentField }) => (
                <MarkdownField
                  id={findingFieldId({ field: 'skillContent', skillName })}
                  label="Content"
                  value={contentField.value}
                  onChange={contentField.onChange}
                  maxLength={SKILL_PRESET_LIMITS.skillContentMaxLength}
                  error={errors[`customSkills.${index}.content`]}
                  findings={contentFindings}
                />
              )}
            />
          </fieldset>
        )
      })}
      {errors['customSkills'] && <p className="text-xs text-negative">{errors['customSkills']}</p>}
      <div className="flex gap-2">
        <Button type="button" size="md" variant="outline" color="neutral" onClick={addBlank}>
          <Icon iconName="plus" iconStyle="regular" />
          New skill
        </Button>
        <Button type="button" size="md" variant="outline" color="neutral" onClick={openLibrary}>
          <Icon iconName="books" iconStyle="regular" />
          Add from library
        </Button>
      </div>
    </div>
  )
}
