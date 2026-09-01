import { fireEvent, renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { ClusterAdvancedSettingsFeature } from './cluster-advanced-settings-feature'

const mockUseClusterAdvancedSettings = jest.fn()
const mockUseDefaultAdvancedSettings = jest.fn()
const mockUseEditClusterAdvancedSettings = jest.fn()
const mockEditClusterAdvancedSettings = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  useParams: () => ({ organizationId: 'organization-id', clusterId: 'cluster-id' }),
}))

jest.mock('../hooks/use-cluster-advanced-settings/use-cluster-advanced-settings', () => ({
  useClusterAdvancedSettings: () => mockUseClusterAdvancedSettings(),
}))

jest.mock('../hooks/use-default-advanced-settings/use-default-advanced-settings', () => ({
  useDefaultAdvancedSettings: () => mockUseDefaultAdvancedSettings(),
}))

jest.mock('../hooks/use-edit-cluster-advanced-settings/use-edit-cluster-advanced-settings', () => ({
  useEditClusterAdvancedSettings: () => mockUseEditClusterAdvancedSettings(),
}))

describe('ClusterAdvancedSettingsFeature', () => {
  beforeEach(() => {
    mockEditClusterAdvancedSettings.mockReset()
    mockUseClusterAdvancedSettings.mockReturnValue({
      data: { 'cluster.setting': 1 },
      isLoading: false,
    })
    mockUseDefaultAdvancedSettings.mockReturnValue({
      data: { 'cluster.setting': 1 },
    })
    mockUseEditClusterAdvancedSettings.mockReturnValue({ mutateAsync: mockEditClusterAdvancedSettings })
  })

  it('should keep the save banner hidden until the payload changes after the form reset', async () => {
    const { userEvent } = renderWithProviders(<ClusterAdvancedSettingsFeature />)

    const textarea = await screen.findByRole('textbox')
    await waitFor(() => expect(textarea).toHaveValue('1'))
    expect(screen.queryByTestId('sticky-action-form-toaster')).not.toBeInTheDocument()

    await userEvent.clear(textarea)
    await userEvent.type(textarea, '2')

    await waitFor(() => expect(screen.getByTestId('sticky-action-form-toaster')).toBeVisible())
  })

  it('should keep the save banner hidden for a payload-equivalent edit', async () => {
    const { userEvent } = renderWithProviders(<ClusterAdvancedSettingsFeature />)

    const textarea = await screen.findByRole('textbox')
    await waitFor(() => expect(textarea).toHaveValue('1'))

    await userEvent.clear(textarea)
    await userEvent.type(textarea, '1.')

    await waitFor(() => {
      expect(textarea).toHaveValue('1.')
      expect(screen.queryByTestId('sticky-action-form-toaster')).not.toBeInTheDocument()
    })

    await userEvent.type(textarea, '0')

    await waitFor(() => {
      expect(textarea).toHaveValue('1.0')
      expect(screen.queryByTestId('sticky-action-form-toaster')).not.toBeInTheDocument()
    })
  })

  it('should hide the save banner after the settings are saved', async () => {
    mockEditClusterAdvancedSettings.mockImplementation((_variables: unknown, options?: { onSuccess?: () => void }) =>
      options?.onSuccess?.()
    )
    const { userEvent } = renderWithProviders(<ClusterAdvancedSettingsFeature />)

    const textarea = await screen.findByRole('textbox')
    await waitFor(() => expect(textarea).toHaveValue('1'))
    await userEvent.clear(textarea)
    await userEvent.type(textarea, '2')
    await userEvent.click(await screen.findByTestId('submit-button'))

    const toaster = screen.getByTestId('sticky-action-form-toaster')
    await waitFor(() => expect(toaster).toHaveClass('animate-action-bar-fade-out'))
    fireEvent.animationEnd(toaster)
    expect(screen.queryByTestId('sticky-action-form-toaster')).not.toBeInTheDocument()
  })
})
