import { type SkillPresetFinding } from '@qovery/domains/skill-presets/data-access'
import { Callout, Icon } from '@qovery/shared/ui'
import { findingFieldId, findingLocationLabel, findingTarget } from '../utils/skill-preset-findings'

export interface SecurityFindingsSummaryProps {
  findings: SkillPresetFinding[]
}

const focusField = (finding: SkillPresetFinding) => {
  const target = findingTarget(finding.location)
  if (!target) return
  const field = document.getElementById(findingFieldId(target))
  field?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
  // Monaco renders a textarea for keyboard input: focus it so screen readers land in the field.
  const input = field?.querySelector<HTMLElement>('textarea, input')
  input?.focus({ preventScroll: true })
}

/**
 * Shown when q-core refuses a save (422). It names every line, never blames the admin, and explains
 * that nothing was saved.
 */
export function SecurityFindingsSummary({ findings }: SecurityFindingsSummaryProps) {
  const lineCount = findings.length

  return (
    <Callout.Root color="red" role="alert" aria-labelledby="skill-preset-findings-title">
      <Callout.Icon>
        <Icon iconName="shield-exclamation" iconStyle="regular" />
      </Callout.Icon>
      <Callout.Text>
        <Callout.TextHeading id="skill-preset-findings-title">
          Not saved: {lineCount === 1 ? '1 line needs' : `${lineCount} lines need`} a change
        </Callout.TextHeading>
        <Callout.TextDescription>
          <p className="mb-2">
            Everything in a preset runs in your members' agents, on their machines. Qovery checks it on save and refuses
            text that could expose secrets, send data out or act without the member knowing. This is often a pasted
            snippet or a phrase that reads like an instruction. Rephrase or remove these lines, then save again.
          </p>
          <ul className="flex flex-col gap-1">
            {findings.map((finding) => (
              <li key={`${finding.location}-${finding.line}-${finding.rule_id}`}>
                <button
                  type="button"
                  className="text-left font-medium text-neutral underline underline-offset-2 hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-strong"
                  onClick={() => focusField(finding)}
                >
                  {findingLocationLabel(finding)}
                </button>
                <span className="text-neutral-subtle">: {finding.reason}.</span>
              </li>
            ))}
          </ul>
        </Callout.TextDescription>
      </Callout.Text>
    </Callout.Root>
  )
}
