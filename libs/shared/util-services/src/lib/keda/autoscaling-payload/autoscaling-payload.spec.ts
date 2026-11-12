import { type AutoscalingPolicyResponse } from 'qovery-typescript-axios'
import {
  buildAutoscalingRequestFromForm,
  convertAutoscalingResponseToRequest,
  extractAndProcessAutoscaling,
  toKedaScaledObjectSettingsFields,
  toKedaScaledObjectSettingsPayload,
  validateInitialCooldownPeriod,
} from './autoscaling-payload'

const NO_SCALED_OBJECT_SETTINGS_FIELDS = {
  autoscaling_initial_cooldown_period: null,
  autoscaling_idle_scale_to_zero: null,
  autoscaling_advanced_enabled: null,
  autoscaling_advanced_yaml: null,
}

describe('autoscaling-payload', () => {
  describe('convertAutoscalingResponseToRequest', () => {
    it('should convert KEDA response to request format', () => {
      const response = {
        mode: 'KEDA',
        polling_interval_seconds: 30,
        cooldown_period_seconds: 300,
        initial_cooldown_period_seconds: 120,
        idle_replica_count: 0,
        advanced_yaml: 'restoreToOriginalReplicaCount: true',
        scalers: [
          {
            scaler_type: 'cpu',
            enabled: true,
            role: 'PRIMARY',
            config_yaml: 'type: cpu',
            trigger_authentication: {
              name: 'auth1',
              config_yaml: 'secretTargetRef: []',
            },
          },
        ],
      } as unknown as AutoscalingPolicyResponse

      const result = convertAutoscalingResponseToRequest(response)

      expect(result).toEqual({
        mode: 'KEDA',
        polling_interval_seconds: 30,
        cooldown_period_seconds: 300,
        initial_cooldown_period_seconds: 120,
        idle_replica_count: 0,
        advanced_yaml: 'restoreToOriginalReplicaCount: true',
        scalers: [
          {
            scaler_type: 'cpu',
            enabled: true,
            role: 'PRIMARY',
            config_yaml: 'type: cpu',
            trigger_authentication: {
              name: 'auth1',
              config_yaml: 'secretTargetRef: []',
            },
          },
        ],
      })
    })

    it('should handle HPA mode', () => {
      const response = {
        mode: 'HPA',
      } as unknown as AutoscalingPolicyResponse

      const result = convertAutoscalingResponseToRequest(response)

      expect(result).toMatchObject({
        mode: 'HPA',
      })
    })

    it('should return undefined for null input', () => {
      const result = convertAutoscalingResponseToRequest(undefined)

      expect(result).toBeUndefined()
    })

    it('should handle empty scalers array', () => {
      const response = {
        mode: 'KEDA',
        scalers: [],
      } as unknown as AutoscalingPolicyResponse

      const result = convertAutoscalingResponseToRequest(response)

      expect(result).toMatchObject({
        mode: 'KEDA',
        scalers: [],
      })
    })

    it('should handle scaler without trigger authentication', () => {
      const response = {
        mode: 'KEDA',
        scalers: [
          {
            scaler_type: 'cpu',
            enabled: true,
            role: 'PRIMARY',
            config_yaml: 'type: cpu',
          },
        ],
      } as unknown as AutoscalingPolicyResponse

      const result = convertAutoscalingResponseToRequest(response)

      expect(result?.scalers?.[0]?.trigger_authentication).toBeUndefined()
    })
  })

  describe('extractAndProcessAutoscaling', () => {
    it('should extract KEDA autoscaling from request', () => {
      const request: Record<string, unknown> = {
        memory: 512,
        cpu: 250,
        scalers: [
          {
            type: 'cpu',
            config: 'type: cpu',
            trigger_authentication: { name: 'auth1', config_yaml: 'secretTargetRef: []' },
          },
        ],
        autoscaling_polling_interval: 30,
        autoscaling_cooldown_period: 300,
        autoscaling_mode: 'KEDA',
      }

      const existingAutoscaling = {
        mode: 'KEDA',
      } as unknown as AutoscalingPolicyResponse

      const result = extractAndProcessAutoscaling(request, existingAutoscaling)

      expect(result.autoscaling).toEqual({
        mode: 'KEDA',
        polling_interval_seconds: 30,
        cooldown_period_seconds: 300,
        initial_cooldown_period_seconds: null,
        idle_replica_count: null,
        advanced_yaml: null,
        scalers: [
          {
            scaler_type: 'cpu',
            enabled: true,
            role: 'PRIMARY',
            config_yaml: 'type: cpu',
            trigger_authentication: {
              name: 'auth1',
              config_yaml: 'secretTargetRef: []',
            },
          },
        ],
      })

      expect(result.cleanedRequest).toEqual({
        memory: 512,
        cpu: 250,
      })
    })

    it('should handle HPA mode', () => {
      const request: Record<string, unknown> = {
        memory: 512,
        cpu: 250,
        autoscaling_mode: 'HPA',
      }

      const result = extractAndProcessAutoscaling(request, undefined)

      expect(result.autoscaling).toBeUndefined()
      expect(result.cleanedRequest).toEqual({
        memory: 512,
        cpu: 250,
      })
    })

    it('should handle NONE mode', () => {
      const request: Record<string, unknown> = {
        memory: 512,
        cpu: 250,
        autoscaling_mode: 'NONE',
      }

      const result = extractAndProcessAutoscaling(request, undefined)

      expect(result.autoscaling).toBeUndefined()
      expect(result.cleanedRequest).toEqual({
        memory: 512,
        cpu: 250,
      })
    })

    it('should remove KEDA fields from cleaned request', () => {
      const request: Record<string, unknown> = {
        memory: 512,
        cpu: 250,
        scalers: [{ type: 'cpu', config: 'type: cpu' }],
        autoscaling_polling_interval: 30,
        autoscaling_cooldown_period: 300,
        autoscaling_mode: 'KEDA',
      }

      const result = extractAndProcessAutoscaling(request, undefined)
      const cleaned = result.cleanedRequest as Record<string, unknown>

      expect(cleaned['scalers']).toBeUndefined()
      expect(cleaned['autoscaling_polling_interval']).toBeUndefined()
      expect(cleaned['autoscaling_cooldown_period']).toBeUndefined()
      expect(cleaned['autoscaling_mode']).toBeUndefined()
    })
  })

  describe('KEDA scaler config format', () => {
    const buildRequest = (scaler: Record<string, unknown>) => ({
      scalers: [{ type: 'prometheus', ...scaler }],
      autoscaling_mode: 'KEDA',
    })

    it('should send JSON-based scalers back as config_json', () => {
      const result = extractAndProcessAutoscaling(
        buildRequest({ config: '{\n  "threshold": "100"\n}', configFormat: 'json' })
      )

      expect(result.autoscaling?.scalers[0]).toMatchObject({ config_json: { threshold: '100' } })
      expect(result.autoscaling?.scalers[0].config_yaml).toBeUndefined()
    })

    it('should fall back to config_yaml when a JSON-based scaler is no longer valid JSON', () => {
      const result = extractAndProcessAutoscaling(buildRequest({ config: 'threshold: "100"', configFormat: 'json' }))

      expect(result.autoscaling?.scalers[0]).toMatchObject({ config_yaml: 'threshold: "100"' })
      expect(result.autoscaling?.scalers[0].config_json).toBeUndefined()
    })

    it.each([['["100"]'], ['null'], ['"100"']])(
      'should fall back to config_yaml when a JSON-based scaler is valid JSON but not an object (%s)',
      (config) => {
        const result = extractAndProcessAutoscaling(buildRequest({ config, configFormat: 'json' }))

        expect(result.autoscaling?.scalers[0]).toMatchObject({ config_yaml: config })
        expect(result.autoscaling?.scalers[0].config_json).toBeUndefined()
      }
    )

    it('should send YAML-based scalers as config_yaml', () => {
      const result = extractAndProcessAutoscaling(buildRequest({ config: 'threshold: "100"', configFormat: 'yaml' }))

      expect(result.autoscaling?.scalers[0]).toMatchObject({ config_yaml: 'threshold: "100"' })
      expect(result.autoscaling?.scalers[0].config_json).toBeUndefined()
    })

    it('should keep configFormat when building the form request', () => {
      const result = buildAutoscalingRequestFromForm(
        {
          autoscaling_mode: 'KEDA',
          scalers: [{ type: 'prometheus', config: '{}', configFormat: 'json' }],
        },
        { memory: 512, cpu: 250, gpu: 0 }
      )

      expect(result['scalers']).toEqual([{ type: 'prometheus', config: '{}', configFormat: 'json' }])
    })
  })

  describe('KEDA scaler id', () => {
    const response = {
      mode: 'KEDA',
      polling_interval_seconds: 30,
      cooldown_period_seconds: 300,
      scalers: [
        {
          id: 'scaler-1',
          scaler_type: 'prometheus',
          enabled: true,
          role: 'PRIMARY',
          config_yaml: 'threshold: "100"',
          trigger_authentication: { config_yaml: 'secretTargetRef: []' },
        },
        {
          id: 'scaler-2',
          scaler_type: 'cpu',
          enabled: true,
          role: 'SAFETY',
          config_yaml: 'value: "80"',
        },
      ],
    } as unknown as AutoscalingPolicyResponse

    it('should keep each scaler id when converting the response to a request', () => {
      const result = convertAutoscalingResponseToRequest(response)

      expect(result?.scalers.map((scaler) => scaler.id)).toEqual(['scaler-1', 'scaler-2'])
    })

    it('should keep each scaler id when other service settings are saved', () => {
      const result = extractAndProcessAutoscaling({ name: 'my-app' }, response)

      expect(result.autoscaling?.scalers.map((scaler) => scaler.id)).toEqual(['scaler-1', 'scaler-2'])
    })

    it('should send the id of an edited scaler, no id for a new one and drop a removed one', () => {
      const formRequest = buildAutoscalingRequestFromForm(
        {
          autoscaling_mode: 'KEDA',
          scalers: [
            {
              id: 'scaler-1',
              type: 'prometheus',
              config: 'threshold: "200"',
              configFormat: 'yaml',
              triggerAuthentication: 'secretTargetRef: []',
            },
            { type: 'memory', config: 'value: "70"', configFormat: 'yaml', triggerAuthentication: '' },
          ],
        },
        { memory: 512, cpu: 250, gpu: 0 }
      )

      const result = extractAndProcessAutoscaling(formRequest, response)

      expect(result.autoscaling?.scalers).toEqual([
        {
          id: 'scaler-1',
          scaler_type: 'prometheus',
          enabled: true,
          role: 'PRIMARY',
          config_yaml: 'threshold: "200"',
          trigger_authentication: { config_yaml: 'secretTargetRef: []' },
        },
        {
          scaler_type: 'memory',
          enabled: true,
          role: 'SAFETY',
          config_yaml: 'value: "70"',
        },
      ])
      expect(result.autoscaling?.scalers[1].id).toBeUndefined()
    })
  })

  describe('buildAutoscalingRequestFromForm', () => {
    it('should build request for NONE mode', () => {
      const formData = {
        memory: 512,
        cpu: 250,
        autoscaling_mode: 'NONE',
        min_running_instances: 2,
        max_running_instances: 2,
      }

      const baseRequest = {
        memory: 512,
        cpu: 250,
        gpu: 0,
      }

      const result = buildAutoscalingRequestFromForm(formData, baseRequest)

      expect(result).toEqual({
        memory: 512,
        cpu: 250,
        gpu: 0,
        min_running_instances: 2,
        max_running_instances: 2,
        scalers: null,
        autoscaling_polling_interval: null,
        autoscaling_cooldown_period: null,
        ...NO_SCALED_OBJECT_SETTINGS_FIELDS,
        autoscaling_mode: 'NONE',
        hpa_metric_type: undefined,
        hpa_cpu_average_utilization_percent: undefined,
        hpa_memory_average_utilization_percent: undefined,
      })
    })

    it('should build request for HPA mode', () => {
      const formData = {
        memory: 512,
        cpu: 250,
        autoscaling_mode: 'HPA',
        min_running_instances: 1,
        max_running_instances: 5,
        hpa_cpu_average_utilization_percent: 70,
      }

      const baseRequest = {
        memory: 512,
        cpu: 250,
        gpu: 0,
      }

      const result = buildAutoscalingRequestFromForm(formData, baseRequest)

      expect(result).toEqual({
        memory: 512,
        cpu: 250,
        gpu: 0,
        min_running_instances: 1,
        max_running_instances: 5,
        scalers: null,
        autoscaling_polling_interval: null,
        autoscaling_cooldown_period: null,
        ...NO_SCALED_OBJECT_SETTINGS_FIELDS,
        autoscaling_mode: 'HPA',
        hpa_metric_type: 'CPU',
        hpa_cpu_average_utilization_percent: 70,
        hpa_memory_average_utilization_percent: undefined,
      })
    })

    it('should build request for KEDA mode', () => {
      const formData: Record<string, unknown> = {
        memory: 512,
        cpu: 250,
        autoscaling_mode: 'KEDA',
        min_running_instances: 1,
        max_running_instances: 10,
        scalers: [
          {
            type: 'cpu',
            config: 'type: cpu\nmetricType: Utilization',
            triggerAuthentication: 'secretTargetRef:\n  - parameter: key\n    name: secret',
          },
        ],
        autoscaling_polling_interval: 30,
        autoscaling_cooldown_period: 300,
      }

      const baseRequest = {
        memory: 512,
        cpu: 250,
        gpu: 0,
      }

      const result = buildAutoscalingRequestFromForm(formData, baseRequest)

      expect(result).toEqual({
        memory: 512,
        cpu: 250,
        gpu: 0,
        min_running_instances: 1,
        max_running_instances: 10,
        scalers: [
          {
            type: 'cpu',
            config: 'type: cpu\nmetricType: Utilization',
            trigger_authentication: {
              config_yaml: 'secretTargetRef:\n  - parameter: key\n    name: secret',
            },
          },
        ],
        autoscaling_polling_interval: 30,
        autoscaling_cooldown_period: 300,
        autoscaling_mode: 'KEDA',
        hpa_metric_type: undefined,
        hpa_cpu_average_utilization_percent: undefined,
        hpa_memory_average_utilization_percent: undefined,
      })
    })

    it('should handle KEDA mode with empty scalers', () => {
      const formData: Record<string, unknown> = {
        memory: 512,
        cpu: 250,
        autoscaling_mode: 'KEDA',
        min_running_instances: 1,
        max_running_instances: 10,
        scalers: [],
      }

      const baseRequest = {
        memory: 512,
        cpu: 250,
        gpu: 0,
      }

      const result = buildAutoscalingRequestFromForm(formData, baseRequest)
      const scalers = (result as Record<string, unknown>)['scalers'] as Array<unknown> | undefined

      expect(scalers).toEqual([])
    })

    it('should handle KEDA scaler without trigger authentication', () => {
      const formData: Record<string, unknown> = {
        memory: 512,
        cpu: 250,
        autoscaling_mode: 'KEDA',
        min_running_instances: 1,
        max_running_instances: 10,
        scalers: [
          {
            type: 'cpu',
            config: 'type: cpu',
            triggerAuthentication: '',
          },
        ],
      }

      const baseRequest = {
        memory: 512,
        cpu: 250,
        gpu: 0,
      }

      const result = buildAutoscalingRequestFromForm(formData, baseRequest)
      const scalers = (result as Record<string, unknown>)['scalers'] as
        | Array<{ trigger_authentication?: { config_yaml?: string; name?: string } }>
        | undefined

      expect(scalers?.[0]?.trigger_authentication).toBeUndefined()
    })

    it('should use default values for KEDA when not provided', () => {
      const formData: Record<string, unknown> = {
        memory: 512,
        cpu: 250,
        autoscaling_mode: 'KEDA',
        min_running_instances: 1,
        max_running_instances: 10,
        scalers: [],
      }

      const baseRequest = {
        memory: 512,
        cpu: 250,
        gpu: 0,
      }

      const result = buildAutoscalingRequestFromForm(formData, baseRequest)
      const resultRecord = result as Record<string, unknown>

      expect(resultRecord['autoscaling_polling_interval']).toBeUndefined()
      expect(resultRecord['autoscaling_cooldown_period']).toBeUndefined()
    })

    it('should include gpu in base request if provided', () => {
      const formData: Record<string, unknown> = {
        memory: 512,
        cpu: 250,
        gpu: 1,
        autoscaling_mode: 'NONE',
        min_running_instances: 1,
        max_running_instances: 1,
      }

      const baseRequest = {
        memory: 512,
        cpu: 250,
        gpu: 1,
      }

      const result = buildAutoscalingRequestFromForm(formData, baseRequest)
      const gpuValue = (result as Record<string, unknown>)['gpu']

      expect(gpuValue).toBe(1)
    })
  })

  describe('KEDA ScaledObject settings', () => {
    const advancedYaml =
      'horizontalPodAutoscalerConfig:\n  behavior:\n    scaleDown:\n      stabilizationWindowSeconds: 60'

    it('should send the ScaledObject settings set in the form', () => {
      const request = buildAutoscalingRequestFromForm(
        {
          autoscaling_mode: 'KEDA',
          min_running_instances: 1,
          max_running_instances: 10,
          scalers: [{ type: 'cpu', config: 'value: "70"' }],
          autoscaling_initial_cooldown_period: '0',
          autoscaling_idle_scale_to_zero: true,
          autoscaling_advanced_enabled: true,
          autoscaling_advanced_yaml: advancedYaml,
        },
        { memory: 512, cpu: 250, gpu: 0 }
      )

      const result = extractAndProcessAutoscaling(request)

      expect(result.autoscaling).toMatchObject({
        initial_cooldown_period_seconds: 0,
        idle_replica_count: 0,
        advanced_yaml: advancedYaml,
      })
      expect(result.cleanedRequest).toEqual({
        memory: 512,
        cpu: 250,
        gpu: 0,
        min_running_instances: 1,
        max_running_instances: 10,
        hpa_metric_type: undefined,
        hpa_cpu_average_utilization_percent: undefined,
        hpa_memory_average_utilization_percent: undefined,
      })
    })

    it('should keep the ScaledObject settings when the request does not change autoscaling', () => {
      const currentAutoscaling = {
        mode: 'KEDA',
        initial_cooldown_period_seconds: 120,
        idle_replica_count: 0,
        advanced_yaml: advancedYaml,
        scalers: [],
      } as unknown as AutoscalingPolicyResponse

      const result = extractAndProcessAutoscaling({ memory: 512 }, currentAutoscaling)

      expect(result.autoscaling).toMatchObject({
        initial_cooldown_period_seconds: 120,
        idle_replica_count: 0,
        advanced_yaml: advancedYaml,
      })
    })

    it('should not send the advanced YAML while its toggle is off', () => {
      expect(
        toKedaScaledObjectSettingsPayload({
          autoscaling_advanced_enabled: false,
          autoscaling_advanced_yaml: advancedYaml,
        })
      ).toEqual({ initial_cooldown_period_seconds: null, idle_replica_count: null, advanced_yaml: null })
    })

    it.each([[undefined], [null], ['']])('should send no initial cooldown period for %p', (value) => {
      expect(
        toKedaScaledObjectSettingsPayload({ autoscaling_initial_cooldown_period: value })
          .initial_cooldown_period_seconds
      ).toBeNull()
    })

    it.each([[undefined], [null], [''], [0], ['0'], ['120'], [3600]])(
      'should accept initial cooldown period %p',
      (value) => {
        expect(validateInitialCooldownPeriod(value)).toBe(true)
      }
    )

    it.each([['-1'], ['1.5'], ['3601'], ['abc']])('should reject initial cooldown period %p', (value) => {
      expect(validateInitialCooldownPeriod(value)).toBe('Must be a whole number of seconds between 0 and 3600')
    })

    it('should turn the advanced YAML toggle on only when the policy has advanced YAML', () => {
      expect(
        toKedaScaledObjectSettingsFields({
          initial_cooldown_period_seconds: 120,
          idle_replica_count: 0,
          advanced_yaml: advancedYaml,
        })
      ).toEqual({
        autoscaling_initial_cooldown_period: 120,
        autoscaling_idle_scale_to_zero: true,
        autoscaling_advanced_enabled: true,
        autoscaling_advanced_yaml: advancedYaml,
      })
      expect(toKedaScaledObjectSettingsFields(undefined)).toEqual({
        autoscaling_initial_cooldown_period: null,
        autoscaling_idle_scale_to_zero: false,
        autoscaling_advanced_enabled: false,
        autoscaling_advanced_yaml: '',
      })
    })
  })
})
