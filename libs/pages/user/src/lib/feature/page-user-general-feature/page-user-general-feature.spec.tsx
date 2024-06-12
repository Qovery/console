import * as domainUserFeature from '@qovery/shared/iam/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageUserGeneralFeature from './page-user-general-feature'

const useEditUserAccountMockSpy = jest.spyOn(domainUserFeature, 'useEditUserAccount') as jest.Mock
const useUserAccountMockSky = jest.spyOn(domainUserFeature, 'useUserAccount') as jest.Mock

describe('PageUserGeneral', () => {
  beforeEach(() => {
    useEditUserAccountMockSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
    useUserAccountMockSky.mockReturnValue({
      data: {
        first_name: 'test',
        last_name: 'test',
        communication_email: '',
      },
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageUserGeneralFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should dispatch postUserSignUp if form is submitted', async () => {
    const { userEvent } = renderWithProviders(<PageUserGeneralFeature />)

    const inputEmail = screen.getByLabelText('Communication email')
    await userEvent.clear(inputEmail)
    await userEvent.type(inputEmail, 'test2@test.com')

    const submitButton = screen.getByRole('button', { name: 'Save' })
    expect(submitButton).toBeEnabled()

    await userEvent.click(submitButton)

    expect(useEditUserAccountMockSpy().mutateAsync).toHaveBeenCalledWith({
      first_name: 'test',
      last_name: 'test',
      communication_email: 'test2@test.com',
    })
  })
})
