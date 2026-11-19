import * as iamFeature from '@qovery/shared/iam/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { BillingAccessGuard } from './billing-access-guard'

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-1' }),
}))

const useCanManageBillingSpy = jest.spyOn(iamFeature, 'useCanManageBilling')

describe('BillingAccessGuard', () => {
  it('renders the billing page for billing roles', () => {
    useCanManageBillingSpy.mockReturnValue({ canManageBilling: true, loading: false })
    renderWithProviders(
      <BillingAccessGuard>
        <p>Billing content</p>
      </BillingAccessGuard>
    )

    expect(useCanManageBillingSpy).toHaveBeenCalledWith('org-1')
    expect(screen.getByText('Billing content')).toBeInTheDocument()
  })

  it('renders a restricted state for other roles', () => {
    useCanManageBillingSpy.mockReturnValue({ canManageBilling: false, loading: false })
    renderWithProviders(
      <BillingAccessGuard>
        <p>Billing content</p>
      </BillingAccessGuard>
    )

    expect(screen.queryByText('Billing content')).not.toBeInTheDocument()
    expect(
      screen.getByText('Only Owners, Admins and Billing Managers can see billing. Ask one of them.')
    ).toBeInTheDocument()
  })

  it('renders nothing while roles are loading', () => {
    useCanManageBillingSpy.mockReturnValue({ canManageBilling: false, loading: true })
    renderWithProviders(
      <BillingAccessGuard>
        <p>Billing content</p>
      </BillingAccessGuard>
    )

    expect(screen.queryByText('Billing content')).not.toBeInTheDocument()
    expect(screen.queryByText(/Only Owners/)).not.toBeInTheDocument()
  })
})
