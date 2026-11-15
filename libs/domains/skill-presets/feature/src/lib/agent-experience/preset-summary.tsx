import { useParams } from '@tanstack/react-router'
import { Icon, Link, Skeleton } from '@qovery/shared/ui'
import { useResolvedSkillPreset } from '../hooks/use-resolved-skill-preset/use-resolved-skill-preset'

/**
 * What the caller's agent receives from the organization: the preset that applies to them, or the
 * Qovery skills as published. Any member can read it.
 */
export function PresetSummary() {
  const { organizationId = '' } = useParams({ strict: false })
  const { data, isLoading, error } = useResolvedSkillPreset({ organizationId })

  if (isLoading) return <Skeleton height={40} className="w-full" show />
  if (error || !data) {
    return <p className="text-sm text-neutral-subtle">What your agent receives could not be loaded.</p>
  }

  const preset = data.skill_preset
  // The manifest lists only the skills the preset changes, adds or turns off.
  const changed = preset?.skills.length ?? 0
  return (
    <div className="flex flex-col gap-2 text-sm text-neutral" data-testid="preset-summary">
      {preset ? (
        <p>
          Your agent gets the <span className="font-medium">{preset.name}</span> preset: the{' '}
          {preset.base === 'QOVERY_LEAN' ? 'lean' : 'full'} Qovery skills
          {changed > 0 ? `, with ${changed} changed, added or turned off by your organization` : ''}
          {preset.team_context ? ', and your team’s instructions' : ''}.
        </p>
      ) : (
        <p>No preset applies to you: your agent gets the Qovery skills as published.</p>
      )}
      <Link
        to="/organization/$organizationId/agent-experience/skill-presets"
        params={{ organizationId }}
        color="brand"
        size="sm"
        className="inline-flex w-fit items-center gap-1"
      >
        See what your agent receives
        <Icon iconName="arrow-right" iconStyle="regular" />
      </Link>
    </div>
  )
}
