import { useParams } from '@tanstack/react-router'
import { useState } from 'react'
import { Heading, Section, Skeleton } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useSkillPresetAssignees } from '../hooks/use-skill-preset-assignees/use-skill-preset-assignees'
import { useSkillPresets } from '../hooks/use-skill-presets/use-skill-presets'
import { SkillPresetsLayout } from '../skill-presets-layout/skill-presets-layout'
import { PreviewAsMemberSelect } from '../token-budget/preview-as-member'
import { TokenBudgetView } from '../token-budget/token-budget-view'
import { describeResolution, previewTargets, resolvePreviewTarget } from '../utils/preview-target'
import { isTemplate } from '../utils/resolve-preset'
import { computeTokenBudget } from '../utils/token-budget'

/** Which preset a member or role gets, and what it costs their agent in context. */
function PreviewContent({ organizationId }: { organizationId: string }) {
  const { data: presets, isLoading } = useSkillPresets({ organizationId })
  const { data: assignees } = useSkillPresetAssignees({ organizationId })
  const [previewTarget, setPreviewTarget] = useState<string>('')

  if (isLoading) return <Skeleton height={240} className="w-full" show />

  const assigned = (presets ?? []).filter((preset) => !isTemplate(preset))
  const target = previewTarget || previewTargets(assignees)[0]?.value || ''
  const resolved = target ? resolvePreviewTarget(target, assigned, assignees) : null

  return (
    <Section
      aria-labelledby="preview-member-title"
      className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]"
      data-testid="skill-presets-preview"
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
  )
}

export function SkillPresetsPreview() {
  const { organizationId = '' } = useParams({ strict: false })
  useDocumentTitle('Preview - Skills Registry - Agents')

  return (
    <SkillPresetsLayout activeTab="preview">
      <PreviewContent organizationId={organizationId} />
    </SkillPresetsLayout>
  )
}
