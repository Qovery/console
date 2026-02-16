import { createElement } from 'react'
import { IntercomProvider } from 'react-use-intercom'
import { useOrganizations } from '@qovery/domains/organizations/feature'
import { useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { renderWithProviders } from '@qovery/shared/util-tests'
import Container, { type ContainerProps } from './container'

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useLocation: () => ({ pathname: '/personalize', search: '', state: undefined }),
  useNavigate: () => jest.fn(),
  useParams: () => ({ organizationId: 'org-1' }),
  useMatches: () => [{ routeId: '/_authenticated/onboarding' }],
}))

jest.mock('@qovery/domains/organizations/feature', () => ({
  ...jest.requireActual('@qovery/domains/organizations/feature'),
  useOrganizations: jest.fn(),
}))

jest.mock('@qovery/domains/users-sign-up/feature', () => ({
  ...jest.requireActual('@qovery/domains/users-sign-up/feature'),
  useUserSignUp: jest.fn(),
}))

const useOrganizationsMock = useOrganizations as jest.Mock
const useUserSignUpMock = useUserSignUp as jest.Mock

describe('Container', () => {
  let props: ContainerProps

  beforeEach(() => {
    props = {
      children: createElement('div'),
      params: {
        '*': 'some-value',
      },
      firstStep: true,
    }
    useOrganizationsMock.mockReturnValue({ data: [] })
    useUserSignUpMock.mockReturnValue({ data: undefined })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <IntercomProvider appId="__test__app__id__" autoBoot={false}>
        <Container {...props} />
      </IntercomProvider>
    )
    expect(baseElement).toBeTruthy()
  })
})
