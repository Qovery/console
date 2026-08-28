import { getServiceStepDurationSec, getServiceStepsDurationSec } from './service-step-metrics'

const nowMs = Date.parse('2026-08-28T13:30:00Z')

describe('getServiceStepDurationSec', () => {
  it('returns the recorded duration for a completed step', () => {
    const durationSec = getServiceStepDurationSec({ status: 'SUCCESS', duration_sec: 15 }, nowMs)

    expect(durationSec).toBe(15)
  })

  it('returns the elapsed duration for an ongoing step', () => {
    const durationSec = getServiceStepDurationSec(
      {
        status: 'ONGOING',
        duration_sec: 0,
        started_at: '2026-08-28T13:29:29.500Z',
      },
      nowMs
    )

    expect(durationSec).toBe(30)
  })

  it('returns the recorded duration when an ongoing step has no start time', () => {
    const durationSec = getServiceStepDurationSec({ status: 'ONGOING', duration_sec: 12 }, nowMs)

    expect(durationSec).toBe(12)
  })

  it('returns zero for an invalid start time', () => {
    const durationSec = getServiceStepDurationSec({ status: 'ONGOING', started_at: 'invalid' }, nowMs)

    expect(durationSec).toBe(0)
  })

  it('does not return a negative duration for a future start time', () => {
    const durationSec = getServiceStepDurationSec({ status: 'ONGOING', started_at: '2026-08-28T13:31:00Z' }, nowMs)

    expect(durationSec).toBe(0)
  })
})

describe('getServiceStepsDurationSec', () => {
  it('adds completed step durations to the elapsed ongoing step duration', () => {
    const durationSec = getServiceStepsDurationSec(
      [
        { status: 'SUCCESS', duration_sec: 2 },
        { status: 'SUCCESS', duration_sec: 15 },
        { status: 'ONGOING', duration_sec: 0, started_at: '2026-08-28T13:29:30Z' },
      ],
      nowMs
    )

    expect(durationSec).toBe(47)
  })

  it('returns zero for an empty step list', () => {
    expect(getServiceStepsDurationSec([], nowMs)).toBe(0)
  })
})
