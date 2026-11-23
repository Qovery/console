import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  useFormState,
  useWatch,
} from 'react-hook-form'
import { SKILL_PRESET_LIMITS, type SkillPresetFinding } from '@qovery/domains/skill-presets/data-access'
import {
  Button,
  DropdownMenu,
  Heading,
  Icon,
  InputText,
  InputTextArea,
  ModalCrud,
  Tooltip,
  toast,
  useModal,
} from '@qovery/shared/ui'
import { MarkdownField } from '../markdown-field/markdown-field'
import { findingFieldId, findingsAsText, findingsFor } from '../utils/skill-preset-findings'
import { type SkillPresetFormValues, effectiveQoverySkills } from '../utils/skill-preset-form'
import { toFieldErrors, validateSkillPresetForm } from '../utils/skill-preset-validation'
import { type LibrarySkill, SkillLibraryModal } from './skill-library-modal'

interface CustomSkillRowProps {
  index: number
  findings: SkillPresetFinding[]
}

/** One skill of the organization. It watches only its own name, so typing elsewhere does not re-render it. */
function CustomSkillRow({ index, findings, originalSkillName }: CustomSkillRowProps & { originalSkillName: string }) {
  const { control } = useFormContext<SkillPresetFormValues>()
  const skillName = useWatch({ control, name: `customSkills.${index}.skillName` }) ?? ''
  const descriptionFindings = findingsFor(findings, { field: 'skillDescription', skillName: originalSkillName })
  const contentFindings = findingsFor(findings, { field: 'skillContent', skillName: originalSkillName })

  return (
    <fieldset className="flex flex-col gap-3" aria-label={skillName ? `Skill ${skillName}` : `New skill ${index + 1}`}>
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
              error={fieldState.error?.message ?? findingsAsText(descriptionFindings)}
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

type CustomSkill = SkillPresetFormValues['customSkills'][number]

function CustomSkillModal({
  values,
  index,
  creating,
  findings,
  onApply,
  onClose,
}: {
  values: SkillPresetFormValues
  index: number
  creating: boolean
  findings: SkillPresetFinding[]
  onApply: (skill: CustomSkill) => void
  onClose: () => void
}) {
  const methods = useForm<SkillPresetFormValues>({
    defaultValues: values,
    resolver: (draft) => {
      const prefix = `customSkills.${index}.`
      const errors = Object.fromEntries(
        Object.entries(validateSkillPresetForm(draft)).filter(([path]) => path.startsWith(prefix))
      )
      const name = draft.customSkills[index].skillName.trim()
      if (draft.customSkills.some((skill, position) => position !== index && skill.skillName.trim() === name)) {
        errors[`${prefix}skillName`] = 'Another skill in this preset has this name.'
      }
      return Object.keys(errors).length ? { values: {}, errors: toFieldErrors(errors) } : { values: draft, errors: {} }
    },
  })
  return (
    <FormProvider {...methods}>
      <ModalCrud
        title={creating ? 'Create skill' : 'Edit skill'}
        description="Changes are applied to the preset draft. Save the preset to publish them."
        submitLabel={creating ? 'Add skill' : 'Apply changes'}
        onClose={onClose}
        onSubmit={methods.handleSubmit((draft) => onApply(draft.customSkills[index]))}
      >
        <CustomSkillRow index={index} findings={findings} originalSkillName={values.customSkills[index].skillName} />
      </ModalCrud>
    </FormProvider>
  )
}

export interface CustomSkillsSectionProps {
  findings: SkillPresetFinding[]
  librarySkills: LibrarySkill[]
  onRename: (oldName: string, newName: string) => void
}

export function CustomSkillsSection({ findings, librarySkills, onRename }: CustomSkillsSectionProps) {
  const { control, getValues } = useFormContext<SkillPresetFormValues>()
  const { fields, append, remove, update } = useFieldArray({ control, name: 'customSkills', keyName: 'fieldKey' })
  const { errors } = useFormState({ control, name: 'customSkills' })
  const { openModal, closeModal } = useModal()
  const limitError = errors.customSkills?.root?.message

  const exceedsLimit = (values: SkillPresetFormValues) => {
    if (effectiveQoverySkills(values).length + values.customSkills.length <= SKILL_PRESET_LIMITS.maxSkills) return false
    toast(
      'warning',
      'Skill limit reached',
      'Remove a skill before adding another. A preset supports up to 50 skill changes.'
    )
    return true
  }

  const editSkill = (index?: number) => {
    const values = getValues()
    const creating = index === undefined
    const editIndex = index ?? values.customSkills.length
    const customSkills = [...values.customSkills]
    if (creating) customSkills.push({ skillName: '', description: '', content: '' })
    if (creating && exceedsLimit({ ...values, customSkills })) return
    openModal({
      content: (
        <CustomSkillModal
          values={{ ...values, customSkills }}
          index={editIndex}
          creating={creating}
          findings={findings}
          onClose={closeModal}
          onApply={(skill) => {
            if (creating && exceedsLimit({ ...getValues(), customSkills: [...getValues('customSkills'), skill] }))
              return
            if (creating) append(skill)
            else {
              const oldName = customSkills[editIndex].skillName
              if (oldName !== skill.skillName) onRename(oldName, skill.skillName)
              update(editIndex, skill)
            }
            closeModal()
          }}
        />
      ),
      options: { width: 720, fakeModal: creating },
    })
  }

  const openLibrary = () =>
    openModal({
      content: (
        <SkillLibraryModal
          skills={librarySkills}
          presentSkillNames={getValues('customSkills').map(({ skillName }) => skillName)}
          onClose={closeModal}
          onAdd={(picked) => {
            const values = getValues()
            if (exceedsLimit({ ...values, customSkills: [...values.customSkills, ...picked] })) return
            picked.forEach((skill) => {
              append({ skillName: skill.skillName, description: skill.description, content: skill.content })
            })
            closeModal()
          }}
        />
      ),
      options: { width: 640, fakeModal: true },
    })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Heading level={3} id="section-custom-skills">
            Custom skills
          </Heading>
          <p className="text-sm text-neutral-subtle">
            Skills your organization writes. Agents load one when its description matches the task.
          </p>
        </div>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button type="button" size="md" variant="outline" color="neutral">
              Add skill
              <Icon iconName="chevron-down" iconStyle="regular" />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            <DropdownMenu.Item icon={<Icon iconName="plus" iconStyle="regular" />} onSelect={() => editSkill()}>
              New skill
            </DropdownMenu.Item>
            <DropdownMenu.Item icon={<Icon iconName="books" iconStyle="regular" />} onSelect={openLibrary}>
              Add from library
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
      {fields.length === 0 && (
        <p className="rounded-md border border-dashed border-neutral p-4 text-sm text-neutral-subtle">
          No skills of your own yet. Add one to teach agents a process Qovery can’t know, like your release checklist.
        </p>
      )}
      {fields.length > 0 && (
        <ul className="rounded border border-neutral bg-surface-neutral-subtle" aria-label="Custom skills">
          {fields.map((field, index) => {
            const issues = findings.filter(
              (finding) =>
                findingsFor([finding], { field: 'skillDescription', skillName: field.skillName }).length ||
                findingsFor([finding], { field: 'skillContent', skillName: field.skillName }).length
            )
            const hasError = Boolean(errors.customSkills?.[index])
            return (
              <li
                key={field.fieldKey}
                className="flex items-center justify-between gap-3 border-b border-neutral px-4 py-3 last:border-0"
              >
                <div className="min-w-0" id={findingFieldId({ field: 'skillContent', skillName: field.skillName })}>
                  <div
                    className="flex items-center gap-2"
                    id={findingFieldId({ field: 'skillDescription', skillName: field.skillName })}
                  >
                    <span className="break-all text-sm font-medium">{field.skillName || 'Untitled skill'}</span>
                    {field.description && (
                      <Tooltip content={field.description}>
                        <span tabIndex={0} aria-label={`Description of ${field.skillName}`}>
                          <Icon iconName="circle-info" iconStyle="regular" className="text-neutral-subtle" />
                        </span>
                      </Tooltip>
                    )}
                  </div>
                  {(hasError || issues.length > 0) && (
                    <p className="text-xs text-negative">
                      Review required: {hasError ? 'check the skill fields.' : findingsAsText(issues)}
                    </p>
                  )}
                </div>
                <div className="shrink-0">
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      size="md"
                      variant="outline"
                      color="neutral"
                      iconOnly
                      data-edit-skill
                      aria-label={`Edit ${field.skillName}`}
                      onClick={() => editSkill(index)}
                    >
                      <Icon iconName="pen" iconStyle="regular" />
                    </Button>
                    <Button
                      type="button"
                      size="md"
                      variant="outline"
                      color="neutral"
                      iconOnly
                      aria-label={`Remove ${field.skillName}`}
                      onClick={() => remove(index)}
                    >
                      <Icon iconName="trash-can" iconStyle="regular" />
                    </Button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
      {limitError && <p className="text-xs text-negative">{limitError}</p>}
    </div>
  )
}
