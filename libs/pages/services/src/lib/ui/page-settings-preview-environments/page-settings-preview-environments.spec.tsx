import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { applicationFactoryMock } from '@console/domains/application'
import PageSettingsPreviewEnvironments, {
  PageSettingsPreviewEnvironmentsProps,
} from './page-settings-preview-environments'

const props: PageSettingsPreviewEnvironmentsProps = {
  onSubmit: jest.fn(),
  applications: applicationFactoryMock(3),
}

describe('PageSettingsPreviewEnvironments', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<PageSettingsPreviewEnvironments {...props} />))
    expect(baseElement).toBeTruthy()
  })
})
