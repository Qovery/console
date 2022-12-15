import { render } from '__tests__/utils/setup-jest'
import { applicationFactoryMock } from '@qovery/domains/application'
import PageSettingsConfigureFeature from './page-settings-configure-feature'

const application = applicationFactoryMock(1)[0]
describe('PageSettingsPortsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsConfigureFeature />)
    expect(baseElement).toBeTruthy()
  })
})
