import { clusterFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { PageSettingsKubeconfig, type PageSettingsKubeconfigProps } from './page-settings-kubeconfig'

const mockCluster = clusterFactoryMock(1)[0]

describe('PageSettingsKubeconfig', () => {
  const props: PageSettingsKubeconfigProps = {
    cluster: mockCluster,
    onSubmit: jest.fn(),
  }

  it('should render successfully', async () => {
    const { baseElement } = renderWithProviders(<PageSettingsKubeconfig {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should match snapshot', async () => {
    const { container } = renderWithProviders(<PageSettingsKubeconfig {...props} />)
    expect(container).toMatchSnapshot()
  })
})
