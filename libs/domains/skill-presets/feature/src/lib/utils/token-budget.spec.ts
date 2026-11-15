import { LOADER_SKILL_TOKENS, QOVERY_SKILL_SIZES, TODAY_ALWAYS_TOKENS, computeTokenBudget } from './token-budget'

describe('computeTokenBudget', () => {
  it('compares with today: all 11 descriptions always in context', () => {
    expect(TODAY_ALWAYS_TOKENS).toBe(1493)
    expect(computeTokenBudget(null).alwaysInContext.total).toBe(TODAY_ALWAYS_TOKENS)
  })

  it('counts the loader, the manifest, and per-skill costs with the team context', () => {
    const budget = computeTokenBudget({
      base: 'QOVERY_FULL',
      team_context: 'x'.repeat(400),
      skills: [
        { skill_name: 'qovery-deploy', mode: 'OVERLAY', content: 'y'.repeat(200) },
        { skill_name: 'qovery-assess', mode: 'DISABLE' },
        { skill_name: 'qovery-preview', mode: 'REPLACE', description: 'd'.repeat(40), content: 'z'.repeat(80) },
        { skill_name: 'release-checklist', mode: 'ADD', description: 'e'.repeat(80), content: 'w'.repeat(120) },
      ],
    })

    expect(budget.alwaysInContext.loader).toBe(LOADER_SKILL_TOKENS)
    // 40 for the list itself, then 40 per entry plus its description / 4
    expect(budget.alwaysInContext.manifest).toBe(40 + 40 + 40 + (40 + 10) + (40 + 20))
    expect(budget.disabled).toEqual(['qovery-assess'])
    const deploy = budget.onDemand.find(({ skillName }) => skillName === 'qovery-deploy')
    expect(deploy).toEqual(
      expect.objectContaining({
        qoveryTokens: QOVERY_SKILL_SIZES['qovery-deploy'].skillMd,
        organizationTokens: 50,
        teamContextTokens: 100,
      })
    )
    expect(budget.onDemand.find(({ skillName }) => skillName === 'qovery-preview')?.qoveryTokens).toBe(0)
    expect(budget.onDemand.find(({ skillName }) => skillName === 'release-checklist')?.total).toBe(130)
  })

  it('loads one lean skill on the lean base and nothing from Qovery on the empty base', () => {
    expect(computeTokenBudget({ base: 'QOVERY_LEAN', skills: [] }).onDemand.map(({ skillName }) => skillName)).toEqual([
      'qovery',
    ])
    expect(computeTokenBudget({ base: 'NONE', skills: [] }).onDemand).toEqual([])
  })
})
