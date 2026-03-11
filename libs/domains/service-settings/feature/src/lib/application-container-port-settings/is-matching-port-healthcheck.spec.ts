import { PortProtocolEnum, type ProbeType, type ServicePort } from 'qovery-typescript-axios'
import { isMatchingPortHealthCheck } from './port-healthcheck'

describe('isMatchingPortHealthCheck', () => {
  const port: ServicePort = {
    id: 'port-1',
    protocol: PortProtocolEnum.HTTP,
    internal_port: 8080,
    external_port: 443,
    publicly_accessible: true,
    name: 'http',
    public_domain: 'http.qovery.app',
    namespace: 'default',
  }

  it('returns true when probe targets the same port', () => {
    const probeType: ProbeType = {
      http: {
        path: '/',
        scheme: 'HTTP',
        port: 8080,
      },
    }

    expect(isMatchingPortHealthCheck(port, probeType)).toBe(true)
  })

  it('returns false when probe targets another port', () => {
    const probeType: ProbeType = {
      tcp: {
        host: null,
        port: 8081,
      },
    }

    expect(isMatchingPortHealthCheck(port, probeType)).toBe(false)
  })
})
