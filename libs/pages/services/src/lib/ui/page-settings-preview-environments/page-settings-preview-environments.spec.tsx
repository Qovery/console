import { render } from '__tests__/utils/setup-jest'
import PageSettingsPreviewEnvironments, {
  PageSettingsPreviewEnvironmentsProps,
} from './page-settings-preview-environments'

const props: PageSettingsPreviewEnvironmentsProps = {
  deleteEnvironment: jest.fn(),
}

describe('PageSettingsPreviewEnvironments', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsPreviewEnvironments {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
