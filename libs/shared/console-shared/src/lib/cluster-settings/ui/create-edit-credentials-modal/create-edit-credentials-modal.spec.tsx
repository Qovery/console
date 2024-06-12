import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import CreateEditCredentialsModal, { type CreateEditCredentialsModalProps } from './create-edit-credentials-modal'

let props: CreateEditCredentialsModalProps

describe('CreateEditCredentialsModal', () => {
  beforeEach(() => {
    props = {
      onClose: jest.fn(),
      onSubmit: jest.fn((e) => e.preventDefault()),
      loading: false,
      isEdit: false,
      cloudProvider: CloudProviderEnum.AWS,
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<CreateEditCredentialsModal {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form with fields AWS', async () => {
    props.cloudProvider = CloudProviderEnum.AWS

    renderWithProviders(
      wrapWithReactHookForm(<CreateEditCredentialsModal {...props} />, {
        defaultValues: {
          name: 'credentials',
          access_key_id: 'access-key-id',
          secret_access_key: 'secret-access-key',
        },
      })
    )

    screen.getByDisplayValue('credentials')
    screen.getByDisplayValue('access-key-id')
    screen.getByDisplayValue('secret-access-key')
  })

  it('should render the form with fields SCW', async () => {
    props.cloudProvider = CloudProviderEnum.SCW

    renderWithProviders(
      wrapWithReactHookForm(<CreateEditCredentialsModal {...props} />, {
        defaultValues: {
          name: 'credentials',
          scaleway_access_key: 'scaleway-access-key',
          scaleway_secret_key: 'scaleway-secret-key',
          scaleway_project_id: 'scaleway-project-id',
          scaleway_organization_id: 'scaleway-organization-id',
        },
      })
    )

    screen.getByDisplayValue('credentials')
    screen.getByDisplayValue('scaleway-access-key')
    screen.getByDisplayValue('scaleway-secret-key')
    screen.getByDisplayValue('scaleway-project-id')
  })

  it('should render the form with fields GCP', async () => {
    props.cloudProvider = CloudProviderEnum.GCP

    const { getByDisplayValue } = renderWithProviders(
      wrapWithReactHookForm(<CreateEditCredentialsModal {...props} />, {
        defaultValues: {
          name: 'credentials',
          gcp_credentials: 'gcp-credentials-json',
        },
      })
    )

    getByDisplayValue('credentials')
  })

  it('should submit the form on click AWS', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<CreateEditCredentialsModal {...props} />, {
        defaultValues: {
          name: 'credentials',
        },
      })
    )

    const button = screen.getByTestId('submit-button')
    const inputName = screen.getByTestId('input-name')
    const inputAccessKey = screen.getByTestId('input-access-key')
    const inputSecretKey = screen.getByTestId('input-secret-key')

    await userEvent.type(inputName, 'test')
    await userEvent.type(inputAccessKey, 'access')
    await userEvent.type(inputSecretKey, 'secret')

    await userEvent.click(button)

    expect(button).toBeEnabled()
    expect(props.onSubmit).toHaveBeenCalled()
  })
})
