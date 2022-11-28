export interface PortData {
  application_port: number | undefined
  external_port: number | undefined
  is_public: boolean
}

export interface FlowPortData {
  ports: PortData[]
}
