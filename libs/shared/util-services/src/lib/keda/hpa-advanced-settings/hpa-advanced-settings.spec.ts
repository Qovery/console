import { buildHpaAdvancedSettingsPayload, loadHpaSettingsFromAdvancedSettings } from './hpa-advanced-settings'

describe('hpa-advanced-settings', () => {
  describe('loadHpaSettingsFromAdvancedSettings', () => {
    it('should load CPU-only settings', () => {
      const advancedSettings = {
        'hpa.cpu.average_utilization_percent': 75,
      }

      const result = loadHpaSettingsFromAdvancedSettings(advancedSettings)

      expect(result).toEqual({
        hpa_metric_type: 'CPU',
        hpa_cpu_average_utilization_percent: 75,
        hpa_memory_average_utilization_percent: 60,
      })
    })

    it('should load CPU+Memory settings', () => {
      const advancedSettings = {
        'hpa.cpu.average_utilization_percent': 70,
        'hpa.memory.average_utilization_percent': 80,
      }

      const result = loadHpaSettingsFromAdvancedSettings(advancedSettings)

      expect(result).toEqual({
        hpa_metric_type: 'CPU_AND_MEMORY',
        hpa_cpu_average_utilization_percent: 70,
        hpa_memory_average_utilization_percent: 80,
      })
    })

    it('should use default values when settings are undefined', () => {
      const result = loadHpaSettingsFromAdvancedSettings(undefined)

      expect(result).toEqual({
        hpa_metric_type: 'CPU',
        hpa_cpu_average_utilization_percent: 60,
        hpa_memory_average_utilization_percent: 60,
      })
    })

    it('should use default values when settings are empty', () => {
      const result = loadHpaSettingsFromAdvancedSettings({})

      expect(result).toEqual({
        hpa_metric_type: 'CPU',
        hpa_cpu_average_utilization_percent: 60,
        hpa_memory_average_utilization_percent: 60,
      })
    })
  })

  describe('buildHpaAdvancedSettingsPayload', () => {
    it('should build payload for CPU-only metric', () => {
      const formData = {
        hpa_metric_type: 'CPU',
        hpa_cpu_average_utilization_percent: 75,
        hpa_memory_average_utilization_percent: 80,
      }

      const currentSettings = {
        'deployment.termination_grace_period_seconds': 30,
        'hpa.cpu.average_utilization_percent': 60,
      }

      const result = buildHpaAdvancedSettingsPayload(formData, currentSettings)

      expect(result).toEqual({
        'deployment.termination_grace_period_seconds': 30,
        'hpa.cpu.average_utilization_percent': 75,
        'hpa.memory.average_utilization_percent': null,
      })
    })

    it('should build payload for CPU+Memory metric', () => {
      const formData = {
        hpa_metric_type: 'CPU_AND_MEMORY',
        hpa_cpu_average_utilization_percent: 70,
        hpa_memory_average_utilization_percent: 85,
      }

      const currentSettings = {
        'deployment.termination_grace_period_seconds': 30,
        'hpa.cpu.average_utilization_percent': 60,
        'hpa.memory.average_utilization_percent': null,
      }

      const result = buildHpaAdvancedSettingsPayload(formData, currentSettings)

      expect(result).toEqual({
        'deployment.termination_grace_period_seconds': 30,
        'hpa.cpu.average_utilization_percent': 70,
        'hpa.memory.average_utilization_percent': 85,
      })
    })

    it('should not echo build settings from current settings', () => {
      const formData = {
        hpa_metric_type: 'CPU',
        hpa_cpu_average_utilization_percent: 75,
      }

      const currentSettings = {
        'build.timeout_max_sec': 1800,
        'build.cpu_max_in_milli': 4000,
        'build.ram_max_in_gib': 8,
        'build.ephemeral_storage_in_gib': 20,
        'build.disable_buildkit_cache': false,
        'build.skip_git_submodules': false,
        'deployment.termination_grace_period_seconds': 30,
        'hpa.cpu.average_utilization_percent': 60,
      }

      const result = buildHpaAdvancedSettingsPayload(formData, currentSettings)

      expect(result).toEqual({
        'deployment.termination_grace_period_seconds': 30,
        'hpa.cpu.average_utilization_percent': 75,
        'hpa.memory.average_utilization_percent': null,
      })
    })

    it('should use default CPU value when not provided', () => {
      const formData = {
        hpa_metric_type: 'CPU',
        hpa_cpu_average_utilization_percent: '',
      }

      const currentSettings = {}

      const result = buildHpaAdvancedSettingsPayload(formData, currentSettings)

      expect(result['hpa.cpu.average_utilization_percent']).toBe(60)
    })

    it('should use default Memory value when not provided', () => {
      const formData = {
        hpa_metric_type: 'CPU_AND_MEMORY',
        hpa_cpu_average_utilization_percent: 75,
        hpa_memory_average_utilization_percent: '',
      }

      const currentSettings = {}

      const result = buildHpaAdvancedSettingsPayload(formData, currentSettings)

      expect(result['hpa.memory.average_utilization_percent']).toBe(60)
    })
  })
})
