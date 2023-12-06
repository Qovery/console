import { type ProbeType, type ServicePort } from 'qovery-typescript-axios'
import { type PortData } from '@qovery/shared/interfaces'

const extractProtocol = (obj: ProbeType | undefined = {}) =>
  (Object.keys(obj) as Array<keyof typeof obj>).find((key) => !!obj[key])?.toUpperCase()

const extractPort = (probType: ProbeType | undefined, protocol: string | undefined) => {
  if (probType && protocol) {
    const probeType = probType[protocol.toLowerCase() as keyof ProbeType]
    if (probeType && 'port' in probeType) {
      return probeType.port
    }
  }
  return undefined
}

function isPortData(port: PortData | ServicePort): port is PortData {
  return (port as PortData).application_port !== undefined
}

export const isMatchingHealthCheck = (port?: PortData | ServicePort, probType?: ProbeType) => {
  if (!port) {
    return false
  }
  const healthCheckProtocol = extractProtocol(probType)

  const healthCheckPort = extractPort(probType, healthCheckProtocol)

  if (port && isPortData(port)) {
    return healthCheckPort === port.application_port
  }

  return healthCheckPort === port.internal_port
}
