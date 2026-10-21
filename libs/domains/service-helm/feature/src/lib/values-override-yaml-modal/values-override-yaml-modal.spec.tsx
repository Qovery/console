import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import useHelmDefaultValues from '../hooks/use-helm-default-values/use-helm-default-values'
import ValuesOverrideYamlModal, { type ValuesOverrideYamlModalProps } from './values-override-yaml-modal'

jest.mock('../hooks/use-helm-default-values/use-helm-default-values', () => ({
  __esModule: true,
  useHelmDefaultValues: jest.fn(),
  default: jest.fn(),
}))

jest.mock('@qovery/domains/variables/feature', () => ({
  CodeEditorVariable: () => <div data-testid="code-editor-variable" />,
}))

const mockUseHelmDefaultValues = useHelmDefaultValues as jest.Mock

const props: ValuesOverrideYamlModalProps = {
  environmentId: '0',
  source: {
    helm_repository: {
      repository: 'repository',
      chart_name: 'test',
      chart_version: '1.0.0',
    },
  },
  onSubmit: jest.fn(),
  onClose: jest.fn(),
  content: 'my-yaml-content',
}

describe('ValuesOverrideYamlModal', () => {
  beforeEach(() => {
    mockUseHelmDefaultValues.mockReturnValue({
      isLoading: false,
      isError: false,
      data: 'my-yaml-content',
    })
  })

  it('should render successfully', async () => {
    const { baseElement } = renderWithProviders(<ValuesOverrideYamlModal {...props} />)
    expect(baseElement).toBeTruthy()
    await waitFor(() => expect(screen.getByTestId('submit-button')).toBeEnabled())
  })

  it('should match snapshot', async () => {
    const { baseElement } = renderWithProviders(<ValuesOverrideYamlModal {...props} />)
    await waitFor(() => expect(screen.getByTestId('submit-button')).toBeEnabled())
    expect(baseElement).toMatchSnapshot()
  })
})
