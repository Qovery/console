import { DEFAULT_RANGE, activityRange, activitySearchSchema, activityWindowEnd } from './activity-search'

describe('activityWindowEnd', () => {
  afterEach(() => jest.useRealTimers())

  it('stays the same within a minute and moves forward after it', () => {
    jest.useFakeTimers({ now: new Date('2026-11-23T10:15:20Z') })
    const first = activityWindowEnd()
    expect(first.toISOString()).toBe('2026-11-23T10:16:00.000Z')

    jest.setSystemTime(new Date('2026-11-23T10:15:59Z'))
    expect(activityWindowEnd().toISOString()).toBe(first.toISOString())

    jest.setSystemTime(new Date('2026-11-23T10:16:01Z'))
    expect(activityWindowEnd().toISOString()).toBe('2026-11-23T10:17:00.000Z')
  })
})

describe('activityRange', () => {
  it('falls back to the default range for a missing or unknown value', () => {
    expect(activityRange({}).value).toBe(DEFAULT_RANGE)
    expect(activityRange({ range: 'forever' }).value).toBe(DEFAULT_RANGE)
    expect(activityRange({ range: '7d' }).value).toBe('7d')
  })
})

describe('activitySearchSchema', () => {
  it('keeps valid shared filters and discards invalid filters independently', () => {
    expect(
      activitySearchSchema.parse({
        range: 'forever',
        actor: 'token:invalid',
        skill: 'Invalid skill',
        outcome: 'DENIED',
        via: 'SKILL_LOAD',
        view: 'skill',
        page: '2',
      })
    ).toEqual({ outcome: 'DENIED', via: 'SKILL_LOAD', view: 'skill', page: 2 })
  })

  it('validates member and policy token links', () => {
    const member = 'member:auth0|1234'
    const token = 'token:3f1c9a2e-0000-4000-8000-00000000c1d0'
    expect(activitySearchSchema.parse({ actor: member }).actor).toBe(member)
    expect(activitySearchSchema.parse({ actor: token }).actor).toBe(token)
    expect(activitySearchSchema.parse({ actor: 'member:' }).actor).toBeUndefined()
    expect(activitySearchSchema.parse({ actor: ['members'] }).actor).toBeUndefined()
  })

  it('accepts skill names and clears the old filter for actions without a skill', () => {
    expect(activitySearchSchema.parse({ skill: 'qovery-deploy.v2' }).skill).toBe('qovery-deploy.v2')
    expect(activitySearchSchema.parse({ skill: 'none' }).skill).toBeUndefined()
  })
})
