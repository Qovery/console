import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useState } from 'react'
import { type SkillPresetResponse, getSkillPresetErrorStatus } from '@qovery/domains/skill-presets/data-access'
import {
  Badge,
  Button,
  DropdownMenu,
  EmptyState,
  Heading,
  Icon,
  Section,
  Skeleton,
  TablePrimitives,
  Tooltip,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { dateFullFormat, timeAgo } from '@qovery/shared/util-dates'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useDeleteSkillPreset } from '../hooks/use-delete-skill-preset/use-delete-skill-preset'
import { useSkillPresetAssignees } from '../hooks/use-skill-preset-assignees/use-skill-preset-assignees'
import { useSkillPresetRevisions } from '../hooks/use-skill-preset-revisions/use-skill-preset-revisions'
import { useSkillPresets } from '../hooks/use-skill-presets/use-skill-presets'
import { LoadError } from '../load-error/load-error'
import { SkillPresetsLayout } from '../skill-presets-layout/skill-presets-layout'
import { PreviewAsMemberSelect } from '../token-budget/preview-as-member'
import { TokenBudgetView } from '../token-budget/token-budget-view'
import { describeResolution, previewTargets, resolvePreviewTarget } from '../utils/preview-target'
import { baseLabel } from '../utils/qovery-skills'
import { isTemplate } from '../utils/resolve-preset'
import { computeTokenBudget } from '../utils/token-budget'
import { AssignmentChips } from './assignment-chips'

const { Table } = TablePrimitives

function ListSkeleton() {
  return (
    <div
      className="flex flex-col gap-3 rounded-md border border-neutral p-4"
      aria-busy="true"
      aria-label="Loading presets"
    >
      {[0, 1, 2].map((index) => (
        <div key={index} className="flex items-center gap-6">
          <Skeleton width={200} height={14} show />
          <Skeleton width={90} height={14} show />
          <Skeleton width={220} height={14} show />
          <Skeleton width={120} height={14} show />
        </div>
      ))}
    </div>
  )
}

function PresetRow({
  preset,
  organizationId,
  assignees,
  onDelete,
}: {
  preset: SkillPresetResponse
  organizationId: string
  assignees: ReturnType<typeof useSkillPresetAssignees>['data']
  onDelete: (preset: SkillPresetResponse) => void
}) {
  const navigate = useNavigate()
  // One small request per row: the organization-wide history is capped and would miss older presets.
  const { data: [lastRevision] = [] } = useSkillPresetRevisions({
    organizationId,
    skillPresetId: preset.id,
    limit: 1,
  })
  const editedAt = lastRevision?.edited_at ?? preset.updated_at
  const editedBy = lastRevision?.edited_by ?? preset.creator_name ?? 'Unknown'
  const template = isTemplate(preset)
  const skillChanges = preset.skills.length

  return (
    <Table.Row data-testid={`skill-preset-${preset.id}`} className="hover:bg-surface-neutral-subtle">
      <Table.Cell className="h-auto py-3">
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-2">
            <Link
              to="/organization/$organizationId/settings/skill-presets/$skillPresetId"
              params={{ organizationId, skillPresetId: preset.id }}
              className="font-medium text-neutral hover:text-brand"
            >
              {preset.name}
            </Link>
            {template && <Badge variant="outline">Template</Badge>}
          </span>
          {preset.description && (
            <span className="max-w-sm truncate text-xs text-neutral-subtle">{preset.description}</span>
          )}
          <span className="text-xs text-neutral-subtle">
            {skillChanges === 0
              ? 'No skill changes'
              : `${skillChanges} skill ${skillChanges === 1 ? 'change' : 'changes'}`}
            {preset.team_context ? ' · team context' : ''}
          </span>
        </div>
      </Table.Cell>
      <Table.Cell className="whitespace-nowrap">{baseLabel(preset.base)}</Table.Cell>
      <Table.Cell className="h-auto py-3">
        {template ? (
          <span className="text-sm text-neutral-subtle">Templates are not assigned</span>
        ) : (
          <AssignmentChips assignedTo={preset.assigned_to} assignees={assignees} />
        )}
      </Table.Cell>
      <Table.Cell>
        <Link
          to="/organization/$organizationId/settings/skill-presets/$skillPresetId/history"
          params={{ organizationId, skillPresetId: preset.id }}
          className="whitespace-nowrap text-neutral hover:text-brand"
        >
          Revision {preset.revision}
        </Link>
      </Table.Cell>
      <Table.Cell className="h-auto py-3">
        <span className="flex flex-col text-xs">
          <span className="truncate text-neutral">{editedBy}</span>
          <Tooltip content={dateFullFormat(editedAt)}>
            <span tabIndex={0} className="w-fit text-neutral-subtle">
              {timeAgo(new Date(editedAt))} ago
            </span>
          </Tooltip>
        </span>
      </Table.Cell>
      <Table.Cell className="text-right">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button size="md" variant="outline" color="neutral" iconOnly aria-label={`Actions for ${preset.name}`}>
              <Icon iconName="ellipsis-v" iconStyle="regular" />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            <DropdownMenu.Item
              icon={<Icon iconName="pen" iconStyle="regular" />}
              onSelect={() =>
                navigate({
                  to: '/organization/$organizationId/settings/skill-presets/$skillPresetId',
                  params: { organizationId, skillPresetId: preset.id },
                })
              }
            >
              Edit
            </DropdownMenu.Item>
            <DropdownMenu.Item
              icon={<Icon iconName="clock-rotate-left" iconStyle="regular" />}
              onSelect={() =>
                navigate({
                  to: '/organization/$organizationId/settings/skill-presets/$skillPresetId/history',
                  params: { organizationId, skillPresetId: preset.id },
                })
              }
            >
              History
            </DropdownMenu.Item>
            <DropdownMenu.Item
              icon={<Icon iconName="copy" iconStyle="regular" />}
              onSelect={() =>
                navigate({
                  to: '/organization/$organizationId/settings/skill-presets/new',
                  params: { organizationId },
                  search: { from: preset.id },
                })
              }
            >
              Duplicate
            </DropdownMenu.Item>
            {!template && (
              <DropdownMenu.Item
                icon={<Icon iconName="bookmark" iconStyle="regular" />}
                onSelect={() =>
                  navigate({
                    to: '/organization/$organizationId/settings/skill-presets/new',
                    params: { organizationId },
                    search: { from: preset.id, asTemplate: true },
                  })
                }
              >
                Save as template
              </DropdownMenu.Item>
            )}
            <DropdownMenu.Separator />
            <DropdownMenu.Item
              color="red"
              icon={<Icon iconName="trash-can" iconStyle="regular" />}
              onSelect={() => onDelete(preset)}
            >
              Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Table.Cell>
    </Table.Row>
  )
}

function PresetsContent({ organizationId }: { organizationId: string }) {
  const navigate = useNavigate()
  const { data: presets, isLoading, error, refetch } = useSkillPresets({ organizationId })
  const { data: assignees } = useSkillPresetAssignees({ organizationId })
  const { mutateAsync: deleteSkillPreset } = useDeleteSkillPreset()
  const { openModalConfirmation } = useModalConfirmation()
  const [previewTarget, setPreviewTarget] = useState<string>('')

  if (isLoading) return <ListSkeleton />

  if (error && getSkillPresetErrorStatus(error) !== 403) {
    return (
      <LoadError
        title="Skill presets could not be loaded"
        error={error}
        onRetry={() => refetch()}
        note="Your members’ agents keep working with the preset they last loaded."
      />
    )
  }

  const all = presets ?? []
  if (all.length === 0) {
    return (
      <EmptyState
        icon="wand-magic-sparkles"
        title="No skill presets yet"
        description="A preset decides which Qovery skills your members’ agents load, adds your team’s instructions and your own skills, and applies to the whole organization, a role or specific members. Until you create one, agents use the Qovery skills as published."
      >
        <div className="flex gap-2">
          <Button
            size="md"
            onClick={() =>
              navigate({ to: '/organization/$organizationId/settings/skill-presets/new', params: { organizationId } })
            }
          >
            <Icon iconName="grid-2" iconStyle="regular" />
            Start from a template
          </Button>
          <Button
            size="md"
            variant="outline"
            color="neutral"
            onClick={() =>
              navigate({
                to: '/organization/$organizationId/settings/skill-presets/new',
                params: { organizationId },
                search: { template: 'blank' },
              })
            }
          >
            Blank preset
          </Button>
        </div>
      </EmptyState>
    )
  }

  const assigned = all.filter((preset) => !isTemplate(preset))
  const templates = all.filter(isTemplate)
  const ordered = [...assigned, ...templates]
  const target = previewTarget || previewTargets(assignees)[0]?.value || ''
  const resolved = target ? resolvePreviewTarget(target, assigned, assignees) : null

  const onDelete = (preset: SkillPresetResponse) =>
    openModalConfirmation({
      title: 'Delete skill preset',
      name: preset.name,
      confirmationMethod: 'name',
      description: `Members who receive ${preset.name} fall back to their role’s preset, the organization default, or the Qovery skills as published. Its history stays in the audit logs.`,
      action: async () => {
        await deleteSkillPreset({ organizationId, skillPresetId: preset.id })
      },
    })

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Preset</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Starts from</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Assigned to</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Revision</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Last edited</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>
                <span className="sr-only">Actions</span>
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {ordered.map((preset) => (
              <PresetRow
                key={preset.id}
                preset={preset}
                organizationId={organizationId}
                assignees={assignees}
                onDelete={onDelete}
              />
            ))}
          </Table.Body>
        </Table.Root>
        <p className="text-xs text-neutral-subtle">
          A member gets the preset assigned to them, otherwise their role’s, otherwise the organization default.
        </p>
      </div>

      <Section
        aria-labelledby="preview-member-title"
        className="grid grid-cols-1 gap-6 rounded-md border border-neutral p-4 lg:grid-cols-[280px_minmax(0,1fr)]"
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Heading level={2} id="preview-member-title">
              Preview as member
            </Heading>
            <p className="text-xs text-neutral-subtle">
              Which preset a member gets, and what it costs their agent in context.
            </p>
          </div>
          <PreviewAsMemberSelect value={target} onChange={setPreviewTarget} assignees={assignees} />
          {resolved && (
            <p className="text-sm text-neutral" aria-live="polite">
              {resolved.targetLabel} gets <span className="font-medium">{describeResolution(resolved)}</span>.
            </p>
          )}
        </div>
        {resolved && <TokenBudgetView budget={computeTokenBudget(resolved.preset)} />}
      </Section>
    </div>
  )
}

export function SettingsSkillPresets() {
  const { organizationId = '' } = useParams({ strict: false })
  useDocumentTitle('Skill presets - Organization settings')

  return (
    <SkillPresetsLayout activeTab="presets">
      <PresetsContent organizationId={organizationId} />
    </SkillPresetsLayout>
  )
}
