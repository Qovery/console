import { ProbeTypeEnum } from '@qovery/shared/enums'
import { formatHealthcheckProbe } from './format-healthcheck-probe'

describe('formatHealthcheckProbe', () => {
  it('returns undefined when no probe type is selected', () => {
    expect(formatHealthcheckProbe({}, 8080)).toBeUndefined()
  })

  it('formats an HTTP probe', () => {
    expect(
      formatHealthcheckProbe(
        {
          current_type: ProbeTypeEnum.HTTP,
          initial_delay_seconds: '30',
          period_seconds: '10',
          timeout_seconds: '5',
          success_threshold: '1',
          failure_threshold: '3',
          type: {
            http: {
              port: '8080',
              path: '/health',
            },
          },
        },
        80
      )
    ).toEqual({
      type: {
        http: {
          port: 8080,
          path: '/health',
          scheme: 'HTTP',
        },
      },
      initial_delay_seconds: 30,
      period_seconds: 10,
      timeout_seconds: 5,
      success_threshold: 1,
      failure_threshold: 3,
    })
  })
})
