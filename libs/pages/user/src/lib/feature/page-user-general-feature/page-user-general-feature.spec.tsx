import * as storeUser from '@qovery/domains/user'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageUserGeneralFeature from './page-user-general-feature'

import SpyInstance = jest.SpyInstance

jest.mock('@qovery/domains/user', () => {
  return {
    ...jest.requireActual('@qovery/domains/user'),
    postUserSignUp: jest.fn(),
    selectUser: () => {
      return {
        sub: 'github|123456',
        email: 'test@test.com',
      }
    },
    selectUserSignUp: () => {
      return {
        first_name: 'firstname',
        last_name: 'lastname',
        user_email: 'test-2@test.com',
      }
    },
  }
})

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

describe('PageUserGeneral', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageUserGeneralFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should dispatch postUserSignUp if form is submitted', async () => {
    const postUserSignUpSpy: SpyInstance = jest.spyOn(storeUser, 'postUserSignUp')
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))

    const { userEvent } = renderWithProviders(<PageUserGeneralFeature />)

    const inputFirstName = screen.getByLabelText('First name')
    await userEvent.clear(inputFirstName)
    await userEvent.type(inputFirstName, 'john')

    const inputLastName = screen.getByLabelText('Last name')
    await userEvent.clear(inputLastName)
    await userEvent.type(inputLastName, 'doe')

    const inputEmail = screen.getByLabelText('Communication email')
    await userEvent.clear(inputEmail)
    await userEvent.type(inputEmail, 'test2@test.com')

    const submitButton = screen.getByRole('button', { name: 'Save' })
    expect(submitButton).not.toBeDisabled()

    await userEvent.click(submitButton)

    expect(postUserSignUpSpy.mock.calls[0][0]).toStrictEqual({
      first_name: 'john',
      last_name: 'doe',
      user_email: 'test2@test.com',
    })
  })
})
