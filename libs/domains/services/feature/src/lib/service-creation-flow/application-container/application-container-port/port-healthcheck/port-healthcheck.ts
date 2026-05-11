import { type ProbeType } from 'qovery-typescript-axios'
import { type PortData } from '@qovery/shared/interfaces'

const extractProtocol = (probeType: ProbeType | undefined = {}) =>
  (Object.keys(probeType) as Array<keyof typeof probeType>).find((key) => !!probeType[key])?.toUpperCase()

const extractPort = (probeType: ProbeType | undefined, protocol: string | undefined) => {
  if (probeType && protocol) {
    const normalizedProbeType = probeType[protocol.toLowerCase() as keyof ProbeType]

    if (normalizedProbeType && 'port' in normalizedProbeType) {
      return normalizedProbeType.port
    }
  }

  return undefined
}

export const isMatchingHealthCheck = (port?: PortData, probeType?: ProbeType) => {
  if (!port) {
    return false
  }

  const healthCheckProtocol = extractProtocol(probeType)
  const healthCheckPort = extractPort(probeType, healthCheckProtocol)

  return healthCheckPort === port.application_port
}
