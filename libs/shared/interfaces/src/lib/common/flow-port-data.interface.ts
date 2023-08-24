import { type PortProtocolEnum, type Probe } from 'qovery-typescript-axios'

export interface PortData {
  application_port?: number
  external_port?: number
  is_public: boolean
  protocol: PortProtocolEnum
  name: string
}

export type ProbeExtended = Probe & {
  current_type?: string
}

export interface HealthcheckData {
  readiness_probe?: ProbeExtended
  liveness_probe?: ProbeExtended
}

export interface FlowPortData {
  ports?: PortData[]
  healthchecks?: {
    typeLiveness?: string
    typeReadiness?: string
    item?: HealthcheckData
  }
}
