import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { useFormContext } from 'react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ClusterCreationRestrictivePermissionsSettings } from './cluster-creation-restrictive-permissions-settings'

const mockOnSubmit = jest.fn()

jest.mock('../../cluster-credentials-settings/cluster-credentials-settings', () => ({
  ClusterCredentialsSettings: () => null,
}))
jest.mock('../../cluster-credentials-settings/cluster-wide-permission-credentials-settings', () => ({
  ClusterWidePermissionCredentialsSettings: () => null,
}))

function FormHarness() {
  const { handleSubmit } = useFormContext()

  return (
    <form onSubmit={handleSubmit(mockOnSubmit)}>
      <ClusterCreationRestrictivePermissionsSettings />
      <button type="submit">Continue</button>
    </form>
  )
}

const renderSettings = () =>
  renderWithProviders(
    wrapWithReactHookForm(<FormHarness />, {
      defaultValues: { using_restrictive_permissions: true },
    })
  )

describe('ClusterCreationRestrictivePermissionsSettings webhook validation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('allows a valid Slack webhook URL', async () => {
    const { userEvent } = renderSettings()

    await userEvent.type(
      screen.getByLabelText('Slack webhook URL'),
      'https://hooks.slack.com/services/T00000000/B00000000/abcdefghijklmnop'
    )
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        slack_webhook_url: 'https://hooks.slack.com/services/T00000000/B00000000/abcdefghijklmnop',
      }),
      expect.anything()
    )
  })

  it.each([
    'http://hooks.slack.com/services/T00000000/B00000000/abcdefghijklmnop',
    'https://hooks.slack.com.evil.example/services/T00000000/B00000000/abcdefghijklmnop',
    'https://hooks.slack.com/services/%ZZ',
    'https://hooks.slack.com',
    'https://hooks.slack.com/',
  ])('blocks an invalid Slack webhook URL: %s', async (url) => {
    const { userEvent } = renderSettings()

    await userEvent.type(screen.getByLabelText('Slack webhook URL'), url)
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(await screen.findByText('Enter a valid Slack webhook URL from hooks.slack.com.')).toBeInTheDocument()
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })
})
