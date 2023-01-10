import { render } from '__tests__/utils/setup-jest'
import { applicationFactoryMock } from '@qovery/shared/factories'
import PageSettingsPortsFeature, { deletePort } from './page-settings-ports-feature'

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
      },
    ]

    const cloneApplication = deletePort(application, '1')
    expect(cloneApplication.ports).toStrictEqual([])
  })
})
