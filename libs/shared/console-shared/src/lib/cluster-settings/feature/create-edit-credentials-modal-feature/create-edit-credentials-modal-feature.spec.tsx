import { CloudProviderEnum } from 'qovery-typescript-axios'
import * as cloudProvidersDomain from '@qovery/domains/cloud-providers/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import CreateEditCredentialsModalFeature, {
  type CreateEditCredentialsModalFeatureProps,
  handleSubmit,
} from './create-edit-credentials-modal-feature'

const useCreateCloudProviderCredentialsMockSpy = jest.spyOn(
  cloudProvidersDomain,
  'useCreateCloudProviderCredential'
) as jest.Mock
const useEditCloudProviderCredentialsMockSpy = jest.spyOn(
  cloudProvidersDomain,
  'useEditCloudProviderCredential'
) as jest.Mock
const useDeleteCloudProviderCredentialsMockSpy = jest.spyOn(
  cloudProvidersDomain,
  'useDeleteCloudProviderCredential'
) as jest.Mock

const props: CreateEditCredentialsModalFeatureProps = {
  onClose: jest.fn(),
  cloudProvider: CloudProviderEnum.AWS,
  organizationId: '0',
  currentCredential: {
    id: '000-000-000',
    name: 'my-credential',
  },
}

describe('CreateEditCredentialsModalFeature', () => {
  beforeEach(() => {
    useCreateCloudProviderCredentialsMockSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
    useEditCloudProviderCredentialsMockSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
    useDeleteCloudProviderCredentialsMockSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<CreateEditCredentialsModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should submit edit credential on click on button for AWS', async () => {
    const { userEvent } = renderWithProviders(<CreateEditCredentialsModalFeature {...props} />)

    const inputName = screen.getByTestId('input-name')
    const inputAccessKey = screen.getByTestId('input-access-key')

    await userEvent.clear(inputName)

    await userEvent.type(inputName, 'test')
    await userEvent.type(inputAccessKey, 'access')

    const inputSecretKey = screen.getByTestId('input-secret-key')
    await userEvent.type(inputSecretKey, 'secret')

    const submitButton = screen.getByTestId('submit-button')
    await userEvent.click(submitButton)

    expect(useEditCloudProviderCredentialsMockSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '0',
      credentialId: '000-000-000',
      ...handleSubmit(
        {
          name: 'test',
          access_key_id: 'access',
          secret_access_key: 'secret',
        },
        CloudProviderEnum.AWS
      ),
    })
  })

  it('should submit edit credential on click on button for SCW', async () => {
    props.cloudProvider = CloudProviderEnum.SCW

    const { userEvent } = renderWithProviders(<CreateEditCredentialsModalFeature {...props} />)

    const inputName = screen.getByTestId('input-name')
    const inputAccessKey = screen.getByTestId('input-scw-access-key')
    const inputProjectId = screen.getByTestId('input-scw-project-id')
    const inputOrganizationId = screen.getByTestId('input-scw-organization-id')

    await userEvent.clear(inputName)

    await userEvent.type(inputName, 'test')
    await userEvent.type(inputAccessKey, 'access')

    const inputSecretKey = screen.getByTestId('input-scw-secret-key')
    await userEvent.type(inputSecretKey, 'secret')
    await userEvent.type(inputProjectId, 'project')
    await userEvent.type(inputOrganizationId, 'organization')

    const submitButton = screen.getByTestId('submit-button')
    await userEvent.click(submitButton)

    expect(useEditCloudProviderCredentialsMockSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '0',
      credentialId: '000-000-000',
      ...handleSubmit(
        {
          name: 'test',
          scaleway_access_key: 'access',
          scaleway_secret_key: 'secret',
          scaleway_project_id: 'project',
          scaleway_organization_id: 'organization',
        },
        CloudProviderEnum.SCW
      ),
    })
  })

  it('should submit edit credential on click on button for GCP', async () => {
    props.cloudProvider = CloudProviderEnum.GCP

    const { userEvent } = renderWithProviders(<CreateEditCredentialsModalFeature {...props} />)

    const inputName = screen.getByTestId('input-name')
    const inputCredentialsJson = screen.getByTestId('input-credentials-json')

    await userEvent.clear(inputName)
    await userEvent.type(inputName, 'test')

    const value = '{"json":"json"}'
    const file = new File([value], 'values.json', {
      type: 'application/json',
    })

    await userEvent.upload(inputCredentialsJson, file)

    const submitButton = screen.getByTestId('submit-button')
    await userEvent.click(submitButton)

    expect(useEditCloudProviderCredentialsMockSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '0',
      credentialId: '000-000-000',
      ...handleSubmit(
        {
          name: 'test',
          gcp_credentials: btoa(value),
        },
        CloudProviderEnum.GCP
      ),
    })
  })

  it('should submit create credential on click on button for AWS', async () => {
    props.currentCredential = undefined
    props.cloudProvider = CloudProviderEnum.AWS

    const { userEvent } = renderWithProviders(<CreateEditCredentialsModalFeature {...props} />)

    const inputName = screen.getByTestId('input-name')
    const inputAccessKey = screen.getByTestId('input-access-key')
    const inputSecretKey = screen.getByTestId('input-secret-key')

    await userEvent.type(inputName, 'test')
    await userEvent.type(inputAccessKey, 'access')
    await userEvent.type(inputSecretKey, 'secret')

    const submitButton = screen.getByTestId('submit-button')
    await userEvent.click(submitButton)

    expect(useCreateCloudProviderCredentialsMockSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '0',
      ...handleSubmit(
        {
          name: 'test',
          access_key_id: 'access',
          secret_access_key: 'secret',
        },
        CloudProviderEnum.AWS
      ),
    })
  })

  it('should submit create credential on click on button for SCW', async () => {
    props.currentCredential = undefined
    props.cloudProvider = CloudProviderEnum.SCW

    const { userEvent } = renderWithProviders(<CreateEditCredentialsModalFeature {...props} />)

    const inputName = screen.getByTestId('input-name')
    const inputAccessKey = screen.getByTestId('input-scw-access-key')
    const inputSecretKey = screen.getByTestId('input-scw-secret-key')
    const inputProjectId = screen.getByTestId('input-scw-project-id')
    const inputOrganizationId = screen.getByTestId('input-scw-organization-id')

    await userEvent.type(inputName, 'test')
    await userEvent.type(inputAccessKey, 'access')
    await userEvent.type(inputSecretKey, 'secret')
    await userEvent.type(inputProjectId, 'project')
    await userEvent.type(inputOrganizationId, 'organization')

    const submitButton = screen.getByTestId('submit-button')
    await userEvent.click(submitButton)

    expect(useCreateCloudProviderCredentialsMockSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '0',
      ...handleSubmit(
        {
          name: 'test',
          scaleway_access_key: 'access',
          scaleway_secret_key: 'secret',
          scaleway_project_id: 'project',
          scaleway_organization_id: 'organization',
        },
        CloudProviderEnum.SCW
      ),
    })
  })
})
