import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { useFormContext } from 'react-hook-form'
import * as cloudProvidersDomain from '@qovery/domains/cloud-providers/feature'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { useClusterStatus } from '../hooks/use-cluster-status/use-cluster-status'
import { useCluster } from '../hooks/use-cluster/use-cluster'
import { ClusterRestrictivePermissionsSettings } from './cluster-restrictive-permissions-settings'

jest.mock('../hooks/use-cluster-status/use-cluster-status')
jest.mock('../hooks/use-cluster/use-cluster')

jest.mock('@tanstack/react-router', () => {
  const React = jest.requireActual('react')
  return {
    ...jest.requireActual('@tanstack/react-router'),
    useParams: () => ({
      organizationId: 'org-123',
      clusterId: 'cluster-123',
    }),
    useRouterState: () => ({
      location: {
        pathname: '/',
      },
    }),
    useRouter: () => ({
      buildLocation: jest.fn(() => ({ href: '/' })),
    }),
    Link: React.forwardRef(
      (
        { children, ...props }: { children?: React.ReactNode; [key: string]: unknown },
        ref: React.Ref<HTMLAnchorElement>
      ) => React.createElement('a', { ref, ...props }, children)
    ),
  }
})

const useCloudProviderCredentialsMockSpy = jest.spyOn(cloudProvidersDomain, 'useCloudProviderCredentials') as jest.Mock
const mockOnSubmit = jest.fn()
const mockUseCluster = useCluster as jest.Mock
const mockUseClusterStatus = useClusterStatus as jest.Mock

const awsCredentials = [
  { id: 'static-1', name: 'static-credential', object_type: 'AWS', access_key_id: 'AKIA' },
  { id: 'role-1', name: 'role-credential', object_type: 'AWS_ROLE', role_arn: 'arn:aws:iam::1:role/qovery' },
]

function FormValues() {
  const { watch } = useFormContext()
  return (
    <>
      <output data-testid="value-configured-credentials">{watch('configured_credentials')}</output>
      <output data-testid="value-restricted-credentials">{watch('restricted_credentials')}</output>
    </>
  )
}

function FormHarness() {
  const { handleSubmit } = useFormContext()

  return (
    <form onSubmit={handleSubmit(mockOnSubmit)}>
      <ClusterRestrictivePermissionsSettings cloudProvider={CloudProviderEnum.AWS} />
      <FormValues />
      <button type="submit">Save</button>
    </form>
  )
}

const renderSettings = (defaultValues: Record<string, unknown>) =>
  renderWithProviders(wrapWithReactHookForm(<FormHarness />, { defaultValues }))

const isBefore = (element: HTMLElement, other: HTMLElement) =>
  Boolean(element.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_FOLLOWING)

const expectInOrder = (...elements: HTMLElement[]) =>
  elements.slice(1).forEach((element, index) => expect(isBefore(elements[index], element)).toBe(true))

describe('ClusterRestrictivePermissionsSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useCloudProviderCredentialsMockSpy.mockReturnValue({ data: awsCredentials, isLoading: false })
    mockUseCluster.mockReturnValue({ data: { wide_permissions: { require_wide_access_to_deploy: false } } })
    mockUseClusterStatus.mockReturnValue({ data: { status: 'DEPLOYED' }, isLoading: false, isSuccess: true })
  })

  it.each([false, undefined])('should hide the wide credentials callout when wide access is %s', (required) => {
    mockUseCluster.mockReturnValue({ data: { wide_permissions: { require_wide_access_to_deploy: required } } })
    renderSettings({ configured_credentials: 'role-1', using_restrictive_permissions: false })

    expect(screen.queryByText('Extended credentials required')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'View instructions' })).not.toBeInTheDocument()
  })

  it.each([
    { data: { status: 'DEPLOYING' }, isLoading: false, isSuccess: true },
    { data: undefined, isLoading: true, isSuccess: false },
    { data: undefined, isLoading: false, isSuccess: false, isError: true },
    { data: { status: 'DEPLOYED' }, isLoading: false, isSuccess: false, isError: true },
    { data: undefined, isLoading: false, isSuccess: true },
    { data: {}, isLoading: false, isSuccess: true },
  ])('should hide the callout without a confirmed non-deploying status (%j)', (status) => {
    mockUseCluster.mockReturnValue({ data: { wide_permissions: { require_wide_access_to_deploy: true } } })
    mockUseClusterStatus.mockReturnValue(status)
    renderSettings({ configured_credentials: 'role-1', using_restrictive_permissions: false })

    expect(screen.queryByText('Extended credentials required')).not.toBeInTheDocument()
  })

  it('should show the callout below extended credentials and open the shared modal without submitting', async () => {
    mockUseCluster.mockReturnValue({ data: { wide_permissions: { require_wide_access_to_deploy: true } } })
    const { userEvent } = renderSettings({ configured_credentials: 'role-1', using_restrictive_permissions: false })
    const message = screen.getByText('Extended credentials required')
    const trigger = screen.getByRole('button', { name: 'View instructions' })
    expectInOrder(
      screen.getByTestId('input-configured-credentials'),
      message,
      trigger,
      screen.getByRole('switch', { name: 'Use restrictive permissions' })
    )

    await userEvent.click(trigger)

    expect(await screen.findByRole('dialog', { name: 'Allow Qovery access' })).toBeInTheDocument()
    expect(screen.getByText(/Allow Qovery to assume/)).toBeInTheDocument()
    const policy = screen.getByRole('textbox', { name: 'Required IAM trust policy' }) as HTMLTextAreaElement
    expect(JSON.parse(policy.value)).toMatchObject({
      Statement: [{ Condition: { StringLike: { 'sts:ExternalId': 'org-123:*' } } }],
    })
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
    expect(mockOnSubmit).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('should display extended credentials above the toggle', () => {
    renderSettings({ configured_credentials: 'role-1', using_restrictive_permissions: false })

    const toggle = screen.getByRole('switch', { name: 'Use restrictive permissions' })
    const block = screen.getByTestId('input-configured-credentials')
    expect(isBefore(block, toggle)).toBe(true)
  })

  it('should display only extended credentials when restrictive permissions are off', () => {
    renderSettings({ configured_credentials: 'role-1', using_restrictive_permissions: false })

    expect(screen.getByRole('switch', { name: 'Use restrictive permissions' })).not.toBeChecked()
    expect(screen.getByTestId('input-configured-credentials')).toBeInTheDocument()
    expect(screen.queryByText('See and edit all Cloud credentials')).not.toBeInTheDocument()
    expect(screen.queryByTestId('input-restricted-credentials')).not.toBeInTheDocument()
    expect(screen.queryByTestId('input-slack-webhook-url')).not.toBeInTheDocument()
    expect(screen.queryByTestId('mirroring-registry-credentials-warning')).not.toBeInTheDocument()
  })

  it('should keep extended credentials first and display restricted credentials when restrictive permissions are on', () => {
    renderSettings({
      configured_credentials: 'role-1',
      restricted_credentials: 'static-1',
      using_restrictive_permissions: true,
    })

    const configuredBlock = screen.getByTestId('input-configured-credentials')
    const toggle = screen.getByRole('switch', { name: 'Use restrictive permissions' })
    const restrictedBlock = screen.getByTestId('input-restricted-credentials')
    const webhookBlock = screen.getByTestId('input-slack-webhook-url')
    expectInOrder(configuredBlock, toggle, restrictedBlock, webhookBlock)
    expect(screen.queryByText('See and edit all Cloud credentials')).not.toBeInTheDocument()
    expect(screen.queryByTestId('mirroring-registry-credentials-warning')).not.toBeInTheDocument()
  })

  it('should display the Slack webhook after restricted credentials when restrictive permissions are on', () => {
    renderSettings({
      configured_credentials: 'role-1',
      restricted_credentials: 'static-1',
      using_restrictive_permissions: true,
    })

    expect(screen.getByLabelText('Slack webhook URL')).toHaveAttribute('type', 'password')
    expect(
      screen.getByText('Receive a Slack message when Qovery requests access to the extended credentials.')
    ).toBeInTheDocument()
    expect(screen.getByTestId('input-restricted-credentials')).toBeInTheDocument()
  })

  it('should display the saved Slack webhook URL in the password field', () => {
    renderSettings({
      configured_credentials: 'role-1',
      restricted_credentials: 'static-1',
      using_restrictive_permissions: true,
      slack_webhook_url: 'https://hooks.slack.com/services/T00000000/B00000000/abcdefghijklmnop',
    })

    expect(screen.getByLabelText('Slack webhook URL')).toHaveValue(
      'https://hooks.slack.com/services/T00000000/B00000000/abcdefghijklmnop'
    )
  })

  it('should block saving an invalid Slack webhook URL when editing credentials', async () => {
    const { userEvent } = renderSettings({
      configured_credentials: 'role-1',
      restricted_credentials: 'static-1',
      using_restrictive_permissions: true,
      slack_webhook_url: 'https://example.com/services/invalid',
    })

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Enter a valid Slack webhook URL from hooks.slack.com.')).toBeInTheDocument()
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('should allow saving a valid Slack webhook URL when editing credentials', async () => {
    const { userEvent } = renderSettings({
      configured_credentials: 'role-1',
      restricted_credentials: 'static-1',
      using_restrictive_permissions: true,
      slack_webhook_url: 'https://hooks.slack.com/services/T00000000/B00000000/abcdefghijklmnop',
    })

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(mockOnSubmit).toHaveBeenCalled())
    expect(screen.queryByText('Enter a valid Slack webhook URL from hooks.slack.com.')).not.toBeInTheDocument()
  })

  it('should not display the Slack webhook when restrictive permissions are off', () => {
    renderSettings({ configured_credentials: 'role-1', using_restrictive_permissions: false })

    expect(screen.queryByTestId('input-slack-webhook-url')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Slack webhook URL')).not.toBeInTheDocument()
  })

  it('should switch the layout with the toggle and keep the initial values', async () => {
    const { userEvent } = renderSettings({
      configured_credentials: 'role-1',
      restricted_credentials: 'static-1',
      using_restrictive_permissions: true,
    })
    const toggle = screen.getByRole('switch', { name: 'Use restrictive permissions' })

    await userEvent.click(toggle)
    expect(screen.getByText('Extended credentials')).toBeInTheDocument()
    expect(screen.queryByTestId('input-restricted-credentials')).not.toBeInTheDocument()
    expect(screen.getByTestId('value-configured-credentials')).toHaveTextContent('role-1')

    await userEvent.click(toggle)
    expect(screen.getByText('Restricted credentials')).toBeInTheDocument()
    expect(screen.getByTestId('value-configured-credentials')).toHaveTextContent('role-1')
    expect(screen.getByTestId('value-restricted-credentials')).toHaveTextContent('static-1')
  })
})
