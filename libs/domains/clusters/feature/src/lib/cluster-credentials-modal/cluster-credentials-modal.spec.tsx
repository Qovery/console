import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import * as useCreateCloudProviderCredentialHook from '@qovery/domains/cloud-providers/feature'
import * as useEditCloudProviderCredentialHook from '@qovery/domains/cloud-providers/feature'
import * as useDeleteCloudProviderCredentialHook from '@qovery/domains/cloud-providers/feature'
import { getByText, renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useClusterCloudProviderInfoHook from '../hooks/use-cluster-cloud-provider-info/use-cluster-cloud-provider-info'
import ClusterCredentialsModal, { type ClusterCredentialsModalProps, handleSubmit } from './cluster-credentials-modal'

jest.mock('@qovery/domains/cloud-providers/feature', () => ({
  useCreateCloudProviderCredential: jest.fn(),
  useEditCloudProviderCredential: jest.fn(),
  useDeleteCloudProviderCredential: jest.fn(),
}))

jest.mock('../hooks/use-cluster-cloud-provider-info/use-cluster-cloud-provider-info', () => ({
  useClusterCloudProviderInfo: jest.fn(),
}))

let props: ClusterCredentialsModalProps

const mockCreateCredential = jest.fn()
const mockEditCredential = jest.fn()
const mockDeleteCredential = jest.fn()

describe('ClusterCredentialsModal', () => {
  beforeEach(() => {
    props = {
      organizationId: '000',
      clusterId: '000',
      onClose: jest.fn(),
      cloudProvider: CloudProviderEnum.AWS,
    }

    jest.spyOn(useCreateCloudProviderCredentialHook, 'useCreateCloudProviderCredential').mockReturnValue({
      mutateAsync: mockCreateCredential,
      isLoading: false,
    })

    jest.spyOn(useEditCloudProviderCredentialHook, 'useEditCloudProviderCredential').mockReturnValue({
      mutateAsync: mockEditCredential,
      isLoading: false,
    })

    jest.spyOn(useDeleteCloudProviderCredentialHook, 'useDeleteCloudProviderCredential').mockReturnValue({
      mutateAsync: mockDeleteCredential,
    })

    jest.spyOn(useClusterCloudProviderInfoHook, 'useClusterCloudProviderInfo').mockReturnValue({
      data: { cloud_provider: 'AWS' },
      isLoading: false,
    })
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

  it('should handle STS form submission', async () => {
    mockCreateCredential.mockResolvedValue({ id: 'new-cred' })

    const { userEvent } = renderWithProviders(wrapWithReactHookForm(<ClusterCredentialsModal {...props} />))

    const nameInput = screen.getByTestId('input-name')
    const roleArnInput = screen.getByTestId('input-text')
    const submitButton = screen.getByTestId('submit-button')

    await userEvent.type(nameInput, 'test-credential')
    await userEvent.type(roleArnInput, 'arn:aws:iam::123456789012:role/test-role')
    await userEvent.click(submitButton)

    // Verify API was called
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
        role_arn: 'arn:aws:iam::123456789012:role/test-role',
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

      expect(screen.getByText('Edit credentials')).toBeInTheDocument()
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
