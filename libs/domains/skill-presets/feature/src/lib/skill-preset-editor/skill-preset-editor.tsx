import { useQueryClient } from '@tanstack/react-query'
import { Link, useBlocker, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { type SkillPresetRejectionFinding, type SkillPresetResponse } from 'qovery-typescript-axios'
import { type ReactNode, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { Controller, type FieldErrors, FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form'
import {
  SKILL_PRESET_LIMITS,
  getSkillPresetErrorDetail,
  getSkillPresetErrorStatus,
  getSkillPresetFindings,
  isSkillPresetAiFeaturesOff,
  isSkillPresetConcurrentModification,
  isSkillPresetReviewUnavailable,
} from '@qovery/domains/skill-presets/util'
import {
  Badge,
  Button,
  Link as ButtonLink,
  Callout,
  Heading,
  Icon,
  InputText,
  LoaderSpinner,
  Section,
  Tooltip,
} from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { scrollToElement } from '@qovery/shared/util-js'
import { queries } from '@qovery/state/util-queries'
import { AI_FEATURES_OFF_TOOLTIP, AiFeaturesNotice } from '../ai-features-notice/ai-features-notice'
import { useAiFeaturesEnabled } from '../hooks/use-ai-features-enabled/use-ai-features-enabled'
import { useCreateSkillPreset } from '../hooks/use-create-skill-preset/use-create-skill-preset'
import { useEditSkillPreset } from '../hooks/use-edit-skill-preset/use-edit-skill-preset'
import {
  type SkillPresetAssignees,
  useSkillPresetAssignees,
} from '../hooks/use-skill-preset-assignees/use-skill-preset-assignees'
import { useSkillPreset } from '../hooks/use-skill-preset/use-skill-preset'
import { useSkillPresets } from '../hooks/use-skill-presets/use-skill-presets'
import { LoadError } from '../load-error/load-error'
import { MarkdownField } from '../markdown-field/markdown-field'
import { SecurityFindingsSummary } from '../security-findings-summary/security-findings-summary'
import { SkillPresetsAdminOnly } from '../skill-presets-layout/skill-presets-layout'
import { PresetPreviewPanel } from '../skill-presets-preview/preset-preview-panel'
import { isTemplate } from '../utils/resolve-preset'
import {
  type FindingTarget,
  findingFieldId,
  findingTarget,
  findingTargetKey,
  findingsAsText,
  findingsFor,
} from '../utils/skill-preset-findings'
import {
  type SkillPresetFormValues,
  effectiveQoverySkills,
  keepEditsSinceSubmit,
  snapshotSkillPresetFormValues,
  toSkillPresetFormValues,
  toSkillPresetRequest,
} from '../utils/skill-preset-form'
import { SKILL_PRESET_TEMPLATES, findTemplate } from '../utils/skill-preset-templates'
import { flattenFieldErrors, skillPresetResolver } from '../utils/skill-preset-validation'
import { AssignmentSection } from './assignment-section'
import { BaseChooser } from './base-chooser'
import { CustomSkillsSection } from './custom-skills-section'
import { QoverySkillsSection } from './qovery-skills-section'
import { type LibrarySkill } from './skill-library-modal'

const NEW_PRESET_ID = 'new-preset'
const LEAVE_UNSAVED_CHANGES_MESSAGE = 'You have unsaved changes on this preset. Leave the page and discard them?'

interface EditorSearch {
  template?: string
  from?: string
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
    <Section aria-labelledby={id} className="flex flex-col gap-4">
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
  const customSkill = values.customSkills.find(({ skillName }) => skillName === target.skillName)
  if (customSkill) return target.field === 'skillDescription' ? customSkill.description : customSkill.content
  const qoverySkill = effectiveQoverySkills(values).find(({ skillName }) => skillName === target.skillName)
  if (!qoverySkill || qoverySkill.choice === 'DISABLE') return undefined
  if (target.field === 'skillContent') return qoverySkill.content
  return qoverySkill.choice === 'REPLACE' ? qoverySkill.description : undefined
}

/** Tells the admin their Qovery skill changes are kept in the draft but not saved on the lean and empty bases. */
function HiddenQoveryChangesNotice() {
  const { control } = useFormContext<SkillPresetFormValues>()
  const [base, qoverySkills] = useWatch({ control, name: ['base', 'qoverySkills'] })
  const count = base !== 'FULL' ? qoverySkills.filter(({ choice }) => choice !== 'AS_IS').length : 0
  if (count === 0) return null
  return (
    <Callout.Root color="neutral">
      <Callout.Icon>
        <Icon iconName="circle-info" iconStyle="regular" />
      </Callout.Icon>
      <Callout.Text>
        <Callout.TextDescription>
          Your changes to {count} Qovery {count === 1 ? 'skill stay' : 'skills stay'} in this draft but are not saved
          with this base. Switch back to Full Qovery skills to keep them.
        </Callout.TextDescription>
      </Callout.Text>
    </Callout.Root>
  )
}

function DraftPreview() {
  const { control } = useFormContext<SkillPresetFormValues>()
  const values = useWatch({ control }) as SkillPresetFormValues
  const deferredValues = useDeferredValue(values)
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button type="button" size="md" variant="outline" color="neutral" onClick={() => setOpen(true)}>
        <Icon iconName="eye" iconStyle="regular" />
        Preview
      </Button>
      <PresetPreviewPanel preset={toSkillPresetRequest(deferredValues)} open={open} onOpenChange={setOpen} draft />
    </>
  )
}

export interface SkillPresetEditorFormProps {
  organizationId: string
  initialValues: SkillPresetFormValues
  preset?: SkillPresetResponse
  presets: SkillPresetResponse[]
  assignees?: SkillPresetAssignees
  assigneesError?: unknown
  isAssigneesLoading?: boolean
  onRetryAssignees?: () => void
  origin?: string
  asTemplate?: boolean
}

interface Rejection {
  findings: SkillPresetRejectionFinding[]
  /** The text of each field as it was rejected, to drop a finding once the admin edits its field. */
  snapshot: Record<string, string | undefined>
}

export function SkillPresetEditorForm({
  organizationId,
  initialValues,
  preset,
  presets,
  assignees,
  assigneesError,
  isAssigneesLoading,
  onRetryAssignees,
  origin,
  asTemplate = false,
}: SkillPresetEditorFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const methods = useForm<SkillPresetFormValues>({
    defaultValues: initialValues,
    resolver: skillPresetResolver,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    shouldFocusError: false,
  })
  const base = useWatch({ control: methods.control, name: 'base' })
  const { errors, isDirty, isSubmitted } = methods.formState
  const { mutateAsync: createSkillPreset } = useCreateSkillPreset()
  const { mutateAsync: editSkillPreset, isLoading: isEditing } = useEditSkillPreset()
  const [rejection, setRejection] = useState<Rejection | null>(null)
  const [conflictDetail, setConflictDetail] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  // 'review-unavailable': the model review could not run (503). 'ai-off': AI features are off.
  const [blockedBy, setBlockedBy] = useState<'review-unavailable' | 'ai-off' | null>(null)
  // A save is a security review (a few seconds), then the write. One at a time: a double click sends once.
  const [savePhase, setSavePhase] = useState<'checking' | 'saving' | null>(null)
  const saving = useRef(false)
  const aiFeaturesEnabled = useAiFeaturesEnabled({ organizationId }) && blockedBy !== 'ai-off'
  // The revision this draft started from. A newer one on the server means someone else saved meanwhile.
  const [baseRevision, setBaseRevision] = useState(preset?.revision)
  // q-core answered 409 because the preset changed between its read and its write.
  const [savedElsewhere, setSavedElsewhere] = useState(false)
  const leavingAfterSave = useRef(false)

  const draftId = preset?.id ?? NEW_PRESET_ID
  const otherPresets = useMemo(() => presets.filter(({ id }) => id !== draftId), [presets, draftId])
  // The total text limit belongs to no single field: it is shown on its own, next to Save.
  const { totalText: totalTextError, ...fieldErrors } = flattenFieldErrors(errors)
  const errorCount = Object.keys(fieldErrors).length
  const changedElsewhere =
    preset !== undefined &&
    (savedElsewhere ||
      (baseRevision !== undefined && preset.revision > baseRevision && !isEditing && savePhase === null))

  useBlocker({
    disabled: !isDirty,
    shouldBlockFn: () => !leavingAfterSave.current && !window.confirm(LEAVE_UNSAVED_CHANGES_MESSAGE),
    enableBeforeUnload: isDirty,
  })

  // A finding stays visible until the admin edits the field it points at. Subscribing to the form
  // store (an external system for React) avoids re-rendering the whole editor on every keystroke.
  useEffect(() => {
    if (!rejection) return
    const subscription = methods.watch((values) => {
      setRejection((current) => {
        if (!current) return current
        const remaining = current.findings.filter((finding) => {
          const target = findingTarget(finding.location)
          return (
            !target ||
            fieldValue(values as SkillPresetFormValues, target) === current.snapshot[findingTargetKey(target)]
          )
        })
        return remaining.length === current.findings.length ? current : { ...current, findings: remaining }
      })
    })
    return () => subscription.unsubscribe()
  }, [methods, rejection])

  const renameCustomSkillFindings = (oldName: string, newName: string) => {
    setRejection((current) => {
      if (!current) return current
      const snapshot = { ...current.snapshot }
      const findings = current.findings.map((finding) => {
        const target = findingTarget(finding.location)
        if (!target || !('skillName' in target) || target.skillName !== oldName) return finding
        const oldKey = findingTargetKey(target)
        const newKey = findingTargetKey({ ...target, skillName: newName })
        snapshot[newKey] = current.snapshot[oldKey]
        delete snapshot[oldKey]
        const field = target.field === 'skillDescription' ? 'description' : 'content'
        return { ...finding, location: `${field} of skill '${newName}'` }
      })
      return { findings, snapshot }
    })
  }

  const findings = rejection?.findings ?? []

  const librarySkills: LibrarySkill[] = useMemo(
    () => [
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

  const reloadFromServer = () => {
    if (!preset) return
    methods.reset(toSkillPresetFormValues(preset))
    setBaseRevision(preset.revision)
    setSavedElsewhere(false)
    setRejection(null)
    setConflictDetail(null)
  }

  // The errors come as an argument: the form state read here is still the one from before the submit.
  const onInvalid = (invalidFields: FieldErrors<SkillPresetFormValues>) => {
    const [firstError] = Object.keys(flattenFieldErrors(invalidFields))
    if (!firstError) return
    // The fields are controlled and pass no ref to react-hook-form, so focus goes through the DOM: the
    // input of that name, or the textarea Monaco reads its keyboard input from.
    const markdownField = document.querySelector(`[data-field-name="${firstError}"]`)
    const target = markdownField ?? document.querySelector(`[name="${firstError}"]`)
    const focusable = markdownField ? markdownField.querySelector('textarea') : target
    if (focusable instanceof HTMLElement) focusable.focus({ preventScroll: true })
    scrollToElement(target)
  }

  const onValid = async (values: SkillPresetFormValues) => {
    if (saving.current) return
    saving.current = true
    const submitted = snapshotSkillPresetFormValues(values)
    setRejection(null)
    setConflictDetail(null)
    setServerError(null)
    setBlockedBy(null)
    setSavedElsewhere(false)
    setSavePhase('checking')
    const body = toSkillPresetRequest({ ...submitted, isTemplate: asTemplate })
    try {
      if (preset) {
        const saved = await editSkillPreset({ organizationId, skillPresetId: preset.id, body })
        // The review passed and the revision is stored: refresh what the page shows from it.
        setSavePhase('saving')
        await queryClient.invalidateQueries({ queryKey: queries.skillPresets._def })
        // The saved revision becomes the baseline. Edits typed during the review stay, as unsaved changes.
        const savedValues = toSkillPresetFormValues(saved)
        const draft = keepEditsSinceSubmit({ saved: savedValues, submitted, current: methods.getValues() })
        methods.reset(savedValues)
        if (draft !== savedValues) methods.reset(draft, { keepDefaultValues: true })
        setBaseRevision(saved.revision)
      } else {
        await createSkillPreset({ organizationId, body })
        setSavePhase('saving')
        leavingAfterSave.current = true
        navigate({ to: '/organization/$organizationId/agents/skill-presets', params: { organizationId } })
      }
    } catch (error) {
      const status = getSkillPresetErrorStatus(error)
      if (isSkillPresetReviewUnavailable(error)) {
        // Nothing was saved and the draft stays as is: Retry sends the same draft again.
        setBlockedBy('review-unavailable')
      } else if (isSkillPresetAiFeaturesOff(error)) {
        setBlockedBy('ai-off')
      } else if (status === 422) {
        const rejectedFindings = getSkillPresetFindings(error)
        const snapshot: Record<string, string | undefined> = {}
        rejectedFindings.forEach((finding) => {
          const target = findingTarget(finding.location)
          if (target) snapshot[findingTargetKey(target)] = fieldValue(submitted, target)
        })
        setRejection({ findings: rejectedFindings, snapshot })
        scrollToElement(document.getElementById('skill-preset-editor-top'), 'start')
      } else if (isSkillPresetConcurrentModification(error)) {
        setSavedElsewhere(true)
        // Fetch the newer revision, so "Reload" starts from it.
        queryClient.invalidateQueries({ queryKey: queries.skillPresets._def })
        scrollToElement(document.getElementById('skill-preset-editor-top'), 'start')
      } else if (status === 409) {
        setConflictDetail(getSkillPresetErrorDetail(error) ?? 'Conflict')
      } else {
        setServerError(getSkillPresetErrorDetail(error) ?? 'The preset could not be saved. Try again.')
      }
    } finally {
      saving.current = false
      setSavePhase(null)
    }
  }

  const submit = methods.handleSubmit(onValid, onInvalid)

  const descriptionFindings = findingsFor(findings, { field: 'description' })

  return (
    <FormProvider {...methods}>
      <Section>
        <form id="skill-preset-editor-top" onSubmit={submit} noValidate className="flex flex-col gap-6 px-6 pt-6">
          <div className="mb-2 flex flex-col gap-3 border-b border-neutral pb-6">
            <Link
              to="/organization/$organizationId/agents/skill-presets"
              params={{ organizationId }}
              className="flex w-fit items-center gap-1.5 text-sm text-neutral-subtle hover:text-neutral"
            >
              <Icon iconName="arrow-left" iconStyle="regular" />
              Skills registry
            </Link>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Heading>{preset ? preset.name : asTemplate ? 'Save as template' : 'Create preset'}</Heading>
                {preset?.is_template && <Badge variant="outline">Template</Badge>}
              </div>
              <div className="flex items-center gap-2">
                {preset && (
                  <ButtonLink
                    to="/organization/$organizationId/agents/skill-presets/$skillPresetId/history"
                    params={{ organizationId, skillPresetId: preset.id }}
                    as="button"
                    size="md"
                    variant="outline"
                    color="neutral"
                  >
                    <Icon iconName="clock-rotate-left" iconStyle="regular" />
                    History
                  </ButtonLink>
                )}
                {preset && <DraftPreview />}
              </div>
            </div>
            {origin && <p className="text-sm text-neutral-subtle">{origin} Everything below is editable.</p>}
          </div>

          {changedElsewhere && (
            <Callout.Root color="yellow" role="status">
              <Callout.Icon>
                <Icon iconName="triangle-exclamation" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text>
                <Callout.TextHeading>This preset was changed by someone else</Callout.TextHeading>
                <Callout.TextDescription>
                  Revision {preset.revision} was saved while you were editing revision {baseRevision}. Saving now
                  replaces it with your version. Reload to start from the latest revision, which discards your changes.
                </Callout.TextDescription>
                <Button
                  type="button"
                  className="mt-3"
                  size="md"
                  variant="outline"
                  color="neutral"
                  onClick={reloadFromServer}
                >
                  Reload latest revision
                </Button>
              </Callout.Text>
            </Callout.Root>
          )}
          {findings.length > 0 && <SecurityFindingsSummary findings={findings} />}
          {blockedBy === 'review-unavailable' && (
            <Callout.Root color="yellow" role="alert">
              <Callout.Icon>
                <Icon iconName="triangle-exclamation" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text>
                <Callout.TextHeading>
                  The security review is unavailable. Nothing was saved. Try again in a minute.
                </Callout.TextHeading>
                <Callout.TextDescription>
                  Your changes are still here. Retry sends the same draft to the review again.
                </Callout.TextDescription>
              </Callout.Text>
              <Button
                type="button"
                size="md"
                variant="outline"
                color="neutral"
                className="self-center"
                disabled={savePhase !== null}
                onClick={() => submit()}
              >
                <Icon iconName="rotate-right" iconStyle="regular" />
                Retry
              </Button>
            </Callout.Root>
          )}
          {!aiFeaturesEnabled && (
            // The editor is admin-only, so the button always applies here. Turning AI features on keeps the draft.
            <AiFeaturesNotice organizationId={organizationId} canEnable onEnabled={() => setBlockedBy(null)} />
          )}
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

          <div className="max-w-content-with-navigation-left">
            <div className="flex min-w-0 flex-col gap-8">
              <EditorSection id="section-general" title="General">
                <Controller
                  control={methods.control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <InputText
                      name={field.name}
                      label="Name"
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      hint={asTemplate ? 'Shown in the template gallery when creating a preset.' : undefined}
                    />
                  )}
                />
                <Controller
                  control={methods.control}
                  name="description"
                  render={({ field, fieldState }) => (
                    <div id={findingFieldId({ field: 'description' })}>
                      <InputText
                        name={field.name}
                        label="Description (optional)"
                        value={field.value}
                        onChange={field.onChange}
                        hint="Shown to admins in the list and to members in their agent."
                        error={fieldState.error?.message ?? findingsAsText(descriptionFindings)}
                      />
                    </div>
                  )}
                />
              </EditorSection>

              <EditorSection id="section-skills" title="Skills">
                <div className="flex flex-col gap-6">
                  <Controller
                    control={methods.control}
                    name="base"
                    render={({ field }) => <BaseChooser value={field.value} onChange={field.onChange} />}
                  />
                  <HiddenQoveryChangesNotice />
                  {base === 'FULL' && (
                    <Section aria-labelledby="section-qovery-skills" className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <Heading level={3} id="section-qovery-skills">
                          Qovery skills
                        </Heading>
                        <p className="text-sm text-neutral-subtle">Keep, customize or disable the built-in skills.</p>
                      </div>
                      <QoverySkillsSection findings={findings} />
                    </Section>
                  )}
                  <Section aria-labelledby="section-custom-skills">
                    <CustomSkillsSection
                      findings={findings}
                      librarySkills={librarySkills}
                      onRename={renameCustomSkillFindings}
                    />
                  </Section>
                </div>
              </EditorSection>

              <EditorSection
                id="section-team-context"
                title="Team context"
                description="How your team uses Qovery: clusters, environments, naming, what never to do. Sent with every skill an agent loads from this preset."
              >
                <Controller
                  control={methods.control}
                  name="teamContext"
                  render={({ field, fieldState }) => (
                    <MarkdownField
                      id={findingFieldId({ field: 'teamContext' })}
                      name={field.name}
                      label="Team context"
                      hideLabel
                      value={field.value}
                      onChange={field.onChange}
                      maxLength={SKILL_PRESET_LIMITS.teamContextMaxLength}
                      error={fieldState.error?.message}
                      findings={findingsFor(findings, { field: 'teamContext' })}
                      minLines={8}
                    />
                  )}
                />
              </EditorSection>

              <EditorSection
                id="section-assignment"
                title="Who receives it"
                description={
                  asTemplate
                    ? undefined
                    : 'When several presets match a member, the most specific one wins: a preset assigned to the member, then their role’s, then the organization default. Members with none use the Qovery skills as published.'
                }
              >
                {asTemplate ? (
                  <p className="text-sm text-neutral-subtle">
                    Templates are not assigned. Start a new preset from it to give it to roles or members.
                  </p>
                ) : !assignees && assigneesError && onRetryAssignees ? (
                  <LoadError
                    title="Roles and members could not be loaded"
                    error={assigneesError}
                    onRetry={onRetryAssignees}
                  />
                ) : !assignees && isAssigneesLoading ? (
                  <div aria-label="Loading roles and members" aria-busy="true">
                    <LoaderSpinner />
                  </div>
                ) : (
                  <AssignmentSection
                    draftId={draftId}
                    otherPresets={otherPresets.filter((item) => !isTemplate(item))}
                    assignees={assignees}
                    conflictDetail={conflictDetail}
                  />
                )}
              </EditorSection>
            </div>
          </div>

          <div className="mt-4 flex max-w-content-with-navigation-left flex-wrap items-center justify-end gap-3 pb-8">
            {isSubmitted && totalTextError && (
              <span className="flex items-center gap-1.5 text-sm text-negative" data-testid="total-text-error">
                <Icon iconName="circle-exclamation" iconStyle="regular" aria-hidden="true" />
                {totalTextError}
              </span>
            )}
            {isSubmitted && errorCount > 0 && (
              <span className="flex items-center gap-1.5 text-sm text-negative">
                <Icon iconName="circle-exclamation" iconStyle="regular" aria-hidden="true" />
                {errorCount === 1 ? '1 field needs' : `${errorCount} fields need`} a change
              </span>
            )}
            {preset && !isDirty && savePhase === null && (
              <span id="save-hint" className="sr-only" data-testid="no-changes-hint">
                No changes yet
              </span>
            )}
            <span className="sr-only" aria-live="polite">
              {savePhase === 'checking' ? 'Checking for security' : savePhase === 'saving' ? 'Saving' : ''}
            </span>
            <Tooltip content={AI_FEATURES_OFF_TOOLTIP} disabled={aiFeaturesEnabled}>
              {/* A disabled button gets no pointer or focus events: the wrapper carries the tooltip. */}
              <span tabIndex={aiFeaturesEnabled ? undefined : 0} className="inline-flex">
                <Button
                  type="submit"
                  size="lg"
                  disabled={savePhase !== null || !aiFeaturesEnabled || (preset && !isDirty)}
                  aria-describedby={preset && !isDirty && savePhase === null ? 'save-hint' : undefined}
                >
                  {savePhase && <LoaderSpinner className="w-4" />}
                  {savePhase === 'checking'
                    ? 'Checking for security…'
                    : savePhase === 'saving'
                      ? 'Saving…'
                      : preset
                        ? 'Save'
                        : asTemplate
                          ? 'Save template'
                          : 'Create preset'}
                </Button>
              </span>
            </Tooltip>
          </div>
        </form>
      </Section>
    </FormProvider>
  )
}

/** Route component: create (blank, from a template, or a copy) and edit. */
function SkillPresetEditorPage() {
  const { organizationId = '', skillPresetId } = useParams({ strict: false })
  const search = useSearch({ strict: false }) as EditorSearch
  const {
    data: preset,
    isLoading: isPresetLoading,
    error: presetError,
    refetch: refetchPreset,
  } = useSkillPreset({ skillPresetId })
  const {
    data: presets = [],
    isLoading: isListLoading,
    error: listError,
    refetch: refetchList,
  } = useSkillPresets({ organizationId })
  const {
    data: assignees,
    error: assigneesError,
    isLoading: isAssigneesLoading,
    refetch: refetchAssignees,
  } = useSkillPresetAssignees({ organizationId })

  useDocumentTitle(`${skillPresetId ? 'Edit' : 'Create'} preset - Skills registry - Agents`)

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

  // A failed background refetch keeps the cached preset: the form stays mounted, so the draft is kept.
  if (skillPresetId && !preset) {
    return (
      <Section className="p-6 md:p-8">
        <LoadError
          title="This preset could not be loaded"
          error={presetError}
          onRetry={refetchPreset}
          note="It may have been deleted."
        />
      </Section>
    )
  }

  // Duplicate needs its source: never fall back to a blank form that looks like a copy.
  if (search.from && !source) {
    return (
      <Section className="p-6 md:p-8">
        {listError ? (
          <LoadError title="The preset to copy could not be loaded" error={listError} onRetry={() => refetchList()} />
        ) : (
          <Callout.Root color="red" role="alert">
            <Callout.Icon>
              <Icon iconName="circle-exclamation" iconStyle="regular" />
            </Callout.Icon>
            <Callout.Text>
              <Callout.TextHeading>The preset to copy was not found</Callout.TextHeading>
              <Callout.TextDescription>It may have been deleted.</Callout.TextDescription>
            </Callout.Text>
          </Callout.Root>
        )}
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
    initialValues = { ...copy, isTemplate: false, name: `${source.name} (copy)` }
    origin = `Copied from ${source.name}, without its assignments.`
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
      // Keyed on the preset only: a background refetch must not remount the form and drop the draft.
      key={preset ? preset.id : `${search.template ?? ''}-${search.from ?? ''}`}
      organizationId={organizationId}
      initialValues={initialValues}
      preset={preset}
      presets={presets}
      assignees={assignees}
      assigneesError={assigneesError}
      isAssigneesLoading={isAssigneesLoading}
      onRetryAssignees={refetchAssignees}
      origin={origin}
      asTemplate={preset?.is_template ?? false}
    />
  )
}

/** Owners and admins only: anyone else sees what their own agent receives. */
export function SkillPresetEditor() {
  return (
    <SkillPresetsAdminOnly>
      <SkillPresetEditorPage />
    </SkillPresetsAdminOnly>
  )
}
