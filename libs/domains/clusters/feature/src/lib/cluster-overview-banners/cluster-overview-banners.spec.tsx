import { ClusterDeploymentStatusEnum } from 'qovery-typescript-axios'
import { useState } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useWideCredentialsInstructions } from '../hooks/use-wide-credentials-instructions/use-wide-credentials-instructions'
import { ClusterOverviewBanners } from './cluster-overview-banners'

jest.mock('../hooks/use-wide-credentials-instructions/use-wide-credentials-instructions')

const mockUseWideCredentialsInstructions = useWideCredentialsInstructions as jest.Mock
const mockOpenInstructions = jest.fn()
const mockOnDeploy = jest.fn()

// Updating a mounted parent preserves selection; the shared render helper's
// rerender recreates its providers and would remount the banner instead.
function RefreshableBanners() {
  const [deploymentStatus, setDeploymentStatus] = useState<ClusterDeploymentStatusEnum>(
    ClusterDeploymentStatusEnum.OUT_OF_DATE
  )
  const [refreshCount, setRefreshCount] = useState(0)

  return (
    <>
      <button type="button" onClick={() => setDeploymentStatus(ClusterDeploymentStatusEnum.UP_TO_DATE)}>
        Mark up to date
      </button>
      <button type="button" onClick={() => setRefreshCount((count) => count + 1)}>
        Refresh status {refreshCount}
      </button>
      <ClusterOverviewBanners deploymentStatus={deploymentStatus} onDeploy={mockOnDeploy} />
    </>
  )
}

describe('ClusterOverviewBanners', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseWideCredentialsInstructions.mockReturnValue({ isRequired: true, openInstructions: mockOpenInstructions })
  })

  it('shows credentials first and cycles between issues with the corresponding actions', async () => {
    const { userEvent } = renderWithProviders(
      <ClusterOverviewBanners deploymentStatus={ClusterDeploymentStatusEnum.OUT_OF_DATE} onDeploy={mockOnDeploy} />
    )

    expect(screen.getByText('Extended credentials required')).toBeInTheDocument()
    expect(screen.getByText('1/2')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Redeploy now' })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'View instructions' }))

    expect(mockOpenInstructions).toHaveBeenCalledTimes(1)
    expect(mockOnDeploy).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(
      screen.getByText('This cluster needs to be redeployed to apply the configuration changes')
    ).toBeInTheDocument()
    expect(screen.queryByText('Extended credentials required')).not.toBeInTheDocument()
    expect(screen.getByText('2/2')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Redeploy now' }))

    expect(mockOnDeploy).toHaveBeenCalledTimes(1)
    expect(mockOpenInstructions).toHaveBeenCalledTimes(1)

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('Extended credentials required')).toBeInTheDocument()
    expect(screen.getByText('1/2')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Previous' }))

    expect(screen.getByText('2/2')).toBeInTheDocument()
  })

  it('shows a single credentials banner without navigation when no deployment is needed', () => {
    renderWithProviders(
      <ClusterOverviewBanners deploymentStatus={ClusterDeploymentStatusEnum.UP_TO_DATE} onDeploy={mockOnDeploy} />
    )

    expect(screen.getByRole('button', { name: 'View instructions' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Previous' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
  })

  it.each([
    [ClusterDeploymentStatusEnum.OUT_OF_DATE, 'Redeploy now', 'redeployed'],
    [ClusterDeploymentStatusEnum.NEVER_DEPLOYED, 'Deploy now', 'deployed'],
  ] as const)(
    'preserves the %s deployment action when it is the only issue',
    async (deploymentStatus, label, action) => {
      mockUseWideCredentialsInstructions.mockReturnValue({ isRequired: false, openInstructions: mockOpenInstructions })
      const { userEvent } = renderWithProviders(
        <ClusterOverviewBanners deploymentStatus={deploymentStatus} onDeploy={mockOnDeploy} />
      )

      expect(
        screen.getByText(`This cluster needs to be ${action} to apply the configuration changes`)
      ).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: label }))

      expect(mockOnDeploy).toHaveBeenCalledTimes(1)
    }
  )

  it('renders nothing when the cluster has no banner issues', () => {
    mockUseWideCredentialsInstructions.mockReturnValue({ isRequired: false, openInstructions: mockOpenInstructions })
    const { container } = renderWithProviders(
      <ClusterOverviewBanners deploymentStatus={ClusterDeploymentStatusEnum.UP_TO_DATE} onDeploy={mockOnDeploy} />
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('falls back to the credentials banner when the selected deployment issue disappears', async () => {
    const { userEvent } = renderWithProviders(<RefreshableBanners />)

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByText('2/2')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Mark up to date' }))

    expect(screen.getByRole('button', { name: 'View instructions' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
  })

  it('falls back to the deployment issue when credentials are no longer required', async () => {
    const { userEvent } = renderWithProviders(<RefreshableBanners />)
    expect(screen.getByText('Extended credentials required')).toBeInTheDocument()

    mockUseWideCredentialsInstructions.mockReturnValue({ isRequired: false, openInstructions: mockOpenInstructions })
    await userEvent.click(screen.getByRole('button', { name: /Refresh status/ }))

    expect(screen.getByRole('button', { name: 'Redeploy now' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
  })

  it('prioritizes credentials when the requirement appears after the deployment banner', async () => {
    mockUseWideCredentialsInstructions.mockReturnValue({ isRequired: false, openInstructions: mockOpenInstructions })
    const { userEvent } = renderWithProviders(<RefreshableBanners />)

    mockUseWideCredentialsInstructions.mockReturnValue({ isRequired: true, openInstructions: mockOpenInstructions })
    await userEvent.click(screen.getByRole('button', { name: /Refresh status/ }))

    expect(screen.getByRole('button', { name: 'View instructions' })).toBeInTheDocument()
    expect(screen.getByText('1/2')).toBeInTheDocument()
  })

  it('keeps the selected issue across status refreshes and supports keyboard navigation', async () => {
    const { userEvent } = renderWithProviders(<RefreshableBanners />)
    screen.getByRole('button', { name: 'Next' }).focus()

    await userEvent.keyboard('{Enter}')

    expect(screen.getByText('2/2')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Refresh status/ }))
    expect(screen.getByText('2/2')).toBeInTheDocument()

    screen.getByRole('button', { name: 'Previous' }).focus()
    await userEvent.keyboard('{Enter}')

    expect(screen.getByText('1/2')).toBeInTheDocument()
  })
})
