import { ProbeTypeEnum } from '@qovery/shared/enums'
import { buildHealthchecksPayload, getProbeType } from './healthchecks-utils'

describe('application-container-healthchecks-utils', () => {
  it('returns NONE when probe type is empty', () => {
    expect(getProbeType()).toBe(ProbeTypeEnum.NONE)
  })

  it('builds healthchecks payload', () => {
    const result = buildHealthchecksPayload(
      {
        readiness_probe: {
          current_type: ProbeTypeEnum.HTTP,
          initial_delay_seconds: 30,
          period_seconds: 10,
          timeout_seconds: 1,
          success_threshold: 1,
          failure_threshold: 3,
          type: {
            http: {
              port: 8080,
              path: '/ready',
            },
          },
        },
      },
      8080
    )

    expect(result).toEqual({
      typeReadiness: ProbeTypeEnum.HTTP,
      typeLiveness: ProbeTypeEnum.NONE,
      item: {
        readiness_probe: {
          type: {
            http: {
              port: 8080,
              path: '/ready',
              scheme: 'HTTP',
            },
          },
          initial_delay_seconds: 30,
          period_seconds: 10,
          timeout_seconds: 1,
          success_threshold: 1,
          failure_threshold: 3,
        },
        liveness_probe: undefined,
      },
    })
  })
})
