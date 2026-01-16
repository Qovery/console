import { type AutoscalingPolicyResponse } from 'qovery-typescript-axios'
import {
  buildAutoscalingRequestFromForm,
  convertAutoscalingResponseToRequest,
  extractAndProcessAutoscaling,
} from './autoscaling-payload'

type TestAutoscalingRequest = {
  memory: number
  cpu: number
  gpu?: number
  scalers?: Array<{
    type: string
    config: string
    trigger_authentication?: { name?: string; config_yaml?: string }
    triggerAuthentication?: string
  }>
  autoscaling_polling_interval?: number
  autoscaling_cooldown_period?: number
  autoscaling_mode?: 'NONE' | 'HPA' | 'KEDA'
  hpa_cpu_average_utilization_percent?: number
  hpa_memory_average_utilization_percent?: number
  hpa_metric_type?: 'CPU' | 'CPU_AND_MEMORY'
} & Record<string, unknown>

describe('autoscaling-payload', () => {
  describe('convertAutoscalingResponseToRequest', () => {
    it('should convert KEDA response to request format', () => {
      const response = {
        mode: 'KEDA',
        polling_interval_seconds: 30,
        cooldown_period_seconds: 300,
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
      }

      const result = convertAutoscalingResponseToRequest(response as any)

      expect(result).toEqual({
        mode: 'KEDA',
        polling_interval_seconds: 30,
        cooldown_period_seconds: 300,
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
      }

      const result = convertAutoscalingResponseToRequest(response as any)

      expect(result).toMatchObject({
        mode: 'HPA',
      })
    })

    it('should return undefined for null input', () => {
      const result = convertAutoscalingResponseToRequest(null as any)

      expect(result).toBeUndefined()
    })

    it('should handle empty scalers array', () => {
      const response = {
        mode: 'KEDA',
        scalers: [],
      }

      const result = convertAutoscalingResponseToRequest(response as any)

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
      }

      const result = convertAutoscalingResponseToRequest(response as any)

      expect(result?.scalers?.[0]?.trigger_authentication).toBeUndefined()
    })
  })

  describe('extractAndProcessAutoscaling', () => {
    it('should extract KEDA autoscaling from request', () => {
      const request = {
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
      }

      const result = extractAndProcessAutoscaling(request as any, existingAutoscaling as any)

      expect(result.autoscaling).toEqual({
        mode: 'KEDA',
        polling_interval_seconds: 30,
        cooldown_period_seconds: 300,
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
      const request = {
        memory: 512,
        cpu: 250,
        autoscaling_mode: 'HPA',
      }

      const result = extractAndProcessAutoscaling(request as any, undefined)

      expect(result.autoscaling).toBeUndefined()
      expect(result.cleanedRequest).toEqual({
        memory: 512,
        cpu: 250,
      })
    })

    it('should handle NONE mode', () => {
      const request = {
        memory: 512,
        cpu: 250,
        autoscaling_mode: 'NONE',
      }

      const result = extractAndProcessAutoscaling(request as any, undefined)

      expect(result.autoscaling).toBeUndefined()
      expect(result.cleanedRequest).toEqual({
        memory: 512,
        cpu: 250,
      })
    })

    it('should remove KEDA fields from cleaned request', () => {
      const request = {
        memory: 512,
        cpu: 250,
        scalers: [{ type: 'cpu', config: 'type: cpu' }],
        autoscaling_polling_interval: 30,
        autoscaling_cooldown_period: 300,
        autoscaling_mode: 'KEDA',
      }

      const result = extractAndProcessAutoscaling(request as TestAutoscalingRequest, undefined)
      const cleaned = result.cleanedRequest as Record<string, unknown>

      expect(cleaned['scalers']).toBeUndefined()
      expect(cleaned['autoscaling_polling_interval']).toBeUndefined()
      expect(cleaned['autoscaling_cooldown_period']).toBeUndefined()
      expect(cleaned['autoscaling_mode']).toBeUndefined()
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
        autoscaling_mode: 'HPA',
        hpa_metric_type: 'CPU',
        hpa_cpu_average_utilization_percent: 70,
        hpa_memory_average_utilization_percent: undefined,
      })
    })

    it('should build request for KEDA mode', () => {
      const formData: any = {
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
      const formData: any = {
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
      const formData: any = {
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
      const formData: any = {
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
      const formData: any = {
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
})
