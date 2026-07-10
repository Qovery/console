import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { BlueprintUpdateLoadingModal } from './blueprint-update-loading-modal'

const props = {
  onEditConfig: jest.fn(),
  onRetry: jest.fn(),
  open: true,
  serviceName: 'AWS S3 Bucket',
}

describe('BlueprintUpdateLoadingModal', () => {
  it('shows the locked loading state', () => {
    renderWithProviders(<BlueprintUpdateLoadingModal {...props} state="loading" />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Creating')).toBeInTheDocument()
    expect(screen.getByText('AWS S3 Bucket')).toBeInTheDocument()
    expect(screen.getByLabelText('Blueprint update logs')).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument()
  })

  it('shows retry and edit actions after an error', async () => {
    const onEditConfig = jest.fn()
    const onRetry = jest.fn()
    const { userEvent } = renderWithProviders(
      <BlueprintUpdateLoadingModal
        {...props}
        onEditConfig={onEditConfig}
        onRetry={onRetry}
        state="error"
        errorMessage="Update failed"
      />
    )

    expect(screen.getByText('Update failed')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Edit config/i }))
    await userEvent.click(screen.getByRole('button', { name: /Retry/i }))

    expect(onEditConfig).toHaveBeenCalledTimes(1)
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
