import {
  findingFieldId,
  findingKindLabel,
  findingLocationLabel,
  findingSourceLabel,
  findingTarget,
  findingsAsText,
  findingsFor,
} from './skill-preset-findings'

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

  it('matches a skill finding to its skill and field only', () => {
    const findings = [
      { rule_id: 'a', location: "content of skill 'x'", line: 1, reason: 'A' },
      { rule_id: 'b', location: "content of skill 'y'", line: 2, reason: 'B' },
      { rule_id: 'c', location: "description of skill 'x'", line: 3, reason: 'C' },
    ]
    expect(findingsFor(findings, { field: 'skillContent', skillName: 'x' }).map(({ rule_id }) => rule_id)).toEqual([
      'a',
    ])
    expect(findingsFor(findings, { field: 'skillDescription', skillName: 'x' }).map(({ rule_id }) => rule_id)).toEqual([
      'c',
    ])
    expect(findingsFor(findings, { field: 'skillContent', skillName: 'z' })).toEqual([])
  })

  it('builds DOM ids from any skill name', () => {
    expect(findingFieldId({ field: 'teamContext' })).toBe('skill-preset-field-teamContext')
    expect(findingFieldId({ field: 'skillContent', skillName: 'release.notes v2' })).toBe(
      'skill-preset-field-skillContent-release-notes-v2'
    )
  })

  it('names the source and lists findings as text', () => {
    const rule = { source: 'RULES' as const, rule_id: 'a', location: 'description', line: 1, reason: 'Prints a secret' }
    const model = { ...rule, source: 'MODEL' as const, line: 2, reason: 'Sends data out' }
    expect(findingSourceLabel(rule)).toBe('Rule check')
    expect(findingSourceLabel(model)).toBe('Model review')
    expect(findingsAsText([rule, model])).toBe(
      'Rule check, line 1: Prints a secret. Model review, line 2: Sends data out.'
    )
    expect(findingsAsText([])).toBeUndefined()
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
