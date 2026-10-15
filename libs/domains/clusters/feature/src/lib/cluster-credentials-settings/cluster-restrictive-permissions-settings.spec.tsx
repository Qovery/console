import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { useFormContext } from 'react-hook-form'
import * as cloudProvidersDomain from '@qovery/domains/cloud-providers/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
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
