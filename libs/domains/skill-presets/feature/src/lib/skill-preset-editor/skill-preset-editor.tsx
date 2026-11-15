import { Link, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { type ReactNode, useMemo, useState } from 'react'
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form'
import {
  SKILL_PRESET_LIMITS,
  type SkillPresetAssignees,
  type SkillPresetFinding,
  type SkillPresetResponse,
  getSkillPresetErrorDetail,
  getSkillPresetErrorStatus,
  getSkillPresetFindings,
} from '@qovery/domains/skill-presets/data-access'
import { Badge, Button, Callout, Heading, Icon, InputText, LoaderSpinner, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useCreateSkillPreset } from '../hooks/use-create-skill-preset/use-create-skill-preset'
import { useEditSkillPreset } from '../hooks/use-edit-skill-preset/use-edit-skill-preset'
import { useSkillPresetAssignees } from '../hooks/use-skill-preset-assignees/use-skill-preset-assignees'
import { useSkillPreset } from '../hooks/use-skill-preset/use-skill-preset'
import { useSkillPresets } from '../hooks/use-skill-presets/use-skill-presets'
import { MarkdownField } from '../markdown-field/markdown-field'
import { MockScenarioBanner } from '../mock-scenario-banner/mock-scenario-banner'
import { SecurityFindingsSummary } from '../security-findings-summary/security-findings-summary'
import {
  PREVIEW_ANYONE,
  PreviewAsMemberSelect,
  describeResolution,
  resolvePreviewTarget,
} from '../token-budget/preview-as-member'
import { TokenBudgetView } from '../token-budget/token-budget-view'
import { QOVERY_SKILLS } from '../utils/qovery-skills'
import { ORG_TEMPLATE_PREFIX, RESOLUTION_SOURCE_LABELS, isOrganizationTemplate } from '../utils/resolve-preset'
import {
  type FindingTarget,
  findingFieldId,
  findingTarget,
  findingTargetKey,
  findingsFor,
} from '../utils/skill-preset-findings'
import {
  type SkillPresetFormValues,
  effectiveQoverySkills,
  toSkillPresetFormValues,
  toSkillPresetRequest,
} from '../utils/skill-preset-form'
import { SKILL_PRESET_TEMPLATES, findTemplate } from '../utils/skill-preset-templates'
import { validateSkillPresetForm } from '../utils/skill-preset-validation'
import { computeTokenBudget } from '../utils/token-budget'
import { AssignmentSection } from './assignment-section'
import { BaseChooser } from './base-chooser'
import { CustomSkillsSection } from './custom-skills-section'
import { QoverySkillsSection } from './qovery-skills-section'
import { type LibrarySkill } from './skill-library-modal'

const NEW_PRESET_ID = 'new-preset'

interface EditorSearch {
  template?: string
  from?: string
  asTemplate?: boolean | string
}

function EditorSection({
  title,
  description,
  children,
  id,
}: {
  title: string
  description?: ReactNode
  children: ReactNode
  id: string
}) {
  return (
    <Section aria-labelledby={id} className="flex flex-col gap-4 border-b border-neutral pb-8 last:border-b-0">
      <div className="flex flex-col gap-1">
        <Heading level={2} id={id}>
          {title}
        </Heading>
        {description && <p className="text-sm text-neutral-subtle">{description}</p>}
      </div>
      {children}
    </Section>
  )
}

/** The text of the field a finding points at, to tell whether the admin changed it since the check. */
function fieldValue(values: SkillPresetFormValues, target: FindingTarget) {
  if (target.field === 'description') return values.description
  if (target.field === 'teamContext') return values.teamContext
  const skill =
    values.qoverySkills.find(({ skillName }) => skillName === target.skillName) ??
    values.customSkills.find(({ skillName }) => skillName === target.skillName)
  if (!skill) return undefined
  return target.field === 'skillDescription' ? skill.description : skill.content
}

export interface SkillPresetEditorFormProps {
  organizationId: string
  initialValues: SkillPresetFormValues
  preset?: SkillPresetResponse
  presets: SkillPresetResponse[]
  assignees?: SkillPresetAssignees
  origin?: string
  asTemplate?: boolean
}

export function SkillPresetEditorForm({
  organizationId,
  initialValues,
  preset,
  presets,
  assignees,
  origin,
  asTemplate = false,
}: SkillPresetEditorFormProps) {
  const navigate = useNavigate()
  const methods = useForm<SkillPresetFormValues>({ defaultValues: initialValues })
  const values = useWatch({ control: methods.control }) as SkillPresetFormValues
  const { mutateAsync: createSkillPreset, isLoading: isCreating } = useCreateSkillPreset()
  const { mutateAsync: editSkillPreset, isLoading: isEditing } = useEditSkillPreset()
  const [attempted, setAttempted] = useState(false)
  const [rejection, setRejection] = useState<{
    findings: SkillPresetFinding[]
    snapshot: Record<string, string | undefined>
  } | null>(null)
  const [conflictDetail, setConflictDetail] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [previewTarget, setPreviewTarget] = useState(PREVIEW_ANYONE)

  const draftId = preset?.id ?? NEW_PRESET_ID
  const otherPresets = useMemo(() => presets.filter(({ id }) => id !== draftId), [presets, draftId])
  const errors = attempted ? validateSkillPresetForm(values) : {}

  // A finding stays visible until the admin edits the field it points at.
  const findings = useMemo(
    () =>
      (rejection?.findings ?? []).filter((finding) => {
        const target = findingTarget(finding.location)
        return !target || fieldValue(values, target) === rejection?.snapshot[findingTargetKey(target)]
      }),
    [rejection, values]
  )

  const request = toSkillPresetRequest(values)
  const draftForResolution = { ...request, id: draftId }
  const previewed =
    previewTarget === PREVIEW_ANYONE
      ? null
      : resolvePreviewTarget(previewTarget, [draftForResolution, ...otherPresets], assignees)
  const previewedPreset =
    previewed === null ? request : previewed.preset?.id === draftId ? request : previewed.preset ?? null
  const budget = computeTokenBudget(previewedPreset)

  const librarySkills: LibrarySkill[] = useMemo(
    () => [
      ...QOVERY_SKILLS.map(({ name, description }) => ({
        id: `qovery:${name}`,
        group: 'qovery' as const,
        skillName: name,
        description,
        content: '',
        origin: 'Qovery',
      })),
      ...otherPresets.flatMap((item) =>
        item.skills
          .filter(({ mode }) => mode === 'ADD')
          .map((skill) => ({
            id: `preset:${item.id}:${skill.skill_name}`,
            group: 'organization' as const,
            skillName: skill.skill_name,
            description: skill.description ?? '',
            content: skill.content ?? '',
            origin: item.name,
          }))
      ),
      ...SKILL_PRESET_TEMPLATES.flatMap((template) =>
        template.preset.skills
          .filter(({ mode }) => mode === 'ADD')
          .map((skill) => ({
            id: `template:${template.id}:${skill.skill_name}`,
            group: 'template' as const,
            skillName: skill.skill_name,
            description: skill.description ?? '',
            content: skill.content ?? '',
            origin: `${template.title} template`,
          }))
      ),
    ],
    [otherPresets]
  )

  const hiddenQoveryChanges =
    values.base !== 'QOVERY_FULL' ? values.qoverySkills.filter(({ choice }) => choice !== 'AS_IS').length : 0

  const onSubmit = methods.handleSubmit(async (submitted) => {
    setAttempted(true)
    const validationErrors = validateSkillPresetForm(submitted)
    const firstError = Object.keys(validationErrors)[0]
    if (firstError) {
      document.querySelector(`[name="${firstError}"]`)?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
      return
    }
    setRejection(null)
    setConflictDetail(null)
    setServerError(null)
    const body = toSkillPresetRequest(
      asTemplate ? { ...submitted, organizationDefault: false, roleIds: [], userIds: [] } : submitted
    )
    try {
      if (preset) {
        const saved = await editSkillPreset({ organizationId, skillPresetId: preset.id, body })
        methods.reset(toSkillPresetFormValues(saved))
        setAttempted(false)
      } else {
        await createSkillPreset({ organizationId, body })
        navigate({ to: '/organization/$organizationId/settings/skill-presets', params: { organizationId } })
      }
    } catch (error) {
      const status = getSkillPresetErrorStatus(error)
      if (status === 422) {
        const rejectedFindings = getSkillPresetFindings(error)
        const snapshot: Record<string, string | undefined> = {}
        rejectedFindings.forEach((finding) => {
          const target = findingTarget(finding.location)
          if (target) snapshot[findingTargetKey(target)] = fieldValue(submitted, target)
        })
        setRejection({ findings: rejectedFindings, snapshot })
        document.getElementById('skill-preset-editor-top')?.scrollIntoView?.({ behavior: 'smooth' })
      } else if (status === 409) {
        setConflictDetail(getSkillPresetErrorDetail(error) ?? 'Conflict')
      } else {
        setServerError(getSkillPresetErrorDetail(error) ?? 'The preset could not be saved. Try again.')
      }
    }
  })

  const skillChangeCount = effectiveQoverySkills(values).length + values.customSkills.length
  const descriptionFindings = findingsFor(findings, { field: 'description' })

  return (
    <FormProvider {...methods}>
      <Section>
        <form id="skill-preset-editor-top" onSubmit={onSubmit} noValidate className="flex flex-col gap-6 px-8 pt-6">
          <div className="flex flex-col gap-3">
            <Link
              to="/organization/$organizationId/settings/skill-presets"
              params={{ organizationId }}
              className="flex w-fit items-center gap-1.5 text-sm text-neutral-subtle hover:text-neutral"
            >
              <Icon iconName="arrow-left" iconStyle="regular" />
              Skill presets
            </Link>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Heading>{preset ? preset.name : asTemplate ? 'Save as template' : 'Create preset'}</Heading>
                {preset && <Badge variant="surface">Revision {preset.revision}</Badge>}
              </div>
              {preset && (
                <Link
                  to="/organization/$organizationId/settings/skill-presets/$skillPresetId/history"
                  params={{ organizationId, skillPresetId: preset.id }}
                  className="flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
                >
                  <Icon iconName="clock-rotate-left" iconStyle="regular" />
                  History
                </Link>
              )}
            </div>
            {origin && <p className="text-sm text-neutral-subtle">{origin} Everything below is editable.</p>}
          </div>

          <MockScenarioBanner />

          {findings.length > 0 && <SecurityFindingsSummary findings={findings} />}
          {serverError && (
            <Callout.Root color="red" role="alert">
              <Callout.Icon>
                <Icon iconName="circle-exclamation" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text>
                <Callout.TextHeading>Not saved</Callout.TextHeading>
                <Callout.TextDescription>{serverError}</Callout.TextDescription>
              </Callout.Text>
            </Callout.Root>
          )}

          <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="flex min-w-0 flex-col gap-8">
              <EditorSection id="section-general" title="General">
                <Controller
                  control={methods.control}
                  name="name"
                  render={({ field }) => (
                    <InputText
                      name={field.name}
                      label="Name"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors['name']}
                      hint={
                        asTemplate
                          ? `Starts with "${ORG_TEMPLATE_PREFIX.trim()}" so it shows in the template gallery.`
                          : undefined
                      }
                    />
                  )}
                />
                <Controller
                  control={methods.control}
                  name="description"
                  render={({ field }) => (
                    <div id={findingFieldId({ field: 'description' })}>
                      <InputText
                        name={field.name}
                        label="Description (optional)"
                        value={field.value}
                        onChange={field.onChange}
                        hint="Shown to admins in the list and to members in their agent."
                        error={
                          errors['description'] ??
                          (descriptionFindings.length > 0
                            ? descriptionFindings.map((finding) => `Line ${finding.line}: ${finding.reason}.`).join(' ')
                            : undefined)
                        }
                      />
                    </div>
                  )}
                />
              </EditorSection>

              <EditorSection
                id="section-base"
                title="Start from"
                description="The Qovery skills members' agents can load. Your team context and your own skills apply on top of any choice."
              >
                <Controller
                  control={methods.control}
                  name="base"
                  render={({ field }) => <BaseChooser value={field.value} onChange={field.onChange} />}
                />
                {hiddenQoveryChanges > 0 && (
                  <Callout.Root color="neutral">
                    <Callout.Icon>
                      <Icon iconName="circle-info" iconStyle="regular" />
                    </Callout.Icon>
                    <Callout.Text>
                      <Callout.TextDescription>
                        Your changes to {hiddenQoveryChanges} Qovery{' '}
                        {hiddenQoveryChanges === 1 ? 'skill stay' : 'skills stay'} in this draft but are not saved with
                        this base. Switch back to Full Qovery skills to keep them.
                      </Callout.TextDescription>
                    </Callout.Text>
                  </Callout.Root>
                )}
              </EditorSection>

              {values.base === 'QOVERY_FULL' && (
                <EditorSection
                  id="section-qovery-skills"
                  title="Qovery skills"
                  description="Use a skill as Qovery publishes it, add your team's instructions after it, replace it with your own text, or turn it off."
                >
                  <QoverySkillsSection errors={errors} findings={findings} />
                </EditorSection>
              )}

              <EditorSection
                id="section-custom-skills"
                title="Your skills"
                description="Skills your organization writes. Agents load one when its description matches the task."
              >
                <CustomSkillsSection errors={errors} findings={findings} librarySkills={librarySkills} />
                <p className="text-xs text-neutral-subtle">
                  {skillChangeCount} of {SKILL_PRESET_LIMITS.maxSkills} skill changes used.
                </p>
              </EditorSection>

              <EditorSection
                id="section-team-context"
                title="Team context"
                description="How your team uses Qovery: clusters, environments, naming, what never to do. Sent with every skill an agent loads from this preset."
              >
                <Controller
                  control={methods.control}
                  name="teamContext"
                  render={({ field }) => (
                    <MarkdownField
                      id={findingFieldId({ field: 'teamContext' })}
                      label="Team context"
                      value={field.value}
                      onChange={field.onChange}
                      maxLength={SKILL_PRESET_LIMITS.teamContextMaxLength}
                      hint="Keep it short: it is added to every skill load."
                      error={errors['teamContext']}
                      findings={findingsFor(findings, { field: 'teamContext' })}
                      minLines={8}
                    />
                  )}
                />
              </EditorSection>

              <EditorSection id="section-assignment" title="Who receives it">
                {asTemplate ? (
                  <p className="text-sm text-neutral-subtle">
                    Templates are not assigned. Start a new preset from it to give it to roles or members.
                  </p>
                ) : (
                  <AssignmentSection
                    draftId={draftId}
                    draftName={values.name || 'This preset'}
                    otherPresets={otherPresets.filter((item) => !isOrganizationTemplate(item))}
                    assignees={assignees}
                    conflictDetail={conflictDetail}
                  />
                )}
              </EditorSection>
            </div>

            <aside
              aria-labelledby="agent-context-title"
              className="flex flex-col gap-4 rounded-md border border-neutral bg-surface-neutral p-4 xl:sticky xl:top-4"
            >
              <div className="flex flex-col gap-1">
                <Heading level={2} id="agent-context-title">
                  What members' agents receive
                </Heading>
                <p className="text-xs text-neutral-subtle">
                  Agents read a short skill list first, then load only the skills a task needs. Members can read every
                  piece in full, with its SHA-256.
                </p>
              </div>
              <PreviewAsMemberSelect
                value={previewTarget}
                onChange={setPreviewTarget}
                assignees={assignees}
                anyoneLabel="Anyone who receives this preset"
              />
              {previewed && (
                <p className="text-xs text-neutral" aria-live="polite">
                  {previewed.preset?.id === draftId
                    ? `${previewed.targetLabel} gets this preset (${RESOLUTION_SOURCE_LABELS[previewed.source].toLowerCase()}).`
                    : previewed.preset
                      ? `${previewed.targetLabel} gets ${describeResolution(previewed)}, not this one. Showing that preset.`
                      : `${previewed.targetLabel} gets no preset: Qovery skills as published. Showing today's cost.`}
                </p>
              )}
              <TokenBudgetView budget={budget} compact />
            </aside>
          </div>

          <div className="sticky bottom-0 z-10 -mx-8 flex items-center justify-end gap-3 border-t border-neutral bg-background px-8 py-3">
            {attempted && Object.keys(errors).length > 0 && (
              <span className="mr-auto flex items-center gap-1.5 text-sm text-negative">
                <Icon iconName="circle-exclamation" iconStyle="regular" />
                {Object.keys(errors).length === 1 ? '1 field needs' : `${Object.keys(errors).length} fields need`} a
                change
              </span>
            )}
            <Button
              type="button"
              size="lg"
              variant="plain"
              color="neutral"
              onClick={() =>
                navigate({ to: '/organization/$organizationId/settings/skill-presets', params: { organizationId } })
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              loading={isCreating || isEditing}
              disabled={preset && !methods.formState.isDirty}
            >
              {preset ? 'Save changes' : asTemplate ? 'Save template' : 'Create preset'}
            </Button>
          </div>
        </form>
      </Section>
    </FormProvider>
  )
}

/** Route component: create (blank, from a template, or a copy) and edit. */
export function SkillPresetEditor() {
  const { organizationId = '', skillPresetId } = useParams({ strict: false })
  const search = useSearch({ strict: false }) as EditorSearch
  const asTemplate = search.asTemplate === true || search.asTemplate === 'true'
  const { data: preset, isLoading: isPresetLoading, error: presetError } = useSkillPreset({ skillPresetId })
  const { data: presets = [], isLoading: isListLoading } = useSkillPresets({ organizationId })
  const { data: assignees } = useSkillPresetAssignees({ organizationId })

  useDocumentTitle(`${skillPresetId ? 'Edit' : 'Create'} skill preset - Organization settings`)

  const source = search.from ? presets.find(({ id }) => id === search.from) : undefined
  const template = findTemplate(search.template)
  const waiting = (skillPresetId && isPresetLoading) || (search.from && isListLoading)

  if (waiting) {
    return (
      <Section className="flex items-center justify-center p-16">
        <LoaderSpinner />
      </Section>
    )
  }

  if (skillPresetId && (presetError || !preset)) {
    return (
      <Section className="p-8">
        <Callout.Root color="red" role="alert">
          <Callout.Icon>
            <Icon iconName="circle-exclamation" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>
            <Callout.TextHeading>This preset could not be loaded</Callout.TextHeading>
            <Callout.TextDescription>
              {getSkillPresetErrorDetail(presetError) ?? 'It may have been deleted.'}
            </Callout.TextDescription>
          </Callout.Text>
        </Callout.Root>
      </Section>
    )
  }

  let initialValues: SkillPresetFormValues
  let origin: string | undefined
  if (preset) {
    initialValues = toSkillPresetFormValues(preset)
  } else if (source) {
    const copy = toSkillPresetFormValues({
      ...source,
      assigned_to: { organization_default: false, role_ids: [], user_ids: [] },
    })
    const baseName = source.name.replace(ORG_TEMPLATE_PREFIX, '')
    initialValues = { ...copy, name: asTemplate ? `${ORG_TEMPLATE_PREFIX}${baseName}` : `${baseName} (copy)` }
    origin = isOrganizationTemplate(source)
      ? `Started from your template ${baseName}.`
      : `Copied from ${source.name}, without its assignments.`
  } else if (template) {
    initialValues = toSkillPresetFormValues({
      ...template.preset,
      assigned_to: { organization_default: false, role_ids: [], user_ids: [] },
    })
    origin = `Started from the ${template.title} template. ${template.assignmentHint}.`
  } else {
    initialValues = toSkillPresetFormValues()
  }

  return (
    <SkillPresetEditorForm
      key={preset ? `${preset.id}-${preset.revision}` : `${search.template ?? ''}-${search.from ?? ''}`}
      organizationId={organizationId}
      initialValues={initialValues}
      preset={preset}
      presets={presets}
      assignees={assignees}
      origin={origin}
      asTemplate={asTemplate}
    />
  )
}
