import { ApplicationAdvancedSettings, JobAdvancedSettings } from 'qovery-typescript-axios'
import {
  ApplicationAdvancedSettingsLivenessProbeTypeEnum,
  ApplicationAdvancedSettingsReadinessProbeTypeEnum,
  JobAdvancedSettingsLivenessProbeTypeEnum,
  JobAdvancedSettingsReadinessProbeTypeEnum,
} from 'qovery-typescript-axios/api'

// We had to create this aggregation of interfaces because we treat job and application as the same object for simplification purpose ui side
// we have to omit both liveness and readiness probe type because they are not the same type in the two interfaces
// declaring again their type like we do below is one efficient workaround
export interface AdvancedSettings
  extends Omit<Partial<ApplicationAdvancedSettings>, 'liveness_probe.type' | 'readiness_probe.type'>,
    Omit<Partial<JobAdvancedSettings>, 'liveness_probe.type' | 'readiness_probe.type'> {
  'liveness_probe.type'?: JobAdvancedSettingsLivenessProbeTypeEnum | ApplicationAdvancedSettingsLivenessProbeTypeEnum
  'readiness_probe.type'?: JobAdvancedSettingsReadinessProbeTypeEnum | ApplicationAdvancedSettingsReadinessProbeTypeEnum
}
