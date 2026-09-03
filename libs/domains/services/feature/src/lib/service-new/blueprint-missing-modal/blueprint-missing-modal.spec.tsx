import posthog from 'posthog-js'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { BlueprintMissingModal } from './blueprint-missing-modal'

jest.mock('posthog-js', () => ({
  capture: jest.fn(),
}))

describe('BlueprintMissingModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should disable submit until a message is entered when opened empty', () => {
    renderWithProviders(<BlueprintMissingModal organizationId="org-1" onClose={jest.fn()} />)

    expect(screen.getByRole('button', { name: 'Send request' })).toBeDisabled()
  })

  it('should enable submit immediately when opened with a prefilled search input', async () => {
    renderWithProviders(<BlueprintMissingModal organizationId="org-1" searchInput="redis" onClose={jest.fn()} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Send request' })).toBeEnabled()
    })
  })

  it('should submit feedback with the trimmed message, organization and cloud provider', async () => {
    const onClose = jest.fn()
    const { userEvent } = renderWithProviders(
      <BlueprintMissingModal organizationId="org-1" cloudProvider="AWS" searchInput="  redis  " onClose={onClose} />
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Send request' })).toBeEnabled()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Send request' }))

    await waitFor(() => {
      expect(posthog.capture).toHaveBeenCalledWith('blueprint-missing-feedback', {
        message: 'redis',
        organization_id: 'org-1',
        cloud_provider: 'AWS',
      })
      expect(onClose).toHaveBeenCalled()
    })
  })
})
