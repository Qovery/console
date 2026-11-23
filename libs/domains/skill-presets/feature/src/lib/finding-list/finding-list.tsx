import { type SkillPresetFinding } from '@qovery/domains/skill-presets/data-access'
import { Button, Icon } from '@qovery/shared/ui'
import { findingKindLabel } from '../utils/skill-preset-findings'
import { FindingSourceLabel } from './finding-source-label'

export interface FindingListProps {
  findings: SkillPresetFinding[]
  onSelectLine?: (line: number) => void
}

/** Findings of one field, worded so the line and the reason read without color. */
export function FindingList({ findings, onSelectLine }: FindingListProps) {
  return (
    <ul className="mt-1 flex flex-col gap-1" aria-label="Lines to fix">
      {findings.map((finding) => (
        <li
          key={`${finding.source ?? 'RULES'}-${finding.rule_id}-${finding.line}`}
          className="flex items-start gap-2 text-xs text-negative"
        >
          <Icon iconName="shield-exclamation" iconStyle="regular" className="mt-0.5" aria-hidden="true" />
          <span className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <FindingSourceLabel finding={finding} />
            {onSelectLine ? (
              <Button
                type="button"
                variant="plain"
                color="current"
                size="xs"
                className="h-auto cursor-pointer px-0 align-baseline underline underline-offset-2"
                onClick={() => onSelectLine(finding.line)}
              >
                Line {finding.line}
              </Button>
            ) : (
              <span className="font-medium">Line {finding.line}</span>
            )}
            <span>
              : {finding.reason}.{' '}
              <span className={finding.source === 'MODEL' ? 'text-neutral-subtle' : 'font-code text-neutral-subtle'}>
                {findingKindLabel(finding)}
              </span>
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}
