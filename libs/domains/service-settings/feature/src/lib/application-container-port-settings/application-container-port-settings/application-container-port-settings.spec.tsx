import { PortProtocolEnum } from 'qovery-typescript-axios'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { deleteApplicationContainerPort, removePortFromProbes } from './application-container-port-settings'

describe('ApplicationContainerPortSettings helpers', () => {
  it('should remove a selected port', () => {
    const application = applicationFactoryMock(1)[0]
    application.ports = [
      {
        id: '1',
        external_port: 30,
        internal_port: 30,
        publicly_accessible: true,
        protocol: PortProtocolEnum.HTTP,
      },
    ]

    const cloneApplication = deleteApplicationContainerPort(application, '1')

    expect(cloneApplication.ports).toStrictEqual([])
  })

  it('should remove probes if they target the removed port', () => {
    const application = applicationFactoryMock(1)[0]
    application.healthchecks = {
      liveness_probe: {
        type: {
          tcp: { port: 8080 },
        },
      },
      readiness_probe: {
        type: {
          grpc: { port: 8082 },
        },
      },
    }

    const result = removePortFromProbes(application, 8080)

    expect(result.healthchecks).toEqual({
      liveness_probe: undefined,
      readiness_probe: {
        type: {
          grpc: { port: 8082 },
        },
      },
    })
  })
})
