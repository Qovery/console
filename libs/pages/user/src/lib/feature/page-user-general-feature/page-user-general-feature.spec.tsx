import { useFeatureFlagEnabled } from 'posthog-js/react'
import * as domainUserFeature from '@qovery/shared/iam/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageUserGeneralFeature from './page-user-general-feature'

jest.mock('posthog-js/react', () => ({
  useFeatureFlagEnabled: jest.fn(() => false),
}))

const useEditUserAccountMockSpy = jest.spyOn(domainUserFeature, 'useEditUserAccount') as jest.Mock
const useUserAccountMockSky = jest.spyOn(domainUserFeature, 'useUserAccount') as jest.Mock
const useConsoleRedirectPreferenceMockSpy = jest.spyOn(domainUserFeature, 'useConsoleRedirectPreference') as jest.Mock
const useFeatureFlagEnabledMock = useFeatureFlagEnabled as jest.MockedFunction<typeof useFeatureFlagEnabled>

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
    useConsoleRedirectPreferenceMockSpy.mockReturnValue({
      useNewConsoleByDefault: false,
      setUseNewConsoleByDefault: jest.fn(),
    })
    useFeatureFlagEnabledMock.mockReturnValue(false)
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

  it('should render the console toggle only when the feature flag is enabled', () => {
    useFeatureFlagEnabledMock.mockReturnValue(true)

    renderWithProviders(<PageUserGeneralFeature />)

    expect(screen.getByText('Use the new console by default')).toBeInTheDocument()
  })
})
