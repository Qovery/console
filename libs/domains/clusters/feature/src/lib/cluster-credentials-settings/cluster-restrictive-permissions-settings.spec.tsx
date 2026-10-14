import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { useFormContext } from 'react-hook-form'
import * as cloudProvidersDomain from '@qovery/domains/cloud-providers/feature'
import { renderWithProviders, screen, within } from '@qovery/shared/util-tests'
import { ClusterRestrictivePermissionsSettings } from './cluster-restrictive-permissions-settings'

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    openModal: jest.fn(),
    closeModal: jest.fn(),
  }),
}))

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

const renderSettings = (defaultValues: Record<string, unknown>) =>
  renderWithProviders(
    wrapWithReactHookForm(
      <>
        <ClusterRestrictivePermissionsSettings cloudProvider={CloudProviderEnum.AWS} />
        <FormValues />
      </>,
      { defaultValues }
    )
  )

const isBefore = (element: HTMLElement, other: HTMLElement) =>
  Boolean(element.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_FOLLOWING)

const expectInOrder = (...elements: HTMLElement[]) =>
  elements.slice(1).forEach((element, index) => expect(isBefore(elements[index], element)).toBe(true))

describe('ClusterRestrictivePermissionsSettings', () => {
  beforeEach(() => {
    useCloudProviderCredentialsMockSpy.mockReturnValue({ data: awsCredentials, isLoading: false })
  })

  it('should display the toggle above the credentials block', () => {
    renderSettings({ configured_credentials: 'role-1', using_restrictive_permissions: false })

    const toggle = screen.getByRole('switch', { name: 'Use restrictive permissions' })
    const block = screen.getByTestId('configured-credentials-block')
    expect(within(block).queryByRole('switch')).not.toBeInTheDocument()
    expect(isBefore(block, toggle)).toBe(true)
  })

  it('should display a single configured credentials block when restrictive permissions are off', () => {
    renderSettings({ configured_credentials: 'role-1', using_restrictive_permissions: false })

    expect(screen.getByRole('switch', { name: 'Use restrictive permissions' })).not.toBeChecked()
    const block = screen.getByTestId('configured-credentials-block')
    expect(within(block).getByText('Configured credentials')).toBeInTheDocument()
    expectInOrder(
      within(block).getByTestId('input-configured-credentials'),
      within(block).getByText('See and edit all Cloud credentials')
    )
    expect(screen.queryByTestId('restricted-credentials-block')).not.toBeInTheDocument()
    expect(screen.queryByTestId('slack-notification-webhook-block')).not.toBeInTheDocument()
    expect(screen.queryByTestId('mirroring-registry-credentials-warning')).not.toBeInTheDocument()
  })

  it('should keep configured credentials first and display restricted credentials when restrictive permissions are on', () => {
    renderSettings({
      configured_credentials: 'role-1',
      restricted_credentials: 'static-1',
      using_restrictive_permissions: true,
    })

    const configuredBlock = screen.getByTestId('configured-credentials-block')
    const toggle = screen.getByRole('switch', { name: 'Use restrictive permissions' })
    const restrictedBlock = screen.getByTestId('restricted-credentials-block')
    const webhookBlock = screen.getByTestId('slack-notification-webhook-block')
    expect(within(restrictedBlock).getByText('Restricted credentials')).toBeInTheDocument()
    expectInOrder(configuredBlock, toggle, restrictedBlock, webhookBlock)
    expect(within(configuredBlock).getByTestId('input-configured-credentials')).toBeInTheDocument()
    expect(within(restrictedBlock).getByTestId('input-restricted-credentials')).toBeInTheDocument()
    expect(within(configuredBlock).getByText('See and edit all Cloud credentials')).toBeInTheDocument()
    expect(screen.getAllByText('See and edit all Cloud credentials')).toHaveLength(1)
    expect(screen.queryByTestId('mirroring-registry-credentials-warning')).not.toBeInTheDocument()
  })

  it('should display the Slack webhook after restricted credentials when restrictive permissions are on', () => {
    renderSettings({
      configured_credentials: 'role-1',
      restricted_credentials: 'static-1',
      using_restrictive_permissions: true,
    })

    const block = screen.getByTestId('slack-notification-webhook-block')
    expect(within(block).getByText('Slack notification webhook')).toBeInTheDocument()
    expect(within(block).getByLabelText('Slack webhook URL')).toHaveAttribute('type', 'password')
    expect(
      within(block).getByText('Receive a Slack message when Qovery requests access to the configured credentials.')
    ).toBeInTheDocument()
    expect(
      within(screen.getByTestId('restricted-credentials-block')).getByTestId('input-restricted-credentials')
    ).toBeInTheDocument()
  })

  it('should not display the Slack webhook when restrictive permissions are off', () => {
    renderSettings({ configured_credentials: 'role-1', using_restrictive_permissions: false })

    expect(screen.queryByTestId('slack-notification-webhook-block')).not.toBeInTheDocument()
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
    expect(screen.getByText('Configured credentials')).toBeInTheDocument()
    expect(screen.queryByTestId('restricted-credentials-block')).not.toBeInTheDocument()
    expect(screen.getByTestId('value-configured-credentials')).toHaveTextContent('role-1')

    await userEvent.click(toggle)
    expect(screen.getByText('Restricted credentials')).toBeInTheDocument()
    expect(screen.getByTestId('value-configured-credentials')).toHaveTextContent('role-1')
    expect(screen.getByTestId('value-restricted-credentials')).toHaveTextContent('static-1')
    expect(screen.getByTestId('value-configured-credentials')).toHaveTextContent('role-1')
  })
})
