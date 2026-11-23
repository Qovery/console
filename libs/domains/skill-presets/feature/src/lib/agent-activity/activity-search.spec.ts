import { activityWindowEnd } from './activity-search'

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
