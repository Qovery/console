import { act } from '@testing-library/react'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum, type ClusterCredentials } from 'qovery-typescript-axios'
import { useFormContext } from 'react-hook-form'
import selectEvent from 'react-select-event'
import * as cloudProvidersDomain from '@qovery/domains/cloud-providers/feature'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import {
  ClusterWidePermissionCredentialsSettings,
  filterWidePermissionCredentials,
} from './cluster-wide-permission-credentials-settings'

const mockOpenModal = jest.fn()
const mockCloseModal = jest.fn()

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    openModal: mockOpenModal,
    closeModal: mockCloseModal,
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
  { id: 'role-2', name: 'other-role-credential', object_type: 'AWS_ROLE', role_arn: 'arn:aws:iam::1:role/other' },
  { id: 'role-1', name: 'role-credential', object_type: 'AWS_ROLE', role_arn: 'arn:aws:iam::1:role/qovery' },
]

function FormState() {
  const {
    watch,
    formState: { isValid },
  } = useFormContext()
  return (
    <>
      <output data-testid="value-wide-permission-credentials">{watch('wide_permission_credentials')}</output>
      <output data-testid="form-valid">{String(isValid)}</output>
    </>
  )
}

const renderSettings = (defaultValues: Record<string, unknown>) =>
  renderWithProviders(
    wrapWithReactHookForm(
      <>
        <ClusterWidePermissionCredentialsSettings cloudProvider={CloudProviderEnum.AWS} />
        <FormState />
      </>,
      { defaultValues }
    )
  )

describe('ClusterWidePermissionCredentialsSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useCloudProviderCredentialsMockSpy.mockReturnValue({ data: awsCredentials, isLoading: false })
  })

  it('should only keep AWS role credentials', () => {
    expect(filterWidePermissionCredentials(awsCredentials as ClusterCredentials[])).toEqual([
      awsCredentials[1],
      awsCredentials[2],
    ])
  })

  it('should have loader when loading', () => {
    useCloudProviderCredentialsMockSpy.mockReturnValue({ data: [], isLoading: true })
    renderSettings({ using_restrictive_permissions: true })

    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('should display the credentials select, its hint and the cloud credentials link', () => {
    renderSettings({ using_restrictive_permissions: true, wide_permission_credentials: 'role-1' })

    expect(screen.getByLabelText('Credentials')).toBeInTheDocument()
    expect(screen.getByText('role-credential')).toBeInTheDocument()
    expect(screen.getByText('Only AWS role credentials can be used for extended permissions.')).toBeInTheDocument()
    expect(screen.getByText('See and edit all Cloud credentials')).toBeInTheDocument()
  })

  it('should only list AWS role credentials', async () => {
    renderSettings({ using_restrictive_permissions: true, wide_permission_credentials: '' })

    selectEvent.openMenu(screen.getByLabelText('Credentials'))

    expect(await screen.findByText('role-credential')).toBeInTheDocument()
    expect(screen.getByText('other-role-credential')).toBeInTheDocument()
    expect(screen.queryByText('static-credential')).not.toBeInTheDocument()
  })

  it.each([
    [true, 'false'],
    [false, 'true'],
  ])(
    'should only require a credential while restrictive permissions are used (%p)',
    async (usingRestrictivePermissions, isValid) => {
      renderSettings({ using_restrictive_permissions: usingRestrictivePermissions, wide_permission_credentials: '' })

      await waitFor(() => expect(screen.getByTestId('form-valid')).toHaveTextContent(isValid))
    }
  )

  it('should only allow creating an AWS role credential and select it', async () => {
    const { userEvent } = renderSettings({ using_restrictive_permissions: true, wide_permission_credentials: '' })

    await userEvent.click(screen.getByLabelText('Credentials'))
    await userEvent.click(await screen.findByText('New credential'))

    const modalProps = mockOpenModal.mock.calls[0][0].content.props
    expect(modalProps.allowedTypes).toEqual(['STS'])
    expect(modalProps.credential).toBeUndefined()

    act(() => modalProps.onClose({ id: 'role-new' }))
    expect(screen.getByTestId('value-wide-permission-credentials')).toHaveTextContent('role-new')
    expect(mockCloseModal).toHaveBeenCalledTimes(1)
  })
})
