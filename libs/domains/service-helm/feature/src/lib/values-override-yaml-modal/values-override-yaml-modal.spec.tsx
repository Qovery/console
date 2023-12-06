import { renderWithProviders } from '@qovery/shared/util-tests'
import * as useHelmDefaultValues from '../hooks/use-helm-default-values/use-helm-default-values'
import ValuesOverrideYamlModal, { type ValuesOverrideYamlModalProps } from './values-override-yaml-modal'

const useHelmDefaultValuesMockSpy = jest.spyOn(useHelmDefaultValues, 'useHelmDefaultValues') as jest.Mock

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
    useHelmDefaultValuesMockSpy.mockReturnValue({
      isLoading: false,
      isError: false,
      data: 'my-yaml-content',
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ValuesOverrideYamlModal {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(<ValuesOverrideYamlModal {...props} />)
    expect(baseElement).toMatchSnapshot()
  })
})
