import { renderWithProviders } from '@qovery/shared/util-tests'
import ValuesOverrideYamlModal, { type ValuesOverrideYamlModalProps } from './values-override-yaml-modal'

jest.mock('../hooks/use-create-helm-default-values/use-create-helm-default-values', () => {
  return {
    ...jest.requireActual('../hooks/use-create-helm-default-values/use-create-helm-default-values'),
    useCreateHelmDefaultValues: () => ({
      mutateAsync: jest.fn(),
      isLoading: false,
      isError: false,
      data: 'content',
    }),
  }
})

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
  content: 'content',
}

describe('ValuesOverrideYamlModal', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ValuesOverrideYamlModal {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(<ValuesOverrideYamlModal {...props} />)
    expect(baseElement).toMatchSnapshot()
  })
})
