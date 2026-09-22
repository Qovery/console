import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import OnboardingProject from './onboarding-project'

const mockedUsedNavigate = jest.fn()
const mockCreateOrganization = jest.fn()
const mockCreateProject = jest.fn()
const mockCreateUserSignUp = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => mockedUsedNavigate,
}))

jest.mock('@elgorditosalsero/react-gtm-hook', () => ({
  useGTMDispatch: () => jest.fn(),
}))

jest.mock('@qovery/shared/auth', () => ({
  ...jest.requireActual('@qovery/shared/auth'),
  useAuth: () => ({
    user: {
      email: 'user@qovery.com',
    },
    getAccessTokenSilently: jest.fn(),
  }),
}))

jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useDocumentTitle: () => undefined,
}))

jest.mock('@qovery/domains/organizations/feature', () => ({
  ...jest.requireActual('@qovery/domains/organizations/feature'),
  useCreateOrganization: () => ({ mutateAsync: mockCreateOrganization }),
  useOrganizations: () => ({ data: [] }),
}))

jest.mock('@qovery/domains/projects/feature', () => ({
  ...jest.requireActual('@qovery/domains/projects/feature'),
  useCreateProject: () => ({ mutateAsync: mockCreateProject }),
}))

jest.mock('@qovery/domains/users-sign-up/feature', () => ({
  ...jest.requireActual('@qovery/domains/users-sign-up/feature'),
  useCreateUserSignUp: () => ({ mutateAsync: mockCreateUserSignUp }),
  useUserSignUp: jest.fn(),
}))

const { useUserSignUp } = jest.requireMock('@qovery/domains/users-sign-up/feature') as {
  useUserSignUp: jest.Mock
}

describe('OnboardingProject', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateOrganization.mockResolvedValue({ id: 'organization-id' })
    mockCreateProject.mockResolvedValue(undefined)
    mockCreateUserSignUp.mockResolvedValue(undefined)
    useUserSignUp.mockReturnValue({
      data: {
        first_name: 'Jane',
        last_name: 'Doe',
        company_name: 'Acme',
        user_email: 'user@qovery.com',
      },
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<OnboardingProject />)
    expect(baseElement).toBeTruthy()
  })

  it('should redirect to personalize for the standard onboarding flow', async () => {
    const { userEvent } = renderWithProviders(<OnboardingProject />)

    await userEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(mockedUsedNavigate).toHaveBeenCalledWith({ to: '/onboarding/use-cases' })
  })

  it('should redirect to the previous url when it is provided', async () => {
    const { userEvent } = renderWithProviders(<OnboardingProject previousUrl="/organization/org-previous/overview" />)

    await userEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      href: '/organization/org-previous/overview',
      replace: true,
    })
  })

  it('should create an organization without requesting billing details', async () => {
    const { userEvent } = renderWithProviders(<OnboardingProject />)

    await userEvent.type(screen.getByLabelText('Organization name'), 'Acme')
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(mockCreateOrganization).toHaveBeenCalledTimes(1)
    expect(mockCreateProject).toHaveBeenCalledWith({
      organizationId: 'organization-id',
      projectRequest: { name: 'main' },
    })
  })
})
