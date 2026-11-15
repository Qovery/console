import { type SkillPresetFinding } from '@qovery/domains/skill-presets/data-access'
import { Icon } from '@qovery/shared/ui'

export interface FindingListProps {
  findings: SkillPresetFinding[]
  onSelectLine?: (line: number) => void
}

/** Findings of one field, worded so the line and the reason read without color. */
export function FindingList({ findings, onSelectLine }: FindingListProps) {
  return (
    <ul className="mt-1 flex flex-col gap-1" aria-label="Lines to fix">
      {findings.map((finding) => (
        <li key={`${finding.rule_id}-${finding.line}`} className="flex items-start gap-2 text-xs text-negative">
          <Icon iconName="shield-exclamation" iconStyle="regular" className="mt-0.5" aria-hidden="true" />
          <span>
            {onSelectLine ? (
              <button
                type="button"
                className="font-medium underline underline-offset-2 hover:no-underline"
                onClick={() => onSelectLine(finding.line)}
              >
                Line {finding.line}
              </button>
            ) : (
              <span className="font-medium">Line {finding.line}</span>
            )}
            : {finding.reason}. <span className="font-code text-neutral-subtle">{finding.rule_id}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

export default FindingList
