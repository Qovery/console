import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { CloudProviderEnum, type ClusterCredentials } from 'qovery-typescript-axios'
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
        isGcpWifEnabled: false,
      })
    ).toBe('EKS_ANYWHERE_VSPHERE_ROLE')

    expect(
      getDefaultClusterCredentialType({
        credential: { object_type: 'EKS_ANYWHERE_VSPHERE' } as ClusterCredentials,
        isEdit: true,
        isAwsMode: true,
        isGcpMode: false,
        isGcpWifEnabled: false,
      })
    ).toBe('EKS_ANYWHERE_VSPHERE_STATIC')

    expect(
      getDefaultClusterCredentialType({
        credential: { object_type: 'GCP_WORKLOAD_IDENTITY_FEDERATION' } as ClusterCredentials,
        isEdit: true,
        isAwsMode: false,
        isGcpMode: true,
        isGcpWifEnabled: true,
      })
    ).toBe('WIF')

    expect(
      getDefaultClusterCredentialType({
        credential: { object_type: 'GCP' } as ClusterCredentials,
        isEdit: true,
        isAwsMode: false,
        isGcpMode: true,
        isGcpWifEnabled: true,
      })
    ).toBe('STATIC')

    expect(
      getDefaultClusterCredentialType({
        credential: { object_type: 'AWS_ROLE' } as ClusterCredentials,
        isEdit: true,
        isAwsMode: true,
        isGcpMode: false,
        isGcpWifEnabled: true,
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
        isGcpWifEnabled: false,
      })
    ).toBe('STS')

    expect(
      getDefaultClusterCredentialType({
        credential: undefined,
        isEdit: false,
        isAwsMode: false,
        isGcpMode: true,
        isGcpWifEnabled: true,
      })
    ).toBe('WIF')

    expect(
      getDefaultClusterCredentialType({
        credential: undefined,
        isEdit: false,
        isAwsMode: false,
        isGcpMode: true,
        isGcpWifEnabled: false,
      })
    ).toBe('STATIC')

    expect(
      getDefaultClusterCredentialType({
        credential: undefined,
        isEdit: true,
        isAwsMode: true,
        isGcpMode: false,
        isGcpWifEnabled: false,
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

  it('should keep legacy GCP documentation link for static credentials', () => {
    props.cloudProvider = CloudProviderEnum.GCP
    mockUseFeatureFlagEnabled.mockReturnValue(false)

    renderWithProviders(wrapWithReactHookForm(<ClusterCredentialsModal {...props} />))

    expect(screen.getByText('Authentication type')).toBeInTheDocument()
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
