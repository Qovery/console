import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum, KubernetesEnum } from 'qovery-typescript-axios'
import { useFormContext } from 'react-hook-form'
import * as cloudProvidersDomain from '@qovery/domains/cloud-providers/feature'
import { clusterFactoryMock } from '@qovery/shared/factories'
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

const eksManagedCluster = {
  ...clusterFactoryMock(1, CloudProviderEnum.AWS)[0],
  kubernetes: KubernetesEnum.MANAGED,
}

const awsCredentials = [
  { id: 'static-1', name: 'static-credential', object_type: 'AWS', access_key_id: 'AKIA' },
  { id: 'role-1', name: 'role-credential', object_type: 'AWS_ROLE', role_arn: 'arn:aws:iam::1:role/qovery' },
]

function FormValues() {
  const { watch } = useFormContext()
  return (
    <>
      <output data-testid="value-credentials">{watch('credentials')}</output>
      <output data-testid="value-wide-permission-credentials">{watch('wide_permission_credentials')}</output>
    </>
  )
}

const renderSettings = (defaultValues: Record<string, unknown>) =>
  renderWithProviders(
    wrapWithReactHookForm(
      <>
        <ClusterRestrictivePermissionsSettings cloudProvider={CloudProviderEnum.AWS} cluster={eksManagedCluster} />
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
    renderSettings({ credentials: 'static-1', using_restrictive_permissions: false })

    const toggle = screen.getByRole('switch', { name: 'Use restrictive permissions' })
    const block = screen.getByTestId('restrictive-credentials-block')
    expect(within(block).queryByRole('switch')).not.toBeInTheDocument()
    expect(isBefore(toggle, block)).toBe(true)
  })

  it('should display a single configured credentials block when restrictive permissions are off', () => {
    renderSettings({ credentials: 'static-1', using_restrictive_permissions: false })

    expect(screen.getByRole('switch', { name: 'Use restrictive permissions' })).not.toBeChecked()
    const block = screen.getByTestId('restrictive-credentials-block')
    expect(within(block).getByText('Configured credentials')).toBeInTheDocument()
    expect(within(block).getByTestId('eks-credentials-change-warning')).toHaveTextContent(
      'Changing credentials triggers a cluster redeployment'
    )
    expectInOrder(
      within(block).getByTestId('eks-credentials-change-warning'),
      within(block).getByTestId('input-credentials'),
      within(block).getByText('See and edit all Cloud credentials'),
      within(block).getByTestId('mirroring-registry-credentials-warning')
    )
    expect(screen.queryByTestId('extended-credentials-block')).not.toBeInTheDocument()
  })

  it('should display restrictive and extended credentials blocks when restrictive permissions are on', () => {
    renderSettings({
      credentials: 'static-1',
      wide_permission_credentials: 'role-1',
      using_restrictive_permissions: true,
    })

    const restrictiveBlock = screen.getByTestId('restrictive-credentials-block')
    expect(within(restrictiveBlock).getByText('Restrictive credentials')).toBeInTheDocument()
    expect(within(restrictiveBlock).getByTestId('eks-credentials-change-warning')).toHaveTextContent(
      'Changing the restrictive credentials triggers a cluster redeployment'
    )
    expectInOrder(
      within(restrictiveBlock).getByTestId('eks-credentials-change-warning'),
      within(restrictiveBlock).getByTestId('input-credentials'),
      within(restrictiveBlock).getByText('See and edit all Cloud credentials'),
      within(restrictiveBlock).getByTestId('mirroring-registry-credentials-warning')
    )

    const extendedBlock = screen.getByTestId('extended-credentials-block')
    expect(within(extendedBlock).getByText('Extended credentials')).toBeInTheDocument()
    expect(within(extendedBlock).getByTestId('input-wide-permission-credentials')).toBeInTheDocument()
    // The link is only displayed in the restrictive credentials block, so it doesn't move when switching the toggle
    expect(within(extendedBlock).queryByText('See and edit all Cloud credentials')).not.toBeInTheDocument()
    expect(screen.getAllByText('See and edit all Cloud credentials')).toHaveLength(1)
    expect(within(extendedBlock).queryByTestId('mirroring-registry-credentials-warning')).not.toBeInTheDocument()
    expect(isBefore(restrictiveBlock, extendedBlock)).toBe(true)
  })

  it('should switch the layout with the toggle and keep the initial values', async () => {
    const { userEvent } = renderSettings({
      credentials: 'static-1',
      wide_permission_credentials: 'role-1',
      using_restrictive_permissions: true,
    })
    const toggle = screen.getByRole('switch', { name: 'Use restrictive permissions' })

    await userEvent.click(toggle)
    expect(screen.getByText('Configured credentials')).toBeInTheDocument()
    expect(screen.queryByTestId('extended-credentials-block')).not.toBeInTheDocument()
    expect(screen.getByText('static-credential (AKIA)')).toBeInTheDocument()

    await userEvent.click(toggle)
    expect(screen.getByText('Restrictive credentials')).toBeInTheDocument()
    expect(within(screen.getByTestId('extended-credentials-block')).getByText('role-credential')).toBeInTheDocument()
    expect(screen.getByTestId('value-credentials')).toHaveTextContent('static-1')
    expect(screen.getByTestId('value-wide-permission-credentials')).toHaveTextContent('role-1')
  })
})
