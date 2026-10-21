import { renderWithProviders } from '@qovery/shared/util-tests'
import OnboardingPlans from './onboarding-plans'

jest.mock('@qovery/domains/organizations/feature', () => ({
  ...jest.requireActual('@qovery/domains/organizations/feature'),
  useOrganizations: () => ({ data: [] }),
}))

jest.mock('@qovery/domains/users-sign-up/feature', () => ({
  ...jest.requireActual('@qovery/domains/users-sign-up/feature'),
  useUserSignUp: () => ({ data: { first_name: 'John', last_name: 'Doe' }, refetch: jest.fn() }),
  useCreateUserSignUp: () => ({ mutateAsync: jest.fn() }),
}))

describe('OnboardingPlans', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<OnboardingPlans />)
    expect(baseElement).toBeTruthy()
  })
})
