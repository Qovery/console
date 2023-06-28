import { render } from '__tests__/utils/setup-jest'
import { PortProtocolEnum } from 'qovery-typescript-axios'
import { applicationFactoryMock } from '@qovery/shared/factories'
import PageSettingsPortsFeature, { deletePort, removePortFromProbes } from './page-settings-ports-feature'

const application = applicationFactoryMock(1)[0]
describe('PageSettingsPortsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsPortsFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should have a delete port function', () => {
    application.ports = [
      {
        id: '1',
        external_port: 30,
        internal_port: 30,
        publicly_accessible: true,
        protocol: PortProtocolEnum.HTTP,
      },
    ]

    const cloneApplication = deletePort(application, '1')
    expect(cloneApplication.ports).toStrictEqual([])
  })

  it('should remove probes if port is on the healthchecks', () => {
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

    const port = 8080

    const expectedApplication = {
      liveness_probe: undefined,
      readiness_probe: {
        type: {
          grpc: { port: 8082 },
        },
      },
    }

    const result = removePortFromProbes(application, port)

    expect(result.healthchecks).toEqual(expectedApplication)
  })
})
