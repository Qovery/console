import { useQueryClient } from '@tanstack/react-query'
import { Link, useBlocker, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { type ReactNode, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { Controller, FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form'
import {
  SKILL_PRESET_LIMITS,
  SKILL_PRESET_REVIEW_UNAVAILABLE_MESSAGE,
  type SkillPresetAssignees,
  type SkillPresetFinding,
  type SkillPresetResponse,
  getSkillPresetErrorDetail,
  getSkillPresetErrorStatus,
  getSkillPresetFindings,
  isSkillPresetAiFeaturesOff,
  isSkillPresetConcurrentModification,
  isSkillPresetReviewUnavailable,
} from '@qovery/domains/skill-presets/data-access'
import { Badge, Button, Callout, Heading, Icon, InputText, LoaderSpinner, Section, Tooltip } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { queries } from '@qovery/state/util-queries'
import { AI_FEATURES_OFF_TOOLTIP, AiFeaturesNotice } from '../ai-features-notice/ai-features-notice'
import { useAiFeaturesEnabled } from '../hooks/use-ai-features-enabled/use-ai-features-enabled'
import { useCreateSkillPreset } from '../hooks/use-create-skill-preset/use-create-skill-preset'
import { useEditSkillPreset } from '../hooks/use-edit-skill-preset/use-edit-skill-preset'
import { useSkillPresetAssignees } from '../hooks/use-skill-preset-assignees/use-skill-preset-assignees'
import { useSkillPreset } from '../hooks/use-skill-preset/use-skill-preset'
import { useSkillPresets } from '../hooks/use-skill-presets/use-skill-presets'
import { MarkdownField } from '../markdown-field/markdown-field'
import { MockScenarioBanner } from '../mock-scenario-banner/mock-scenario-banner'
import { SecurityFindingsSummary } from '../security-findings-summary/security-findings-summary'
import { SkillPresetsAdminOnly } from '../skill-presets-layout/skill-presets-layout'
import { PreviewAsMemberSelect } from '../token-budget/preview-as-member'
import { TokenBudgetView } from '../token-budget/token-budget-view'
import { PREVIEW_ANYONE, describeResolution, resolvePreviewTarget } from '../utils/preview-target'
import { QOVERY_SKILLS } from '../utils/qovery-skills'
import { RESOLUTION_SOURCE_LABELS, isTemplate } from '../utils/resolve-preset'
import { scrollToElement } from '../utils/scroll'
import {
  type FindingTarget,
  findingFieldId,
  findingTarget,
  findingTargetKey,
  findingsAsText,
  findingsFor,
} from '../utils/skill-preset-findings'
import { type SkillPresetFormValues, toSkillPresetFormValues, toSkillPresetRequest } from '../utils/skill-preset-form'
import { SKILL_PRESET_TEMPLATES, findTemplate } from '../utils/skill-preset-templates'
import { flattenFieldErrors, skillPresetResolver } from '../utils/skill-preset-validation'
import { computeTokenBudget } from '../utils/token-budget'
import { AssignmentSection } from './assignment-section'
import { BaseChooser } from './base-chooser'
import { CustomSkillsSection } from './custom-skills-section'
import { QoverySkillsSection } from './qovery-skills-section'
import { type LibrarySkill } from './skill-library-modal'
import { TotalTextCounter } from './total-text-counter'

const NEW_PRESET_ID = 'new-preset'
const LEAVE_UNSAVED_CHANGES_MESSAGE = 'You have unsaved changes on this preset. Leave the page and discard them?'

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

/** Tells the admin their Qovery skill changes are kept in the draft but not saved on the lean and empty bases. */
function HiddenQoveryChangesNotice() {
  const { control } = useFormContext<SkillPresetFormValues>()
  const [base, qoverySkills] = useWatch({ control, name: ['base', 'qoverySkills'] })
  const count = base !== 'QOVERY_FULL' ? qoverySkills.filter(({ choice }) => choice !== 'AS_IS').length : 0
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

interface AgentContextPanelProps {
  draftId: string
  otherPresets: SkillPresetResponse[]
  assignees?: SkillPresetAssignees
}

/**
 * The side panel. It is the only part that reads the whole draft, and it reads a deferred copy, so
 * typing stays fast while the budget catches up.
 */
function AgentContextPanel({ draftId, otherPresets, assignees }: AgentContextPanelProps) {
  const { control } = useFormContext<SkillPresetFormValues>()
  const values = useWatch({ control }) as SkillPresetFormValues
  const deferredValues = useDeferredValue(values)
  const [previewTarget, setPreviewTarget] = useState(PREVIEW_ANYONE)

  const { previewed, budget } = useMemo(() => {
    const request = toSkillPresetRequest(deferredValues)
    const resolved =
      previewTarget === PREVIEW_ANYONE
        ? null
        : resolvePreviewTarget(previewTarget, [{ ...request, id: draftId }, ...otherPresets], assignees)
    const previewedPreset = !resolved || resolved.preset?.id === draftId ? request : resolved.preset ?? null
    return { previewed: resolved, budget: computeTokenBudget(previewedPreset) }
  }, [deferredValues, previewTarget, draftId, otherPresets, assignees])

  return (
    <Section
      aria-labelledby="agent-context-title"
      className="flex flex-col gap-4 rounded-md border border-neutral bg-surface-neutral p-4 xl:sticky xl:top-4"
    >
      <div className="flex flex-col gap-1">
        <Heading level={2} id="agent-context-title">
          What members’ agents receive
        </Heading>
        <p className="text-xs text-neutral-subtle">
          Agents read a short skill list first, then load only the skills a task needs. Members can read every piece in
          full, with its SHA-256. Every save is checked by rules and by a model review before it reaches members.
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
              : `${previewed.targetLabel} gets no preset: Qovery skills as published. Showing today’s cost.`}
        </p>
      )}
      <TokenBudgetView budget={budget} compact />
    </Section>
  )
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

interface Rejection {
  findings: SkillPresetFinding[]
  /** The text of each field as it was rejected, to drop a finding once the admin edits its field. */
  snapshot: Record<string, string | undefined>
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
  const flatErrors = flattenFieldErrors(errors)
  const errorCount = Object.keys(flatErrors).length
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
      const remaining = rejection.findings.filter((finding) => {
        const target = findingTarget(finding.location)
        return (
          !target ||
          fieldValue(values as SkillPresetFormValues, target) === rejection.snapshot[findingTargetKey(target)]
        )
      })
      if (remaining.length !== rejection.findings.length) setRejection({ ...rejection, findings: remaining })
    })
    return () => subscription.unsubscribe()
  }, [methods, rejection])

  const findings = rejection?.findings ?? []

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

  const reloadFromServer = () => {
    if (!preset) return
    methods.reset(toSkillPresetFormValues(preset))
    setBaseRevision(preset.revision)
    setSavedElsewhere(false)
    setRejection(null)
    setConflictDetail(null)
  }

  const onInvalid = () => {
    const [firstError] = Object.keys(flattenFieldErrors(methods.formState.errors))
    if (!firstError) return
    // Text inputs take focus through react-hook-form; Monaco fields are scrolled to.
    methods.setFocus(firstError as Parameters<typeof methods.setFocus>[0])
    scrollToElement(document.querySelector(`[name="${firstError}"]`))
  }

  const onValid = async (submitted: SkillPresetFormValues) => {
    if (saving.current) return
    saving.current = true
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
        methods.reset(toSkillPresetFormValues(saved))
        setBaseRevision(saved.revision)
      } else {
        await createSkillPreset({ organizationId, body })
        setSavePhase('saving')
        leavingAfterSave.current = true
        navigate({ to: '/organization/$organizationId/agent-experience/skill-presets', params: { organizationId } })
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
        <form id="skill-preset-editor-top" onSubmit={submit} noValidate className="flex flex-col gap-6 px-8 pt-6">
          <div className="flex flex-col gap-3">
            <Link
              to="/organization/$organizationId/agent-experience/skill-presets"
              params={{ organizationId }}
              className="flex w-fit items-center gap-1.5 text-sm text-neutral-subtle hover:text-neutral"
            >
              <Icon iconName="arrow-left" iconStyle="regular" />
              Skill presets
            </Link>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Heading>{preset ? preset.name : asTemplate ? 'Save as template' : 'Create preset'}</Heading>
                {preset && <Badge variant="surface">Revision {baseRevision}</Badge>}
                {preset?.is_template && <Badge variant="outline">Template</Badge>}
              </div>
              {preset && (
                <Link
                  to="/organization/$organizationId/agent-experience/skill-presets/$skillPresetId/history"
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
                <Callout.TextHeading>{SKILL_PRESET_REVIEW_UNAVAILABLE_MESSAGE}</Callout.TextHeading>
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

          <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
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

              <EditorSection
                id="section-base"
                title="Start from"
                description="The Qovery skills members’ agents can load. Your team context and your own skills apply on top of any choice."
              >
                <Controller
                  control={methods.control}
                  name="base"
                  render={({ field }) => <BaseChooser value={field.value} onChange={field.onChange} />}
                />
                <HiddenQoveryChangesNotice />
              </EditorSection>

              {base === 'QOVERY_FULL' && (
                <EditorSection
                  id="section-qovery-skills"
                  title="Qovery skills"
                  description="Use a skill as Qovery publishes it, add your team’s instructions after it, replace it with your own text, or turn it off."
                >
                  <QoverySkillsSection findings={findings} />
                </EditorSection>
              )}

              <EditorSection
                id="section-custom-skills"
                title="Your skills"
                description="Skills your organization writes. Agents load one when its description matches the task."
              >
                <CustomSkillsSection findings={findings} librarySkills={librarySkills} />
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
                      label="Team context"
                      value={field.value}
                      onChange={field.onChange}
                      maxLength={SKILL_PRESET_LIMITS.teamContextMaxLength}
                      hint="Keep it short: it is added to every skill load."
                      error={fieldState.error?.message}
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
                    otherPresets={otherPresets.filter((item) => !isTemplate(item))}
                    assignees={assignees}
                    conflictDetail={conflictDetail}
                  />
                )}
              </EditorSection>
            </div>

            <AgentContextPanel draftId={draftId} otherPresets={otherPresets} assignees={assignees} />
          </div>

          <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-neutral bg-background py-3">
            <TotalTextCounter />
            {isSubmitted && errorCount > 0 && (
              <span className="flex items-center gap-1.5 text-sm text-negative">
                <Icon iconName="circle-exclamation" iconStyle="regular" aria-hidden="true" />
                {errorCount === 1 ? '1 field needs' : `${errorCount} fields need`} a change
              </span>
            )}
            <Button
              type="button"
              size="lg"
              variant="plain"
              color="neutral"
              className="ml-auto"
              onClick={() =>
                navigate({
                  to: '/organization/$organizationId/agent-experience/skill-presets',
                  params: { organizationId },
                })
              }
            >
              Cancel
            </Button>
            {preset && !isDirty && savePhase === null && (
              <span id="save-hint" className="text-sm text-neutral-subtle" data-testid="no-changes-hint">
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
                        ? 'Save changes'
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
  const asTemplate = search.asTemplate === true || search.asTemplate === 'true'
  const { data: preset, isLoading: isPresetLoading, error: presetError } = useSkillPreset({ skillPresetId })
  const { data: presets = [], isLoading: isListLoading } = useSkillPresets({ organizationId })
  const { data: assignees } = useSkillPresetAssignees({ organizationId })

  useDocumentTitle(`${skillPresetId ? 'Edit' : 'Create'} skill preset - Agents`)

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
    initialValues = {
      ...copy,
      isTemplate: asTemplate,
      name: asTemplate ? `${source.name} template` : isTemplate(source) ? source.name : `${source.name} (copy)`,
    }
    origin = isTemplate(source)
      ? `Started from your template ${source.name}.`
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
      // Keyed on the preset only: a background refetch must not remount the form and drop the draft.
      key={preset ? preset.id : `${search.template ?? ''}-${search.from ?? ''}`}
      organizationId={organizationId}
      initialValues={initialValues}
      preset={preset}
      presets={presets}
      assignees={assignees}
      origin={origin}
      asTemplate={preset ? preset.is_template : asTemplate}
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
