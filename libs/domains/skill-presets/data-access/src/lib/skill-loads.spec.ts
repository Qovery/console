import { parseSkillLoadChange, toSkillLoadPage } from './skill-loads'

describe('skill loads', () => {
  it('parses the change of a load entry, and ignores anything else', () => {
    const load = { skill_name: 'qovery-deploy', source: 'PRESET', from_cache: false }
    expect(parseSkillLoadChange(JSON.stringify(load))).toEqual(load)
    expect(parseSkillLoadChange('{"skill_name": 3}')).toBeNull()
    expect(parseSkillLoadChange('not json')).toBeNull()
    expect(parseSkillLoadChange(null)).toBeNull()
  })

  it('turns a page of audit entries into rows and cursors', () => {
    const page = toSkillLoadPage({
      events: [{ id: 'e1', change: '{"skill_name":"qovery","source":"PRESET","from_cache":true}' }],
      links: { next: '/events?continueToken=abc', previous: '/events?stepBackToken=xyz' },
    } as never)
    expect(page.rows[0].load?.skill_name).toBe('qovery')
    expect(page.nextToken).toBe('abc')
    expect(page.previousToken).toBe('xyz')
    expect(toSkillLoadPage({} as never)).toEqual({ rows: [], nextToken: null, previousToken: null })
  })
})
