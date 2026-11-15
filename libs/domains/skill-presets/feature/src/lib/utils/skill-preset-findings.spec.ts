import { findingKindLabel, findingLocationLabel, findingTarget, findingsFor } from './skill-preset-findings'

describe('skill preset findings', () => {
  it('maps every location q-core sends to an editor field', () => {
    expect(findingTarget('description')).toEqual({ field: 'description' })
    expect(findingTarget('team context')).toEqual({ field: 'teamContext' })
    expect(findingTarget("description of skill 'release-checklist'")).toEqual({
      field: 'skillDescription',
      skillName: 'release-checklist',
    })
    expect(findingTarget("content of skill 'qovery-deploy'")).toEqual({
      field: 'skillContent',
      skillName: 'qovery-deploy',
    })
    expect(findingTarget('something else')).toBeNull()
  })

  it('selects and sorts the findings of one field', () => {
    const findings = [
      { rule_id: 'a', location: 'team context', line: 4, reason: 'A' },
      { rule_id: 'b', location: "content of skill 'x'", line: 1, reason: 'B' },
      { rule_id: 'c', location: 'team context', line: 2, reason: 'C' },
    ]
    expect(findingsFor(findings, { field: 'teamContext' }).map(({ line }) => line)).toEqual([2, 4])
  })

  it('labels a finding for the summary', () => {
    expect(findingLocationLabel({ rule_id: 'a', location: 'team context', line: 3, reason: 'A' })).toBe(
      'Team context, line 3'
    )
    expect(findingLocationLabel({ rule_id: 'a', location: "content of skill 'x'", line: 1, reason: 'A' })).toBe(
      'x, content, line 1'
    )
  })

  it('names model categories and keeps rule ids', () => {
    expect(
      findingKindLabel({
        source: 'MODEL',
        rule_id: 'data-exfiltration',
        location: 'team context',
        line: 1,
        reason: 'r',
      })
    ).toBe('Data exfiltration')
    expect(
      findingKindLabel({ source: 'RULES', rule_id: 'dump-secrets', location: 'team context', line: 1, reason: 'r' })
    ).toBe('dump-secrets')
  })
})
