import { ApplicationAdvancedSettings, ClusterAdvancedSettings, JobAdvancedSettings } from 'qovery-typescript-axios'

// We had to create this aggregation of interfaces because we treat job and application as the same object for simplification purpose ui side
// we have to omit both liveness and readiness probe type because they are not the same type in the two interfaces
// declaring again their type like we do below is one efficient workaround
export interface AdvancedSettings
  extends ClusterAdvancedSettings,
    Partial<ApplicationAdvancedSettings>,
    Partial<JobAdvancedSettings> {}
