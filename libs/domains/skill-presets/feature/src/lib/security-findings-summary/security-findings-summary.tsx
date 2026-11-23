import { type SkillPresetFinding } from '@qovery/domains/skill-presets/data-access'
import { Button, Callout, Icon } from '@qovery/shared/ui'
import { scrollToElement } from '@qovery/shared/util-js'
import { FindingSourceLabel } from '../finding-list/finding-source-label'
import { findingFieldId, findingLocationLabel, findingTarget } from '../utils/skill-preset-findings'

export interface SecurityFindingsSummaryProps {
  findings: SkillPresetFinding[]
}

const focusInside = (field: HTMLElement | null) => {
  scrollToElement(field)
  // Monaco renders a textarea for keyboard input: focus it so screen readers land in the field.
  field?.querySelector<HTMLElement>('textarea, input')?.focus({ preventScroll: true })
}

const focusField = (finding: SkillPresetFinding) => {
  const target = findingTarget(finding.location)
  if (!target) return
  const fieldId = findingFieldId(target)
  const field = document.getElementById(fieldId)
  const editSkill = field?.closest('li')?.querySelector<HTMLButtonElement>('[data-edit-skill]')
  if (!editSkill) {
    focusInside(field)
    return
  }
  // A custom skill is edited in a modal: open it, then focus the reported field once it renders.
  editSkill.click()
  const deadline = performance.now() + 2000
  const focusInModal = () => {
    const inModal = document.querySelector<HTMLElement>(`[role="dialog"] [id="${CSS.escape(fieldId)}"]`)
    if (inModal?.querySelector('textarea, input')) focusInside(inModal)
    else if (performance.now() < deadline) requestAnimationFrame(focusInModal)
  }
  requestAnimationFrame(focusInModal)
}

/**
 * Shown when q-core refuses a save (422). It names every line, never blames the admin, and explains
 * that nothing was saved.
 */
export function SecurityFindingsSummary({ findings }: SecurityFindingsSummaryProps) {
  // A line can break several rules, or a rule and the model review: count it once.
  const lineCount = new Set(findings.map(({ location, line }) => `${location}:${line}`)).size

  return (
    <Callout.Root color="red" role="alert" aria-labelledby="skill-preset-findings-title">
      <Callout.Icon>
        <Icon iconName="shield-exclamation" iconStyle="regular" />
      </Callout.Icon>
      <Callout.Text>
        <Callout.TextHeading id="skill-preset-findings-title">
          Not saved: {lineCount === 1 ? '1 line needs' : `${lineCount} lines need`} a change
        </Callout.TextHeading>
        <div className="text-sm text-neutral-subtle">
          <p className="mb-2">
            Everything in a preset runs in your members’ agents, on their machines. Every save is checked by rules and
            by a model review, which refuse text that could expose secrets, send data out or act without the member
            knowing. This is often a pasted snippet or a phrase that reads like an instruction. Rephrase or remove these
            lines, then save again.
          </p>
          <ul className="flex flex-col gap-1">
            {findings.map((finding) => (
              <li
                key={`${finding.source ?? 'RULES'}-${finding.location}-${finding.line}-${finding.rule_id}`}
                className="flex flex-wrap items-baseline gap-x-1.5"
              >
                <FindingSourceLabel finding={finding} />
                <Button
                  type="button"
                  variant="plain"
                  color="neutral"
                  size="xs"
                  className="h-auto px-0 align-baseline text-sm underline underline-offset-2"
                  onClick={() => focusField(finding)}
                >
                  {findingLocationLabel(finding)}
                </Button>
                <span className="text-neutral-subtle">: {finding.reason}.</span>
              </li>
            ))}
          </ul>
        </div>
      </Callout.Text>
    </Callout.Root>
  )
}
