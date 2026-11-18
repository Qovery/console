import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import {
  SKILL_PRESET_REVISIONS_PAGE_SIZE,
  type SkillPresetRevisionResponse,
  getSkillPresetErrorDetail,
  getSkillPresetErrorStatus,
  getSkillPresetFindings,
} from '@qovery/domains/skill-presets/data-access'
import {
  Badge,
  Button,
  Callout,
  CodeDiffEditor,
  Heading,
  Icon,
  ModalCrud,
  Section,
  Skeleton,
  Tooltip,
  useModal,
} from '@qovery/shared/ui'
import { dateFullFormat, timeAgo } from '@qovery/shared/util-dates'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { twMerge } from '@qovery/shared/util-js'
import { useCreateSkillPreset } from '../hooks/use-create-skill-preset/use-create-skill-preset'
import { useEditSkillPreset } from '../hooks/use-edit-skill-preset/use-edit-skill-preset'
import { useSkillPresetAssignees } from '../hooks/use-skill-preset-assignees/use-skill-preset-assignees'
import { useSkillPresetRevisions } from '../hooks/use-skill-preset-revisions/use-skill-preset-revisions'
import { useSkillPresets } from '../hooks/use-skill-presets/use-skill-presets'
import { LoadError } from '../load-error/load-error'
import { MockScenarioBanner } from '../mock-scenario-banner/mock-scenario-banner'
import { AssignmentChips } from '../settings-skill-presets/assignment-chips'
import { SkillPresetsAdminOnly } from '../skill-presets-layout/skill-presets-layout'
import { baseLabel } from '../utils/qovery-skills'
import { diffRevisions, reviewSummary, revisionToRequest, skillAsText, summarizeDiff } from '../utils/revision-diff'
import { findingLocationLabel } from '../utils/skill-preset-findings'

const CHANGE_LABELS = { CREATE: 'Created', UPDATE: 'Updated', DELETE: 'Deleted' } as const
const CHANGE_ICONS = { CREATE: 'circle-plus', UPDATE: 'pen', DELETE: 'trash-can' } as const

function RestoreModal({
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => Promise<void>
  onClose: () => void
}) {
  const methods = useForm()
  return (
    <FormProvider {...methods}>
      <ModalCrud
        title={title}
        submitLabel={confirmLabel}
        loading={methods.formState.isSubmitting}
        onClose={onClose}
        onSubmit={methods.handleSubmit(async () => {
          await onConfirm()
          onClose()
        })}
      >
        <p className="text-sm text-neutral-subtle">{description}</p>
      </ModalCrud>
    </FormProvider>
  )
}

function TextDiff({ title, before, after }: { title: string; before: string; after: string }) {
  const lines = Math.max(before.split('\n').length, after.split('\n').length)
  return (
    <section className="flex flex-col gap-2" aria-label={title}>
      <Heading level={3}>{title}</Heading>
      <div className="grid grid-cols-2 text-xs text-neutral-subtle" aria-hidden="true">
        <span>Before</span>
        <span>After</span>
      </div>
      <div className="overflow-hidden rounded-md border border-neutral">
        <CodeDiffEditor
          original={before}
          modified={after}
          language="markdown"
          height={`${Math.min(lines * 26 + 24, 480)}px`}
          options={{
            wordWrap: 'on',
            diffWordWrap: 'on',
            scrollBeyondLastLine: false,
            useInlineViewWhenSpaceIsLimited: false,
            hideUnchangedRegions: { enabled: true, contextLineCount: 2, minimumLineCount: 4 },
          }}
        />
      </div>
    </section>
  )
}

function SkillPresetHistoryPage() {
  const { organizationId = '', skillPresetId = '' } = useParams({ strict: false })
  const navigate = useNavigate()
  const { data: revisions = [], isLoading, error, refetch } = useSkillPresetRevisions({ organizationId, skillPresetId })
  const { data: presets = [] } = useSkillPresets({ organizationId })
  const { data: assignees } = useSkillPresetAssignees({ organizationId })
  const { mutateAsync: editSkillPreset, isLoading: isRestoring } = useEditSkillPreset({
    successMessage: 'Revision restored as a new revision',
  })
  const { mutateAsync: createSkillPreset } = useCreateSkillPreset()
  const { openModal, closeModal } = useModal()
  const [selectedRevision, setSelectedRevision] = useState<number | null>(null)
  const [restoreError, setRestoreError] = useState<string | null>(null)

  // Newest first, each with the revision just before it when it is loaded. The API returns at most
  // SKILL_PRESET_REVISIONS_PAGE_SIZE revisions, so the oldest loaded one may have no previous here.
  const entries = useMemo(() => {
    const sorted = [...revisions].sort((a, b) => b.revision - a.revision)
    return sorted.map((revision, index) => {
      const previous = sorted[index + 1]
      // Revision 1 is the creation: diffing it against nothing is right. Any other revision without
      // its previous one loaded cannot be diffed.
      const comparable = previous !== undefined || revision.revision === 1
      return {
        revision,
        previous,
        comparable,
        summary: !comparable
          ? 'Changes not shown: the revision before is not loaded'
          : revision.change_type === 'UPDATE'
            ? summarizeDiff(diffRevisions(previous, revision))
            : null,
      }
    })
  }, [revisions])
  const isCapped = revisions.length >= SKILL_PRESET_REVISIONS_PAGE_SIZE
  const latest = entries[0]?.revision
  const selectedEntry = entries.find(({ revision }) => revision.revision === selectedRevision) ?? entries[0]
  const selected = selectedEntry?.revision
  const previous = selectedEntry?.previous
  const isDeleted = latest?.change_type === 'DELETE'
  const presetExists = presets.some(({ id }) => id === skillPresetId)

  useDocumentTitle(`History of ${latest?.name ?? 'preset'} - Skills Registry - Agents`)

  const restore = (revision: SkillPresetRevisionResponse) => {
    const recreate = isDeleted || !presetExists
    const confirm = async () => {
      setRestoreError(null)
      try {
        if (recreate) {
          const created = await createSkillPreset({ organizationId, body: revisionToRequest(revision) })
          navigate({
            to: '/organization/$organizationId/agent-experience/skill-presets/$skillPresetId',
            params: { organizationId, skillPresetId: created.id },
          })
        } else {
          await editSkillPreset({ organizationId, skillPresetId, body: revisionToRequest(revision) })
          setSelectedRevision(null)
        }
      } catch (restoreFailure) {
        const findings = getSkillPresetFindings(restoreFailure)
        setRestoreError(
          getSkillPresetErrorStatus(restoreFailure) === 422
            ? `Qovery’s checks changed since this revision was saved, and it no longer passes: ${findings
                .map((finding) => `${findingLocationLabel(finding)} (${finding.reason})`)
                .join('; ')}. Fix these lines in the editor instead.`
            : getSkillPresetErrorDetail(restoreFailure) ?? 'The revision could not be restored.'
        )
      }
    }
    openModal({
      content: (
        <RestoreModal
          title={recreate ? `Recreate ${revision.name}` : `Restore revision ${revision.revision}`}
          description={
            recreate
              ? `This creates a new preset with the content and assignments of revision ${revision.revision}.`
              : `This saves the content and assignments of revision ${revision.revision} as revision ${(latest?.revision ?? 0) + 1}. Nothing is lost: the current revision stays in the history. Members’ agents pick it up on their next skill load.`
          }
          confirmLabel={recreate ? 'Recreate preset' : `Restore revision ${revision.revision}`}
          onConfirm={confirm}
          onClose={closeModal}
        />
      ),
    })
  }

  if (isLoading) {
    return (
      <Section className="flex flex-col gap-4 px-8 pt-6">
        <Skeleton width={260} height={24} show />
        <Skeleton height={320} className="w-full" show />
      </Section>
    )
  }

  if (error) {
    return (
      <Section className="px-8 pt-6">
        <LoadError title="The history could not be loaded" error={error} onRetry={() => refetch()} />
      </Section>
    )
  }

  if (!latest || !selected || !selectedEntry) {
    return (
      <Section className="px-8 pt-6">
        <Callout.Root color="neutral">
          <Callout.Icon>
            <Icon iconName="circle-info" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>
            <Callout.TextHeading>No history found for this preset</Callout.TextHeading>
            <Callout.TextDescription>It may belong to another organization.</Callout.TextDescription>
          </Callout.Text>
        </Callout.Root>
      </Section>
    )
  }

  const diff = selectedEntry.comparable
    ? diffRevisions(previous, selected)
    : { template: null, name: null, description: null, base: null, teamContext: null, skills: [], assignments: null }
  const isLatest = selected.revision === latest.revision
  const review = reviewSummary(selected)

  return (
    <Section className="flex flex-col gap-6 px-8 pb-8 pt-6">
      <div className="flex flex-col gap-3">
        <Link
          to={
            presetExists
              ? '/organization/$organizationId/agent-experience/skill-presets/$skillPresetId'
              : '/organization/$organizationId/agent-experience/skill-presets'
          }
          params={{ organizationId, skillPresetId }}
          className="flex w-fit items-center gap-1.5 text-sm text-neutral-subtle hover:text-neutral"
        >
          <Icon iconName="arrow-left" iconStyle="regular" />
          {presetExists ? latest.name : 'Skills Registry'}
        </Link>
        <div className="flex items-center gap-3">
          <Heading>History of {latest.name}</Heading>
          {isDeleted && <Badge variant="surface">Deleted</Badge>}
        </div>
        <p className="text-sm text-neutral-subtle">
          Every save is kept with its full text, even after the preset is deleted. Pick a revision to see what it
          changed.
        </p>
      </div>

      <MockScenarioBanner />

      {restoreError && (
        <Callout.Root color="red" role="alert">
          <Callout.Icon>
            <Icon iconName="circle-exclamation" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>
            <Callout.TextHeading>Not restored</Callout.TextHeading>
            <Callout.TextDescription>{restoreError}</Callout.TextDescription>
          </Callout.Text>
        </Callout.Root>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <nav aria-label="Revisions" className="lg:sticky lg:top-4">
          <ol className="relative flex flex-col gap-1 before:absolute before:bottom-3 before:left-[15px] before:top-3 before:w-px before:bg-surface-neutral-component">
            {entries.map(({ revision, summary }) => {
              const isSelected = revision.revision === selected.revision
              return (
                <li key={revision.revision}>
                  <button
                    type="button"
                    onClick={() => setSelectedRevision(revision.revision)}
                    aria-current={isSelected ? 'true' : undefined}
                    className={twMerge(
                      'relative flex w-full gap-3 rounded-md p-2 text-left hover:bg-surface-neutral-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-strong',
                      isSelected && 'ring-brand-strong bg-surface-neutral-subtle ring-1'
                    )}
                  >
                    <span className="z-10 flex h-4 w-4 shrink-0 translate-x-[7px] translate-y-0.5 items-center justify-center rounded-full bg-background">
                      <Icon
                        iconName={CHANGE_ICONS[revision.change_type]}
                        iconStyle="regular"
                        className="text-xs text-neutral-subtle"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="flex min-w-0 flex-col gap-0.5 pl-2">
                      <span className="text-sm font-medium text-neutral">
                        Revision {revision.revision} · {CHANGE_LABELS[revision.change_type]}
                        {revision.revision === latest.revision && revision.change_type !== 'DELETE' && (
                          <span className="font-normal text-neutral-subtle"> (current)</span>
                        )}
                      </span>
                      <span className="truncate text-xs text-neutral">{revision.edited_by}</span>
                      {/* Inside a button, so no tooltip: the full date is read out and shown in the panel. */}
                      <span className="w-fit text-xs text-neutral-subtle">
                        {timeAgo(new Date(revision.edited_at))} ago
                        <span className="sr-only">, {dateFullFormat(revision.edited_at)}</span>
                      </span>
                      {summary && <span className="text-xs text-neutral-subtle">{summary}</span>}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
          {isCapped && (
            <p className="mt-3 px-2 text-xs text-neutral-subtle">
              Older revisions are not shown: only the latest {SKILL_PRESET_REVISIONS_PAGE_SIZE} can be listed here. All
              of them stay in the audit logs.
            </p>
          )}
        </nav>

        <article
          aria-labelledby="revision-title"
          className="flex min-w-0 flex-col gap-6 rounded-md border border-neutral p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <Heading level={2} id="revision-title">
                Revision {selected.revision}: {CHANGE_LABELS[selected.change_type].toLowerCase()} by{' '}
                {selected.edited_by}
              </Heading>
              <p className="text-xs text-neutral-subtle">
                {dateFullFormat(selected.edited_at)} · {baseLabel(selected.base)}
                {previous ? ` · compared with revision ${previous.revision}` : ''}
              </p>
              {review && (
                <p className="flex items-center gap-1.5 text-xs text-neutral-subtle">
                  <Icon iconName="shield-check" iconStyle="regular" aria-hidden="true" />
                  <Tooltip content={`Model: ${review.model}`}>
                    <span tabIndex={0}>{review.text}</span>
                  </Tooltip>
                </p>
              )}
            </div>
            {selected.change_type !== 'DELETE' && (!isLatest || isDeleted || !presetExists) && (
              <Button
                type="button"
                size="md"
                variant="outline"
                color="neutral"
                loading={isRestoring}
                onClick={() => restore(selected)}
              >
                <Icon iconName="clock-rotate-left" iconStyle="regular" />
                {isDeleted || !presetExists ? 'Recreate from this revision' : 'Restore this revision'}
              </Button>
            )}
          </div>

          {selected.change_type === 'DELETE' && (
            <p className="text-sm text-neutral-subtle">
              The preset was deleted. This revision holds its last state, shown against the revision before.
            </p>
          )}

          {!selectedEntry.comparable && (
            <p className="text-sm text-neutral-subtle">
              The revision before this one is not loaded, so its changes can’t be shown. You can still restore it.
            </p>
          )}

          {diff.name && <TextDiff title="Name" before={diff.name.before} after={diff.name.after} />}
          {diff.base && (
            <p className="text-sm text-neutral">
              Base: {baseLabel(diff.base.before as SkillPresetRevisionResponse['base'])} →{' '}
              <span className="font-medium">{baseLabel(diff.base.after as SkillPresetRevisionResponse['base'])}</span>
            </p>
          )}
          {diff.description && (
            <TextDiff title="Description" before={diff.description.before} after={diff.description.after} />
          )}
          {diff.teamContext && (
            <TextDiff title="Team context" before={diff.teamContext.before} after={diff.teamContext.after} />
          )}
          {diff.skills.map((change) => (
            <TextDiff
              key={change.skillName}
              title={`${change.skillName}${!change.before ? ' (added)' : !change.after ? ' (removed)' : ''}`}
              before={skillAsText(change.before)}
              after={skillAsText(change.after)}
            />
          ))}
          {diff.assignments && (
            <section className="flex flex-col gap-2" aria-label="Assignments">
              <Heading level={3}>Assignments</Heading>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-neutral-subtle">Before</span>
                  <AssignmentChips assignedTo={diff.assignments.before} assignees={assignees} max={8} />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-neutral-subtle">After</span>
                  <AssignmentChips assignedTo={diff.assignments.after} assignees={assignees} max={8} />
                </div>
              </div>
            </section>
          )}
          {!diff.name &&
            !diff.base &&
            !diff.description &&
            !diff.teamContext &&
            diff.skills.length === 0 &&
            !diff.assignments && (
              <p className="text-sm text-neutral-subtle">No change in content: this revision saved the same state.</p>
            )}
        </article>
      </div>
    </Section>
  )
}

/** Owners and admins only: anyone else sees what their own agent receives. */
export function SkillPresetHistory() {
  return (
    <SkillPresetsAdminOnly>
      <SkillPresetHistoryPage />
    </SkillPresetsAdminOnly>
  )
}
