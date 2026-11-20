import { type SkillPresetFinding } from '@qovery/domains/skill-presets/data-access'
import { Badge, Icon } from '@qovery/shared/ui'
import { findingSourceLabel } from '../utils/skill-preset-findings'

/** "Rule check" or "Model review": the icon and the words carry the meaning, not the color. */
export function FindingSourceLabel({ finding }: { finding: SkillPresetFinding }) {
  return (
    <Badge variant="outline" size="sm" className="gap-1 align-middle">
      <Icon iconName={finding.source === 'MODEL' ? 'sparkles' : 'list-check'} iconStyle="regular" aria-hidden="true" />
      {findingSourceLabel(finding)}
    </Badge>
  )
}
