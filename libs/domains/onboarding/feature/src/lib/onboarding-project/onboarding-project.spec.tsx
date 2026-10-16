import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import OnboardingProject from './onboarding-project'

const mockNavigate = jest.fn()
const mockOrganizations = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => mockNavigate,
}))
jest.mock('@qovery/domains/organizations/feature', () => ({
  ...jest.requireActual('@qovery/domains/organizations/feature'),
  useOrganizations: () => mockOrganizations(),
}))
jest.mock('../create-organization-modal/create-organization-modal', () => ({
  CreateOrganizationModal: ({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) => (
    <>
      <button onClick={onClose}>Cancel creation</button>
      <button onClick={onCreated}>Complete creation</button>
    </>
  ),
}))

describe('OnboardingProject legacy modal route', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    mockOrganizations.mockReturnValue({ data: [] })
  })
  afterEach(() => jest.useRealTimers())

  it('can open after the last organization is deleted and safely cancel', async () => {
    const { userEvent } = renderWithProviders(<OnboardingProject />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel creation' }))
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/', replace: true })
  })

  it('closes after successful creation without navigating back to the previous organization', async () => {
    const { userEvent } = renderWithProviders(<OnboardingProject previousUrl="/organization/existing/overview" />)
    await userEvent.click(screen.getByRole('button', { name: 'Complete creation' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('returns to the supplied platform location on cancel', async () => {
    const { userEvent } = renderWithProviders(<OnboardingProject previousUrl="/organization/existing/overview" />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel creation' }))
    expect(mockNavigate).toHaveBeenCalledWith({ href: '/organization/existing/overview', replace: true })
  })

  it('returns to an existing organization when no previous location is supplied', async () => {
    mockOrganizations.mockReturnValue({ data: [{ id: 'existing' }] })
    const { userEvent } = renderWithProviders(<OnboardingProject />)
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/overview',
      params: { organizationId: 'existing' },
      replace: true,
    })
  })
})
