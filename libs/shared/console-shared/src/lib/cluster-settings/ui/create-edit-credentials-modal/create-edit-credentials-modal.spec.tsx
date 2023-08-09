import { act, fireEvent, render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import CreateEditCredentialsModal, { CreateEditCredentialsModalProps } from './create-edit-credentials-modal'

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
    const { baseElement } = render(wrapWithReactHookForm(<CreateEditCredentialsModal {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form with fields AWS', async () => {
    props.cloudProvider = CloudProviderEnum.AWS

    const { getByDisplayValue } = render(
      wrapWithReactHookForm(<CreateEditCredentialsModal {...props} />, {
        defaultValues: {
          name: 'credentials',
          access_key_id: 'access-key-id',
          secret_access_key: 'secret-access-key',
        },
      })
    )

    getByDisplayValue('credentials')
    getByDisplayValue('access-key-id')
    getByDisplayValue('secret-access-key')
  })

  it('should render the form with fields SCW', async () => {
    props.cloudProvider = CloudProviderEnum.SCW

    const { getByDisplayValue } = render(
      wrapWithReactHookForm(<CreateEditCredentialsModal {...props} />, {
        defaultValues: {
          name: 'credentials',
          scaleway_access_key: 'scaleway-access-key',
          scaleway_secret_key: 'scaleway-secret-key',
          scaleway_project_id: 'scaleway-project-id',
        },
      })
    )

    getByDisplayValue('credentials')
    getByDisplayValue('scaleway-access-key')
    getByDisplayValue('scaleway-secret-key')
    getByDisplayValue('scaleway-project-id')
  })

  it('should submit the form on click AWS', async () => {
    const { getByTestId } = render(
      wrapWithReactHookForm(<CreateEditCredentialsModal {...props} />, {
        defaultValues: {
          name: 'credentials',
        },
      })
    )

    const button = getByTestId('submit-button')
    const inputName = getByTestId('input-name')
    const inputAccessKey = getByTestId('input-access-key')
    const inputSecretKey = getByTestId('input-secret-key')

    await act(async () => {
      fireEvent.input(inputName, { target: { value: 'test' } })
      fireEvent.input(inputAccessKey, { target: { value: 'access' } })
      fireEvent.input(inputSecretKey, { target: { value: 'secret' } })
    })

    await act(async () => {
      button?.click()
    })

    expect(button).not.toBeDisabled()
    expect(props.onSubmit).toHaveBeenCalled()
  })
})
