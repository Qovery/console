import { applicationDeploymentsFactoryMock } from '@console/domains/application'
import { render } from '__tests__/utils/setup-jest'
import PageSettingsPreviewEnvironments, {
  PageSettingsPreviewEnvironmentsProps,
} from './page-settings-preview-environments'

const props: PageSettingsPreviewEnvironmentsProps = {
  onSubmit: jest.fn(),
  applications: applicationDeploymentsFactoryMock(3),
}

describe('PageSettingsPreviewEnvironments', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsPreviewEnvironments {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
