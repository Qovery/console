import { type ProbeType, type ServicePort } from 'qovery-typescript-axios'

const extractProtocol = (probeType: ProbeType | undefined = {}) =>
  (Object.keys(probeType) as Array<keyof typeof probeType>).find((key) => Boolean(probeType[key]))?.toUpperCase()

const extractPort = (probeType: ProbeType | undefined, protocol: string | undefined) => {
  if (!probeType || !protocol) {
    return undefined
  }

  const normalizedProbeType = probeType[protocol.toLowerCase() as keyof ProbeType]
  if (normalizedProbeType && 'port' in normalizedProbeType) {
    return normalizedProbeType.port
  }

  return undefined
}

export const isMatchingPortHealthCheck = (port?: ServicePort, probeType?: ProbeType) => {
  if (!port) {
    return false
  }

  const healthCheckProtocol = extractProtocol(probeType)
  const healthCheckPort = extractPort(probeType, healthCheckProtocol)

  return healthCheckPort === port.internal_port
}
