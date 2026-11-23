import {
  LOADER_SKILL_TOKENS,
  QOVERY_SKILL_SIZES,
  TODAY_ALWAYS_TOKENS,
  computeTokenBudget,
  computeTokenBudgetFromManifest,
} from './token-budget'

describe('computeTokenBudget', () => {
  it('compares with today: all 12 descriptions always in context', () => {
    expect(TODAY_ALWAYS_TOKENS).toBe(1689)
    expect(computeTokenBudget(null).alwaysInContext.total).toBe(TODAY_ALWAYS_TOKENS)
  })

  it('counts the loader, the manifest, and per-skill costs with the team context', () => {
    const budget = computeTokenBudget({
      base: 'FULL',
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

  it('counts Qovery skills the catalog does not know yet from the preset text', () => {
    const budget = computeTokenBudget({
      base: 'FULL',
      team_context: null,
      skills: [
        { skill_name: 'qovery-shipped-later', mode: 'OVERLAY', content: 'y'.repeat(200) },
        { skill_name: 'qovery-retired', mode: 'DISABLE' },
      ],
    })

    expect(budget.onDemand.find(({ skillName }) => skillName === 'qovery-shipped-later')).toEqual(
      expect.objectContaining({ qoveryTokens: 0, organizationTokens: 50, total: 50, todayTokens: null })
    )
    expect(budget.disabled).toEqual(['qovery-retired'])
  })

  it('loads one lean skill on the lean base and nothing from Qovery on the empty base', () => {
    expect(computeTokenBudget({ base: 'LEAN', skills: [] }).onDemand.map(({ skillName }) => skillName)).toEqual([
      'qovery',
    ])
    expect(computeTokenBudget({ base: 'NONE', skills: [] }).onDemand).toEqual([])
  })

  it('gives the same estimate from a resolved manifest as from the draft text', () => {
    const draft = {
      base: 'FULL' as const,
      team_context: 'x'.repeat(400),
      skills: [
        { skill_name: 'qovery-deploy', mode: 'OVERLAY' as const, content: 'y'.repeat(200) },
        { skill_name: 'qovery-assess', mode: 'DISABLE' as const },
      ],
    }
    const fromManifest = computeTokenBudgetFromManifest({
      source: 'ROLE',
      skill_preset: {
        id: 'preset-1',
        name: 'Backend team',
        base: 'FULL',
        revision: 2,
        updated_at: '2026-11-15T00:00:00Z',
        team_context: { approx_tokens: 100, sha256: 'a' },
        skills: [
          {
            skill_name: 'qovery-deploy',
            mode: 'OVERLAY',
            description: null,
            content: { approx_tokens: 50, sha256: 'b' },
          },
          { skill_name: 'qovery-assess', mode: 'DISABLE', description: null, content: null },
        ],
      },
    })
    expect(fromManifest).toEqual(computeTokenBudget(draft))
    expect(computeTokenBudgetFromManifest({ source: 'QOVERY_DEFAULT', skill_preset: null })).toEqual(
      computeTokenBudget(null)
    )
  })
})
