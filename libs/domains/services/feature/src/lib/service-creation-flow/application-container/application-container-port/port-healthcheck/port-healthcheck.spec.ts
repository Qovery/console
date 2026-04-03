import { PortProtocolEnum, type ProbeType } from 'qovery-typescript-axios'
import { isMatchingHealthCheck } from './port-healthcheck'

describe('isMatchingHealthCheck', () => {
  it('should return false if port is undefined', () => {
    expect(isMatchingHealthCheck()).toBeFalsy()
  })

  it('should return false if probeType is undefined', () => {
    const port = {
      application_port: 123,
      is_public: false,
      protocol: PortProtocolEnum.HTTP,
      name: 'p123',
    }

    expect(isMatchingHealthCheck(port)).toBeFalsy()
  })

  it("should return false if port number doesn't match", () => {
    const port = {
      application_port: 124,
      is_public: false,
      protocol: PortProtocolEnum.HTTP,
      name: 'p123',
    }
    const probeType: ProbeType = {
      http: {
        port: 123,
      },
    }

    expect(isMatchingHealthCheck(port, probeType)).toBeFalsy()
  })

  it('should return true if port number and protocol match', () => {
    const port = {
      application_port: 123,
      is_public: false,
      protocol: PortProtocolEnum.HTTP,
      name: 'p123',
    }
    const probeType: ProbeType = {
      http: {
        port: 123,
      },
    }

    expect(isMatchingHealthCheck(port, probeType)).toBeTruthy()
  })
})
