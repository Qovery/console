import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { SecurityFindingsSummary } from './security-findings-summary'

const finding = (line: number, ruleId: string, source: 'RULES' | 'MODEL' = 'RULES') => ({
  source,
  rule_id: ruleId,
  location: 'team context',
  line,
  reason: 'Reads like an instruction',
})

describe('SecurityFindingsSummary', () => {
  it('counts a line once, however many checks it fails', () => {
    renderWithProviders(
      <SecurityFindingsSummary
        findings={[finding(1, 'dump-secrets'), finding(1, 'data-exfiltration', 'MODEL'), finding(4, 'dump-secrets')]}
      />
    )

    expect(screen.getByText('Not saved: 2 lines need a change')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })
})
