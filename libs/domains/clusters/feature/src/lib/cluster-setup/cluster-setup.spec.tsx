import { useOS } from '@qovery/shared/util-hooks'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ClusterSetup } from './cluster-setup'

jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useOS: jest.fn(() => 'macos'),
}))

describe('ClusterSetup', () => {
  beforeEach(() => jest.mocked(useOS).mockReturnValue('macos'))

  it('explains the default Linux distribution and per-distribution Docker integration on Windows', () => {
    jest.mocked(useOS).mockReturnValue('windows')
    renderWithProviders(<ClusterSetup type="LOCAL_DEMO" />)
    expect(
      screen.getByText(
        'Before running this in PowerShell, install a WSL 2 Linux distribution (such as Ubuntu) and set it as the default. Enable Docker Desktop’s WSL integration for that distribution in Settings > Resources > WSL Integration.'
      )
    ).toBeInTheDocument()
  })

  it('should match manage deployment snapshot', async () => {
    const { baseElement } = renderWithProviders(<ClusterSetup type="SELF_MANAGED" />)
    expect(baseElement).toMatchSnapshot()
  })
})
