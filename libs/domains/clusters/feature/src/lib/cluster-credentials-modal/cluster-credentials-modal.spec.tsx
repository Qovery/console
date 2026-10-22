import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { CloudProviderEnum, type ClusterCredentials } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import * as useCreateCloudProviderCredentialHook from '@qovery/domains/cloud-providers/feature'
import * as useDeleteCloudProviderCredentialHook from '@qovery/domains/cloud-providers/feature'
import * as useEditCloudProviderCredentialHook from '@qovery/domains/cloud-providers/feature'
import { getByText, renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useClusterCloudProviderInfoHook from '../hooks/use-cluster-cloud-provider-info/use-cluster-cloud-provider-info'
import ClusterCredentialsModal, {
  type ClusterCredentialsModalProps,
  getDefaultClusterCredentialType,
  handleSubmit,
} from './cluster-credentials-modal'

jest.mock('@qovery/domains/cloud-providers/feature', () => ({
  useCreateCloudProviderCredential: jest.fn(),
  useDeleteCloudProviderCredential: jest.fn(),
  useEditCloudProviderCredential: jest.fn(),
}))

jest.mock('posthog-js/react', () => ({
  useFeatureFlagEnabled: jest.fn(() => true),
}))

jest.mock('../hooks/use-cluster-cloud-provider-info/use-cluster-cloud-provider-info', () => ({
  useClusterCloudProviderInfo: jest.fn(),
}))

let props: ClusterCredentialsModalProps

const mockCreateCredential = jest.fn()
const mockDeleteCredential = jest.fn()
const mockEditCredential = jest.fn()
const mockUseFeatureFlagEnabled = useFeatureFlagEnabled as jest.Mock

describe('ClusterCredentialsModal', () => {
  beforeEach(() => {
    props = {
      organizationId: '000',
      clusterId: '000',
      onClose: jest.fn(),
      cloudProvider: CloudProviderEnum.AWS,
    }

    mockUseFeatureFlagEnabled.mockReturnValue(true)

    jest.spyOn(useCreateCloudProviderCredentialHook, 'useCreateCloudProviderCredential').mockReturnValue({
      mutateAsync: mockCreateCredential,
      isLoading: false,
    })

    jest.spyOn(useDeleteCloudProviderCredentialHook, 'useDeleteCloudProviderCredential').mockReturnValue({
      mutateAsync: mockDeleteCredential,
    })

    jest.spyOn(useEditCloudProviderCredentialHook, 'useEditCloudProviderCredential').mockReturnValue({
      mutateAsync: mockEditCredential,
      isLoading: false,
    })

    jest.spyOn(useClusterCloudProviderInfoHook, 'useClusterCloudProviderInfo').mockImplementation(() => ({
      data: { cloud_provider: props.cloudProvider },
      isLoading: false,
    }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<ClusterCredentialsModal {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render AWS credential form with STS as default', () => {
    renderWithProviders(wrapWithReactHookForm(<ClusterCredentialsModal {...props} />))

    expect(screen.getByText('Authentication type')).toBeInTheDocument()
    expect(screen.getByText('3. Insert here the role ARN')).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
  })

  it('should pass the organization id to the Qovery role Cloudformation stack', () => {
    renderWithProviders(
      wrapWithReactHookForm(
        <ClusterCredentialsModal {...props} organizationId="3f2b7c1e-8d4a-4b6e-9f0a-1c2d3e4f5a6b" />
      )
    )

    expect(screen.getByRole('link', { name: /Cloudformation stack/ })).toHaveAttribute(
      'href',
      'https://console.aws.amazon.com/cloudformation/home?#/stacks/quickcreate?templateURL=https%3A%2F%2Fcloudformation-qovery-role-creation.s3.amazonaws.com%2Ftemplate.json&stackName=qovery-role-creation&param_OrganizationId=3f2b7c1e-8d4a-4b6e-9f0a-1c2d3e4f5a6b'
    )
  })

  it('should get default credential type by object type', () => {
    expect(
      getDefaultClusterCredentialType({
        credential: {
          object_type: 'EKS_ANYWHERE_VSPHERE',
          role_arn: 'arn:aws:eks::123456789012:role/test-role',
        } as ClusterCredentials,
        isEdit: true,
        isAwsMode: true,
        isGcpMode: false,
      })
    ).toBe('EKS_ANYWHERE_VSPHERE_ROLE')

    expect(
      getDefaultClusterCredentialType({
        credential: { object_type: 'EKS_ANYWHERE_VSPHERE' } as ClusterCredentials,
        isEdit: true,
        isAwsMode: true,
        isGcpMode: false,
      })
    ).toBe('EKS_ANYWHERE_VSPHERE_STATIC')

    expect(
      getDefaultClusterCredentialType({
        credential: { object_type: 'GCP_WORKLOAD_IDENTITY_FEDERATION' } as ClusterCredentials,
        isEdit: true,
        isAwsMode: false,
        isGcpMode: true,
      })
    ).toBe('WIF')

    expect(
      getDefaultClusterCredentialType({
        credential: { object_type: 'GCP' } as ClusterCredentials,
        isEdit: true,
        isAwsMode: false,
        isGcpMode: true,
      })
    ).toBe('STATIC')

    expect(
      getDefaultClusterCredentialType({
        credential: { object_type: 'AWS_ROLE' } as ClusterCredentials,
        isEdit: true,
        isAwsMode: true,
        isGcpMode: false,
      })
    ).toBe('STS')
  })

  it('should get default credential type for create mode', () => {
    expect(
      getDefaultClusterCredentialType({
        credential: undefined,
        isEdit: false,
        isAwsMode: true,
        isGcpMode: false,
      })
    ).toBe('STS')

    expect(
      getDefaultClusterCredentialType({
        credential: undefined,
        isEdit: false,
        isAwsMode: false,
        isGcpMode: true,
      })
    ).toBe('WIF')

    expect(
      getDefaultClusterCredentialType({
        credential: undefined,
        isEdit: true,
        isAwsMode: true,
        isGcpMode: false,
      })
    ).toBe('STATIC')
  })

  it('should handle STS form submission', async () => {
    mockCreateCredential.mockResolvedValue({ id: 'new-cred' })

    const { userEvent } = renderWithProviders(wrapWithReactHookForm(<ClusterCredentialsModal {...props} />))

    const nameInput = screen.getByTestId('input-name')
    const roleArnInput = screen.getByTestId('input-text')
    const submitButton = screen.getByTestId('submit-button')

    await userEvent.type(nameInput, 'test-credential')
    await userEvent.type(roleArnInput, 'arn:aws:iam::123456789012:role/test-role')
    await userEvent.click(submitButton)

    expect(mockCreateCredential).toHaveBeenCalled()
    expect(props.onClose).toHaveBeenCalled()
  })

  it('keeps the form open and its values after an API error, then allows retry', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    try {
      mockCreateCredential
        .mockRejectedValueOnce(new Error('API unavailable'))
        .mockResolvedValueOnce({ id: 'retry-credential' })
      const { userEvent } = renderWithProviders(<ClusterCredentialsModal {...props} />)
      await userEvent.type(screen.getByLabelText('Name'), 'test-credential')
      await userEvent.type(screen.getByTestId('input-text'), 'arn:aws:iam::123456789012:role/test-role')
      await userEvent.click(screen.getByTestId('submit-button'))
      expect(props.onClose).not.toHaveBeenCalled()
      expect(screen.getByLabelText('Name')).toHaveValue('test-credential')
      expect(screen.getByTestId('input-text')).toHaveValue('arn:aws:iam::123456789012:role/test-role')
      await userEvent.click(screen.getByTestId('submit-button'))
      expect(props.onClose).toHaveBeenCalledWith({ id: 'retry-credential' })
    } finally {
      consoleSpy.mockRestore()
    }
  })

  it('explains insufficient permissions with an administrator recovery action', () => {
    const useCreateCredentialMock = useCreateCloudProviderCredentialHook.useCreateCloudProviderCredential as jest.Mock
    useCreateCredentialMock.mockReturnValue({
      mutateAsync: mockCreateCredential,
      isLoading: false,
      error: { response: { status: 403 } },
    })
    renderWithProviders(<ClusterCredentialsModal {...props} />)
    expect(screen.getByRole('alert')).toHaveTextContent('You do not have permission to create cloud credentials')
    expect(screen.getByRole('alert')).toHaveTextContent('Ask your organization administrator')
    expect(props.onClose).not.toHaveBeenCalled()
  })

  it('should format AWS STS credentials correctly with handleSubmit', () => {
    const data = {
      name: 'test-cred',
      type: 'STS',
      role_arn: 'arn:aws:iam::123456789012:role/test-role',
    }

    const result = handleSubmit(data, CloudProviderEnum.AWS)

    expect(result).toEqual({
      cloudProvider: 'AWS',
      payload: {
        name: 'test-cred',
        type: 'AWS_ROLE',
        role_arn: 'arn:aws:iam::123456789012:role/test-role',
      },
    })
  })

  it('should format EKS Anywhere vSphere role credentials correctly with handleSubmit', () => {
    const data = {
      name: 'test-cred',
      type: 'EKS_ANYWHERE_VSPHERE_ROLE',
      role_arn: 'arn:aws:iam::123456789012:role/test-role',
      vsphere_user: 'administrator@vsphere.local',
      vsphere_password: 'super-secret',
    }

    const result = handleSubmit(data, CloudProviderEnum.AWS)

    expect(result).toEqual({
      cloudProvider: 'AWS',
      payload: {
        name: 'test-cred',
        type: 'EKS_ANYWHERE_VSPHERE_ROLE',
        role_arn: 'arn:aws:iam::123456789012:role/test-role',
        vsphere_user: 'administrator@vsphere.local',
        vsphere_password: 'super-secret',
      },
    })
  })

  it('should format EKS Anywhere vSphere static credentials correctly with handleSubmit', () => {
    const data = {
      name: 'test-cred',
      type: 'EKS_ANYWHERE_VSPHERE_STATIC',
      access_key_id: 'AKIA_TEST',
      secret_access_key: 'secret',
      vsphere_user: 'administrator@vsphere.local',
      vsphere_password: 'super-secret',
    }

    const result = handleSubmit(data, CloudProviderEnum.AWS)

    expect(result).toEqual({
      cloudProvider: 'AWS',
      payload: {
        name: 'test-cred',
        type: 'EKS_ANYWHERE_VSPHERE_STATIC',
        access_key_id: 'AKIA_TEST',
        secret_access_key: 'secret',
        vsphere_user: 'administrator@vsphere.local',
        vsphere_password: 'super-secret',
      },
    })
  })

  it('should render GCP WIF as default authentication type', () => {
    props.cloudProvider = CloudProviderEnum.GCP

    renderWithProviders(wrapWithReactHookForm(<ClusterCredentialsModal {...props} />))

    expect(screen.getByText('Authentication type')).toBeInTheDocument()
    expect(screen.getByText('Workload Identity Federation (preferred)')).toBeInTheDocument()
    expect(screen.getByText('1. Connect to your GCP Console and create/open a project')).toBeInTheDocument()
    expect(screen.getByText('2. Generate and run the Workload Identity Federation setup command')).toBeInTheDocument()
    expect(screen.getByText('3. Copy the generated parameters here')).toBeInTheDocument()
    expect(screen.getByTestId('input-gcp-service-account-email')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Learn more' })).toHaveAttribute(
      'href',
      'https://www.qovery.com/docs/getting-started/installation/gcp#generate-the-workload-identity-federation-setup-command'
    )
    expect(
      screen.getByText(
        /curl https:\/\/setup\.qovery\.com\/create_credentials_gcp_wif\.sh \| \\ bash -s -- \$GOOGLE_CLOUD_PROJECT qovery-service-account/
      )
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'How to generate setup command' })).not.toBeInTheDocument()
  })

  it('should keep legacy GCP documentation link for static credentials', async () => {
    props.cloudProvider = CloudProviderEnum.GCP

    renderWithProviders(wrapWithReactHookForm(<ClusterCredentialsModal {...props} />))

    expect(screen.getByText('Authentication type')).toBeInTheDocument()

    await selectEvent.select(screen.getByLabelText('Authentication type'), 'Static credentials', {
      container: document.body,
    })

    expect(screen.getByTestId('input-credentials-json')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Learn more' })).toHaveAttribute(
      'href',
      'https://www.qovery.com/docs/getting-started/installation/gcp#generate-installation-command'
    )
  })

  it('should format GCP WIF credentials correctly with handleSubmit', () => {
    const data = {
      name: 'gcp-wif-cred',
      type: 'WIF',
      service_account_email: 'qovery@my-project.iam.gserviceaccount.com',
      workload_identity_provider_resource:
        'projects/123456789/locations/global/workloadIdentityPools/qovery/providers/qovery-provider',
    }

    const result = handleSubmit(data, CloudProviderEnum.GCP)

    expect(result).toEqual({
      cloudProvider: 'GCP',
      payload: {
        name: 'gcp-wif-cred',
        credential_type: 'WIF',
        service_account_email: 'qovery@my-project.iam.gserviceaccount.com',
        workload_identity_provider_resource:
          'projects/123456789/locations/global/workloadIdentityPools/qovery/providers/qovery-provider',
      },
    })
  })

  it('should format GCP static credentials correctly with handleSubmit', () => {
    const data = {
      name: 'gcp-static-cred',
      type: 'STATIC',
      gcp_credentials: 'base64-json',
    }

    const result = handleSubmit(data, CloudProviderEnum.GCP)

    expect(result).toEqual({
      cloudProvider: 'GCP',
      payload: {
        name: 'gcp-static-cred',
        credential_type: 'SERVICE_ACCOUNT_KEY',
        gcp_credentials: 'base64-json',
      },
    })
  })

  describe('Edit mode', () => {
    beforeEach(() => {
      props.credential = {
        id: 'cred-123',
        name: 'existing-cred',
        role_arn: 'arn:aws:role',
        object_type: 'AWS_ROLE',
      }
    })

    it('should render form and handle edit submission', async () => {
      mockEditCredential.mockResolvedValue({ id: 'cred-123', name: 'updated-name' })

      const { userEvent } = renderWithProviders(wrapWithReactHookForm(<ClusterCredentialsModal {...props} />))

      expect(screen.getByText('Edit credential')).toBeInTheDocument()
      expect(screen.getByText(/The credential change won't be applied/)).toBeInTheDocument()

      const nameInput = screen.getByTestId('input-name')
      await userEvent.clear(nameInput)
      await userEvent.type(nameInput, 'updated-name')

      const submitButton = screen.getByTestId('submit-button')
      await userEvent.click(submitButton)

      expect(mockEditCredential).toHaveBeenCalled()
    })

    it('should handle delete confirmation', async () => {
      const { userEvent } = renderWithProviders(wrapWithReactHookForm(<ClusterCredentialsModal {...props} />))

      const deleteButton = screen.getByTestId('delete-button')
      await userEvent.click(deleteButton)

      const confirmationInput = screen.getByTestId('input-value')
      await userEvent.type(confirmationInput, 'delete')

      const modalTitle = screen.getByText('Delete credential')
      expect(modalTitle).toBeInTheDocument()

      const confirmationModal = modalTitle.parentElement

      if (confirmationModal) {
        const confirmButton = getByText(confirmationModal, 'Confirm')
        await userEvent.click(confirmButton)
      }

      expect(mockDeleteCredential).toHaveBeenCalled()
    })
  })
})
