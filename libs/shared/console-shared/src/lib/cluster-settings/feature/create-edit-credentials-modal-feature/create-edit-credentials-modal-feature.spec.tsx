import { act, fireEvent, render } from '__tests__/utils/setup-jest'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import * as storeOrganization from '@qovery/domains/organization'
import { organizationFactoryMock } from '@qovery/shared/factories'
import { OrganizationEntity } from '@qovery/shared/interfaces'
import CreateEditCredentialsModalFeature, {
  CreateEditCredentialsModalFeatureProps,
  handleSubmit,
} from './create-edit-credentials-modal-feature'

let props: CreateEditCredentialsModalFeatureProps

const mockOrganization: OrganizationEntity = organizationFactoryMock(1)[0]

jest.mock('@qovery/domains/organization', () => ({
  ...jest.requireActual('@qovery/domains/organization'),
  editCredentials: jest.fn(),
  postCredentials: jest.fn(),
}))

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

describe('CreateEditCredentialsModalFeature', () => {
  beforeEach(() => {
    props = {
      onClose: jest.fn(),
      cloudProvider: CloudProviderEnum.AWS,
      organizationId: '0',
      currentCredential: mockOrganization.credentials?.items && mockOrganization.credentials?.items[0],
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('should render successfully', () => {
    const { baseElement } = render(<CreateEditCredentialsModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should submit editCredentials on click on button for AWS', async () => {
    const spy = jest.spyOn(storeOrganization, 'editCredentials')
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))

    const { getByTestId } = render(<CreateEditCredentialsModalFeature {...props} />)

    const inputName = getByTestId('input-name')
    const inputAccessKey = getByTestId('input-access-key')
    const inputSecretKey = getByTestId('input-secret-key')

    await act(async () => {
      fireEvent.input(inputName, { target: { value: 'test' } })
      fireEvent.input(inputAccessKey, { target: { value: 'access' } })
      fireEvent.input(inputSecretKey, { target: { value: 'secret' } })
    })

    const submitButton = getByTestId('submit-button')
    await act(async () => {
      fireEvent.click(submitButton)
    })

    expect(spy).toHaveBeenCalledWith({
      cloudProvider: CloudProviderEnum.AWS,
      organizationId: '0',
      credentialsId: props.currentCredential?.id,
      credentials: handleSubmit(
        {
          name: 'test',
          access_key_id: 'access',
          secret_access_key: 'secret',
        },
        CloudProviderEnum.AWS
      ),
    })
  })

  it('should submit editCredentials on click on button for SCW', async () => {
    props.cloudProvider = CloudProviderEnum.SCW

    const spy = jest.spyOn(storeOrganization, 'editCredentials')
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))

    const { getByTestId } = render(<CreateEditCredentialsModalFeature {...props} />)

    const inputName = getByTestId('input-name')
    const inputAccessKey = getByTestId('input-scw-access-key')
    const inputSecretKey = getByTestId('input-scw-secret-key')
    const inputProjectId = getByTestId('input-scw-project-id')

    await act(async () => {
      fireEvent.input(inputName, { target: { value: 'test' } })
      fireEvent.input(inputAccessKey, { target: { value: 'access' } })
      fireEvent.input(inputSecretKey, { target: { value: 'secret' } })
      fireEvent.input(inputProjectId, { target: { value: 'project' } })
    })

    const submitButton = getByTestId('submit-button')
    await act(async () => {
      fireEvent.click(submitButton)
    })

    expect(spy).toHaveBeenCalledWith({
      cloudProvider: CloudProviderEnum.SCW,
      organizationId: '0',
      credentialsId: props.currentCredential?.id,
      credentials: handleSubmit(
        {
          name: 'test',
          scaleway_access_key: 'access',
          scaleway_secret_key: 'secret',
          scaleway_project_id: 'project',
        },
        CloudProviderEnum.SCW
      ),
    })
  })

  it('should submit postCredentials on click on button for AWS', async () => {
    props.currentCredential = undefined

    const spy = jest.spyOn(storeOrganization, 'postCredentials')
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))

    const { getByTestId } = render(<CreateEditCredentialsModalFeature {...props} />)

    const inputName = getByTestId('input-name')
    const inputAccessKey = getByTestId('input-access-key')
    const inputSecretKey = getByTestId('input-secret-key')

    await act(async () => {
      fireEvent.input(inputName, { target: { value: 'test' } })
      fireEvent.input(inputAccessKey, { target: { value: 'access' } })
      fireEvent.input(inputSecretKey, { target: { value: 'secret' } })
    })

    const submitButton = getByTestId('submit-button')
    await act(async () => {
      fireEvent.click(submitButton)
    })

    expect(spy).toHaveBeenCalledWith({
      cloudProvider: CloudProviderEnum.AWS,
      organizationId: '0',
      credentials: handleSubmit(
        {
          name: 'test',
          access_key_id: 'access',
          secret_access_key: 'secret',
        },
        CloudProviderEnum.AWS
      ),
    })
  })

  it('should submit postCredentials on click on button for SCW', async () => {
    props.currentCredential = undefined
    props.cloudProvider = CloudProviderEnum.SCW

    const spy = jest.spyOn(storeOrganization, 'postCredentials')
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))

    const { getByTestId } = render(<CreateEditCredentialsModalFeature {...props} />)

    const inputName = getByTestId('input-name')
    const inputAccessKey = getByTestId('input-scw-access-key')
    const inputSecretKey = getByTestId('input-scw-secret-key')
    const inputProjectId = getByTestId('input-scw-project-id')

    await act(async () => {
      fireEvent.input(inputName, { target: { value: 'test' } })
      fireEvent.input(inputAccessKey, { target: { value: 'access' } })
      fireEvent.input(inputSecretKey, { target: { value: 'secret' } })
      fireEvent.input(inputProjectId, { target: { value: 'project' } })
    })

    const submitButton = getByTestId('submit-button')
    await act(async () => {
      fireEvent.click(submitButton)
    })

    expect(spy).toHaveBeenCalledWith({
      cloudProvider: CloudProviderEnum.SCW,
      organizationId: '0',
      credentials: handleSubmit(
        {
          name: 'test',
          scaleway_access_key: 'access',
          scaleway_secret_key: 'secret',
          scaleway_project_id: 'project',
        },
        CloudProviderEnum.SCW
      ),
    })
  })
})
