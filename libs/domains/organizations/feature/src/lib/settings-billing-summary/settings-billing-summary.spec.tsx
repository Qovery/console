import { PlanEnum } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { creditCardsFactoryMock } from '@qovery/shared/factories'
import { useUserRole } from '@qovery/shared/iam/feature'
import * as sharedUi from '@qovery/shared/ui'
import { useDocumentTitle, useSupportChat } from '@qovery/shared/util-hooks'
import { costToHuman, formatPlanDisplay } from '@qovery/shared/util-js'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useCreditCards } from '../hooks/use-credit-cards/use-credit-cards'
import { useCurrentCost } from '../hooks/use-current-cost/use-current-cost'
import {
  PageOrganizationBillingSummary,
  type PageOrganizationBillingSummaryProps,
  SettingsBillingSummary,
} from './settings-billing-summary'

jest.mock('../hooks/use-credit-cards/use-credit-cards')
jest.mock('../hooks/use-current-cost/use-current-cost')
jest.mock('@qovery/domains/users-sign-up/feature')
jest.mock('@qovery/shared/iam/feature')
jest.mock('@qovery/shared/util-hooks')
jest.mock('./invoices-list-feature/invoices-list-feature', () => ({
  __esModule: true,
  default: () => null,
}))

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: '1' }),
  useNavigate: () => jest.fn(),
  Link: ({ children, ...props }: { children: ReactNode }) => <a {...props}>{children}</a>,
}))

const creditCardsMock = creditCardsFactoryMock(1)

const currentCostMock = {
  plan: PlanEnum.ENTERPRISE,
  cost: { total: 56000, currency_code: 'USD', total_in_cents: 5600000 },
  renewal_at: '2021-01-01',
  remaining_trial_day: 0,
}

const pageProps: PageOrganizationBillingSummaryProps = {
  creditCard: creditCardsMock[0],
  currentCost: currentCostMock,
  hasCreditCard: true,
  onPromoCodeClick: jest.fn(),
  onShowUsageClick: jest.fn(),
  onChangePlanClick: jest.fn(),
}

describe('PageOrganizationBillingSummary', () => {
  const useUserSignUpMock = useUserSignUp as jest.MockedFunction<typeof useUserSignUp>

  beforeEach(() => {
    jest.clearAllMocks()
    useUserSignUpMock.mockReturnValue({
      data: { dx_auth: false },
    } as unknown as ReturnType<typeof useUserSignUp>)
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageOrganizationBillingSummary {...pageProps} />)
    expect(baseElement).toBeTruthy()
  })

  it('should display plan and bill details', () => {
    renderWithProviders(<PageOrganizationBillingSummary {...pageProps} />)
    screen.getByText('Current plan')
    screen.getByText(formatPlanDisplay(currentCostMock.plan))
    screen.getByText('Current bill')
    screen.getByText(costToHuman(currentCostMock.cost.total, currentCostMock.cost.currency_code))
  })

  it('should say that no credit card was found', () => {
    renderWithProviders(<PageOrganizationBillingSummary {...pageProps} creditCard={undefined} hasCreditCard={false} />)
    screen.getByText('No credit card provided')
  })

  it('should call onShowUsageClick on click', async () => {
    const { userEvent } = renderWithProviders(<PageOrganizationBillingSummary {...pageProps} />)
    await userEvent.click(screen.getByText(/show usage/i))
    expect(pageProps.onShowUsageClick).toHaveBeenCalled()
  })

  it('should call onChangePlanClick on click', async () => {
    const { userEvent } = renderWithProviders(<PageOrganizationBillingSummary {...pageProps} />)
    await userEvent.click(screen.getByText(/change plan/i))
    expect(pageProps.onChangePlanClick).toHaveBeenCalled()
  })

  it('should call onPromoCodeClick on click', async () => {
    const { userEvent } = renderWithProviders(<PageOrganizationBillingSummary {...pageProps} />)
    await userEvent.click(screen.getByText(/promo code/i))
    expect(pageProps.onPromoCodeClick).toHaveBeenCalled()
  })

  it('should not display the payment method box for free plan', () => {
    renderWithProviders(
      <PageOrganizationBillingSummary
        {...pageProps}
        currentCost={{
          ...currentCostMock,
          plan: PlanEnum.FREE,
        }}
      />
    )
    expect(screen.queryByText('Payment method')).not.toBeInTheDocument()
  })
})

describe('SettingsBillingSummary', () => {
  const useCreditCardsMock = useCreditCards as jest.MockedFunction<typeof useCreditCards>
  const useCurrentCostMock = useCurrentCost as jest.MockedFunction<typeof useCurrentCost>
  const useUserSignUpMock = useUserSignUp as jest.MockedFunction<typeof useUserSignUp>
  const useUserRoleMock = useUserRole as jest.MockedFunction<typeof useUserRole>
  const useSupportChatMock = useSupportChat as jest.MockedFunction<typeof useSupportChat>
  const useDocumentTitleMock = useDocumentTitle as jest.MockedFunction<typeof useDocumentTitle>
  const useModalSpy = jest.spyOn(sharedUi, 'useModal')

  beforeEach(() => {
    useCreditCardsMock.mockReturnValue({
      data: creditCardsMock,
    } as unknown as ReturnType<typeof useCreditCards>)
    useCurrentCostMock.mockReturnValue({
      data: currentCostMock,
    } as unknown as ReturnType<typeof useCurrentCost>)
    useUserSignUpMock.mockReturnValue({
      data: { dx_auth: false },
    } as unknown as ReturnType<typeof useUserSignUp>)
    useUserRoleMock.mockReturnValue({
      isQoveryAdminUser: true,
    } as unknown as ReturnType<typeof useUserRole>)
    useSupportChatMock.mockReturnValue({
      showChat: jest.fn(),
    } as unknown as ReturnType<typeof useSupportChat>)
    useDocumentTitleMock.mockImplementation(() => undefined)
    useModalSpy.mockReturnValue({
      openModal: jest.fn(),
      closeModal: jest.fn(),
    } as unknown as ReturnType<typeof sharedUi.useModal>)
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<SettingsBillingSummary />)
    expect(baseElement).toBeTruthy()
  })

  it('should fetch credit cards and current cost', () => {
    renderWithProviders(<SettingsBillingSummary />)

    expect(useCreditCardsMock).toHaveBeenCalledWith({ organizationId: '1', suspense: true })
    expect(useCurrentCostMock).toHaveBeenCalledWith({ organizationId: '1', suspense: true })
  })
})
