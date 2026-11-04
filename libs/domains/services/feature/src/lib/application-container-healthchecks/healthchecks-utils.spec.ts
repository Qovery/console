import { renderHook } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { ProbeTypeEnum } from '@qovery/shared/enums'
import { type HealthcheckData } from '@qovery/shared/interfaces'
import {
  buildHealthchecksPayload,
  defaultStartupProbe,
  getProbeType,
  resetHealthchecksFormFromValue,
} from './healthchecks-utils'

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
      typeStartup: ProbeTypeEnum.NONE,
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
        startup_probe: undefined,
      },
    })
  })

  it('sends a startup probe only when a type is selected', () => {
    const startupProbe = {
      ...defaultStartupProbe,
      type: {
        tcp: {
          port: 8080,
        },
      },
    }

    expect(
      buildHealthchecksPayload({ startup_probe: { current_type: ProbeTypeEnum.NONE, ...startupProbe } }, 8080).item
        .startup_probe
    ).toBeUndefined()

    expect(
      buildHealthchecksPayload({ startup_probe: { current_type: ProbeTypeEnum.TCP, ...startupProbe } }, 8080)
    ).toEqual({
      typeReadiness: ProbeTypeEnum.NONE,
      typeLiveness: ProbeTypeEnum.NONE,
      typeStartup: ProbeTypeEnum.TCP,
      item: {
        readiness_probe: undefined,
        liveness_probe: undefined,
        startup_probe: {
          type: {
            tcp: {
              port: 8080,
            },
          },
          initial_delay_seconds: 10,
          period_seconds: 10,
          timeout_seconds: 5,
          success_threshold: 1,
          failure_threshold: 30,
        },
      },
    })
  })

  it('loads the startup probe of the service into the form', () => {
    const { result } = renderHook(() => useForm<HealthcheckData>())

    resetHealthchecksFormFromValue(result.current, {
      startup_probe: {
        type: {
          http: {
            port: 8080,
            path: '/started',
          },
        },
        initial_delay_seconds: 5,
        period_seconds: 3,
        timeout_seconds: 2,
        success_threshold: 1,
        failure_threshold: 40,
      },
    })

    expect(result.current.getValues('startup_probe')).toEqual({
      current_type: ProbeTypeEnum.HTTP,
      type: {
        http: {
          port: 8080,
          path: '/started',
        },
      },
      initial_delay_seconds: 5,
      period_seconds: 3,
      timeout_seconds: 2,
      success_threshold: 1,
      failure_threshold: 40,
    })
    expect(result.current.getValues('liveness_probe.current_type')).toBe(ProbeTypeEnum.NONE)
  })
})
