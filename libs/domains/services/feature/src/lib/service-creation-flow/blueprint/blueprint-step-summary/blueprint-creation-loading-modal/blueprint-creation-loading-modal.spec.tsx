import { type EnvironmentLogs } from 'qovery-typescript-axios'
import { LogsType } from '@qovery/shared/enums'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { BlueprintCreationLoadingModal } from './blueprint-creation-loading-modal'

const errorLog = {
  type: LogsType.ERROR,
  timestamp: '2026-07-13T12:00:43.000Z',
  error: {
    user_log_message: 'Error: Failed to connect to authentication server',
  },
} as EnvironmentLogs

describe('BlueprintCreationLoadingModal', () => {
  it('renders recovery actions and highlights the error log', async () => {
    const onEditConfig = jest.fn()
    const onRetry = jest.fn()
    const { userEvent } = renderWithProviders(
      <BlueprintCreationLoadingModal
        logs={[errorLog]}
        open
        serviceName="postgres"
        onEditConfig={onEditConfig}
        onRetry={onRetry}
      />
    )

    expect(screen.getByRole('heading', { name: 'Creating postgres' })).toBeVisible()
    expect(screen.getByText('Error: Failed to connect to authentication server').closest('div')).toHaveClass(
      'text-negative'
    )

    await userEvent.click(screen.getByRole('button', { name: 'Edit config' }))
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))

    expect(onEditConfig).toHaveBeenCalledTimes(1)
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
