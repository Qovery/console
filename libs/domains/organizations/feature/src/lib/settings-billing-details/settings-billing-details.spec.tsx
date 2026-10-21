import type CbInstance from '@chargebee/chargebee-js-types/cb-types/models/cb-instance'
import { type BillingInfoRequest } from 'qovery-typescript-axios'
import type { ReactNode } from 'react'
import { creditCardsFactoryMock } from '@qovery/shared/factories'
import * as chargebeeUtils from '@qovery/shared/util-payment'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import * as useAddCreditCardHook from '../hooks/use-add-credit-card/use-add-credit-card'
import * as useBillingInfoHook from '../hooks/use-billing-info/use-billing-info'
import * as useChangePlanHook from '../hooks/use-change-plan/use-change-plan'
import * as useCreditCardsHook from '../hooks/use-credit-cards/use-credit-cards'
import * as useCurrentCostHook from '../hooks/use-current-cost/use-current-cost'
import * as useDeleteCreditCardHook from '../hooks/use-delete-credit-card/use-delete-credit-card'
import * as useEditBillingInfoHook from '../hooks/use-edit-billing-info/use-edit-billing-info'
import { SettingsBillingDetails } from './settings-billing-details'

const mockOpenModalConfirmation = jest.fn()
const mockDeleteCreditCard = jest.fn().mockResolvedValue(undefined)
const mockEditBillingInfo = jest.fn().mockResolvedValue(undefined)
const mockAddCreditCard = jest.fn().mockResolvedValue(undefined)
const mockChangePlan = jest.fn().mockResolvedValue(undefined)
const mockShowPylonForm = jest.fn()
const mockShowChat = jest.fn()
const mockTokenizeCard = jest.fn()
const mockToastError = jest.fn()

const defaultBillingInfo: BillingInfoRequest = {
  first_name: 'John',
  last_name: 'Doe',
  company: 'Qovery',
  address: '1 rue de la paix',
  city: 'Paris',
  state: 'Ile de France',
  zip: '75000',
  country_code: 'FR',
  vat_number: 'FR123456789',
  email: 'test@qovery.com',
}

const mockCreditCards = creditCardsFactoryMock(3)

const useAddCreditCardMock = jest.spyOn(useAddCreditCardHook, 'useAddCreditCard') as jest.Mock
const useBillingInfoMock = jest.spyOn(useBillingInfoHook, 'useBillingInfo') as jest.Mock
const useChangePlanMock = jest.spyOn(useChangePlanHook, 'useChangePlan') as jest.Mock
const useCreditCardsMock = jest.spyOn(useCreditCardsHook, 'useCreditCards') as jest.Mock
const useCurrentCostMock = jest.spyOn(useCurrentCostHook, 'useCurrentCost') as jest.Mock
const useDeleteCreditCardMock = jest.spyOn(useDeleteCreditCardHook, 'useDeleteCreditCard') as jest.Mock
const useEditBillingInfoMock = jest.spyOn(useEditBillingInfoHook, 'useEditBillingInfo') as jest.Mock
const fieldCardStylesSpy = jest.spyOn(chargebeeUtils, 'fieldCardStyles')
const loadChargebeeSpy = jest.spyOn(chargebeeUtils, 'loadChargebee')

jest.mock('@tanstack/react-router', () => ({
  useParams: () => ({ organizationId: 'org-1' }),
}))

jest.mock('@qovery/shared/util-hooks', () => ({
  useDocumentTitle: jest.fn(),
  useSupportChat: () => ({ showChat: mockShowChat, showPylonForm: mockShowPylonForm }),
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  toastError: (...args: unknown[]) => mockToastError(...args),
  useModalConfirmation: () => ({
    openModalConfirmation: mockOpenModalConfirmation,
  }),
}))

jest.mock('@chargebee/chargebee-js-react-wrapper', () => {
  const React = jest.requireActual('react')

  return {
    Provider: ({ children }: { children: ReactNode }) => children,
    CardComponent: React.forwardRef<
      HTMLDivElement,
      { onChange?: (event: { complete: boolean }) => void; onReady?: () => void; children: ReactNode }
    >(({ onChange, onReady, children }, ref) => {
      React.useImperativeHandle(ref, () => ({ tokenize: mockTokenizeCard }))
      setTimeout(() => {
        onReady?.()
        onChange?.({ complete: true })
      }, 0)
      return <div data-testid="chargebee-card-component">{children}</div>
    }),
    CardNumber: () => <div data-testid="card-number-field" />,
    CardExpiry: () => <div data-testid="card-expiry-field" />,
    CardCVV: () => <div data-testid="card-cvv-field" />,
  }
})

describe('SettingsBillingDetails', () => {
  beforeEach(() => {
    const mockChargebeeInstance: Pick<CbInstance, 'load'> = {
      load: jest.fn().mockResolvedValue(undefined),
    }

    jest.clearAllMocks()
    useCreditCardsMock.mockReturnValue({ data: mockCreditCards })
    useBillingInfoMock.mockReturnValue({ data: defaultBillingInfo })
    useCurrentCostMock.mockReturnValue({ data: { plan: 'BUSINESS_2025', remaining_trial_day: 0 } })
    useDeleteCreditCardMock.mockReturnValue({ mutateAsync: mockDeleteCreditCard })
    mockEditBillingInfo.mockResolvedValue(defaultBillingInfo)
    useEditBillingInfoMock.mockReturnValue({ mutateAsync: mockEditBillingInfo })
    useAddCreditCardMock.mockReturnValue({ mutateAsync: mockAddCreditCard })
    useChangePlanMock.mockReturnValue({ mutateAsync: mockChangePlan })
    fieldCardStylesSpy.mockReturnValue({})
    loadChargebeeSpy.mockResolvedValue(mockChargebeeInstance as CbInstance)
    mockTokenizeCard.mockResolvedValue({
      token: 'card-token',
      card: { last4: '4242', expiry_year: 2030, expiry_month: 12 },
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<SettingsBillingDetails />)
    expect(baseElement).toBeTruthy()
    expect(useAddCreditCardMock).toHaveBeenCalledWith({ notifyOnError: false })
    expect(useDeleteCreditCardMock).toHaveBeenCalledWith({ notifyOnError: false })
  })

  it('should have 3 credit card rows', () => {
    renderWithProviders(<SettingsBillingDetails />)
    expect(screen.getAllByTestId('credit-card-row')).toHaveLength(3)
  })

  it('should display skeletons while loading', () => {
    useCreditCardsMock.mockImplementation(() => {
      throw new Promise(() => undefined)
    })

    renderWithProviders(<SettingsBillingDetails />)

    expect(screen.getByTestId('credit-card-skeleton')).toBeInTheDocument()
    expect(screen.getByTestId('billing-details-skeleton')).toBeInTheDocument()
  })

  it('should open confirmation modal on delete', async () => {
    const { userEvent } = renderWithProviders(<SettingsBillingDetails />)
    const deleteButton = screen.getAllByTestId('delete-credit-card')[0]

    await userEvent.click(deleteButton)

    expect(mockOpenModalConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Delete credit card',
        name: mockCreditCards[0].last_digit,
        confirmationMethod: 'action',
      })
    )

    const [{ action }] = mockOpenModalConfirmation.mock.calls[0]
    await action()

    expect(mockDeleteCreditCard).toHaveBeenCalledWith({
      organizationId: 'org-1',
      creditCardId: mockCreditCards[0].id,
    })
  })

  it('should initialize Chargebee when adding a new card', async () => {
    useCreditCardsMock.mockReturnValue({ data: [] })
    const { userEvent } = renderWithProviders(<SettingsBillingDetails />)

    await userEvent.click(screen.getByTestId('add-new-card-button'))

    await waitFor(() => {
      expect(loadChargebeeSpy).toHaveBeenCalled()
    })

    expect(await screen.findByTestId('chargebee-card-component')).toBeInTheDocument()
  })

  it('should require billing details before adding a card', async () => {
    useCreditCardsMock.mockReturnValue({ data: [] })
    useBillingInfoMock.mockReturnValue({ data: { ...defaultBillingInfo, address: '   ' } })
    const { userEvent } = renderWithProviders(<SettingsBillingDetails />)

    await userEvent.click(screen.getByTestId('add-new-card-button'))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add card' })).toBeEnabled())
    await userEvent.click(screen.getByRole('button', { name: 'Add card' }))
    expect(await screen.findByText('Please provide an address')).toBeInTheDocument()
    expect(mockEditBillingInfo).not.toHaveBeenCalled()
    expect(mockAddCreditCard).not.toHaveBeenCalled()
  })

  it('should highlight every missing required billing field on save', async () => {
    useBillingInfoMock.mockReturnValue({
      data: {
        ...defaultBillingInfo,
        first_name: null,
        last_name: null,
        email: null,
        address: null,
        city: null,
        zip: null,
      },
    })
    const { userEvent } = renderWithProviders(<SettingsBillingDetails />)

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Please provide a first name')).toBeInTheDocument()
    expect(screen.getByText('Please provide a last name')).toBeInTheDocument()
    expect(screen.getByText('Please provide a billing email')).toBeInTheDocument()
    expect(screen.getByText('Please provide an address')).toBeInTheDocument()
    expect(screen.getByText('Please provide a city')).toBeInTheDocument()
    expect(screen.getByText('Please provide a postal code')).toBeInTheDocument()
    expect(
      screen.getAllByLabelText('input-container').filter((field) => field.classList.contains('input--error'))
    ).toHaveLength(6)
    expect(mockEditBillingInfo).not.toHaveBeenCalled()
  })

  it('should save billing details before adding a card', async () => {
    useCreditCardsMock.mockReturnValue({ data: [] })
    useBillingInfoMock.mockReturnValue({
      data: {
        ...defaultBillingInfo,
        address: '  1 rue de la paix  ',
        zip: '  75000  ',
        vat_number: '  FR123456789  ',
      },
    })
    const { userEvent } = renderWithProviders(<SettingsBillingDetails />)

    await userEvent.click(screen.getByTestId('add-new-card-button'))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add card' })).toBeEnabled())
    await userEvent.click(screen.getByRole('button', { name: 'Add card' }))

    await waitFor(() => expect(mockAddCreditCard).toHaveBeenCalledTimes(1))
    expect(mockEditBillingInfo).toHaveBeenCalledWith({
      organizationId: 'org-1',
      billingInfoRequest: defaultBillingInfo,
    })
    expect(mockEditBillingInfo.mock.invocationCallOrder[0]).toBeLessThan(mockAddCreditCard.mock.invocationCallOrder[0])
  })

  it('should show a rejected VAT number on the field without duplicating the error toast', async () => {
    useCreditCardsMock.mockReturnValue({ data: [] })
    mockEditBillingInfo.mockRejectedValueOnce({
      message: 'vat_number : You need to enter a valid VAT number.',
    })
    const { userEvent } = renderWithProviders(<SettingsBillingDetails />)

    await userEvent.click(screen.getByTestId('add-new-card-button'))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add card' })).toBeEnabled())
    await userEvent.click(screen.getByRole('button', { name: 'Add card' }))

    expect(await screen.findByText('You need to enter a valid VAT number.')).toBeInTheDocument()
    expect(mockToastError).toHaveBeenCalledTimes(1)
    expect(mockToastError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'vat_number : You need to enter a valid VAT number.' }),
      'Unable to add card',
      'You need to enter a valid VAT number.'
    )
    expect(mockAddCreditCard).not.toHaveBeenCalled()
  })

  it('should initialize Chargebee when editing a card', async () => {
    const { userEvent } = renderWithProviders(<SettingsBillingDetails />)

    await userEvent.click(screen.getAllByTestId('edit-credit-card')[0])

    await waitFor(() => {
      expect(loadChargebeeSpy).toHaveBeenCalled()
    })

    expect(await screen.findByTestId('chargebee-card-component')).toBeInTheDocument()
  })

  it('should not display add new card button when cards exist', () => {
    renderWithProviders(<SettingsBillingDetails />)

    expect(screen.queryByTestId('add-new-card-button')).not.toBeInTheDocument()
  })

  it('should display empty state when no cards and not showing add card form', () => {
    useCreditCardsMock.mockReturnValue({ data: [] })

    renderWithProviders(<SettingsBillingDetails />)

    expect(screen.getByTestId('placeholder-credit-card')).toBeInTheDocument()
  })

  it('should let the user switch plan during the free trial once the account is activated', async () => {
    useCurrentCostMock.mockReturnValue({ data: { plan: 'GROWTH_2026', remaining_trial_day: 5 } })

    const { userEvent } = renderWithProviders(<SettingsBillingDetails />)

    expect(screen.getByText('Your account is activated on the Growth plan')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Your subscription starts on this plan when your trial ends in 6 days. You can switch plan until then.'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('Your plan')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /^Growth/ })).toBeChecked()
    expect(screen.getByRole('button', { name: 'Switch to Growth plan' })).toBeDisabled()

    await userEvent.click(screen.getByRole('radio', { name: /^Starter/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Switch to Starter plan' }))

    expect(mockChangePlan).toHaveBeenCalledWith({ organizationId: 'org-1', plan: 'STARTER_2026' })
  })

  it('should remind the current plan once the free trial is over', () => {
    useCurrentCostMock.mockReturnValue({ data: { plan: 'SCALE_2026', remaining_trial_day: 0 } })

    renderWithProviders(<SettingsBillingDetails />)

    expect(screen.getByText('You are on the Scale plan')).toBeInTheDocument()
    expect(screen.getByText('Contact our team to change your plan.')).toBeInTheDocument()
  })

  it('should remind the current plan after removing the credit card outside of the free trial', () => {
    useCreditCardsMock.mockReturnValue({ data: [] })
    useCurrentCostMock.mockReturnValue({ data: { plan: 'SCALE_2026', remaining_trial_day: 0 } })

    renderWithProviders(<SettingsBillingDetails />)

    expect(screen.getByText('You are on the Scale plan')).toBeInTheDocument()
    expect(screen.getByText('Contact our team to change your plan.')).toBeInTheDocument()
    expect(screen.queryByText('Choose your plan to activate your account')).not.toBeInTheDocument()
  })

  it('should allow removing the only credit card during the free trial', () => {
    useCreditCardsMock.mockReturnValue({ data: mockCreditCards.slice(0, 1) })
    useCurrentCostMock.mockReturnValue({ data: { plan: 'GROWTH_2026', remaining_trial_day: 5 } })

    renderWithProviders(<SettingsBillingDetails />)

    expect(screen.getByTestId('delete-credit-card')).toBeEnabled()
  })

  it('should show the activation flow again when the credit card is removed during the free trial', () => {
    useCreditCardsMock.mockReturnValue({ data: [] })
    useCurrentCostMock.mockReturnValue({ data: { plan: 'GROWTH_2026', remaining_trial_day: 5 } })

    renderWithProviders(<SettingsBillingDetails />)

    expect(screen.getByText('Choose your plan to activate your account')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /^Growth/ })).toBeChecked()
  })

  it('should not show the plan selection once the free trial is over', () => {
    useCurrentCostMock.mockReturnValue({ data: { plan: 'GROWTH_2026', remaining_trial_day: 0 } })

    renderWithProviders(<SettingsBillingDetails />)

    expect(screen.queryByRole('radio', { name: /^Growth/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Contact us' })).toBeInTheDocument()
  })

  describe('plan activation during the free trial', () => {
    beforeEach(() => {
      useCreditCardsMock.mockReturnValue({ data: [] })
      useCurrentCostMock.mockReturnValue({ data: { plan: 'SCALE_2026', remaining_trial_day: 5 } })
    })

    it('should preselect the Scale plan and open the credit card form', async () => {
      renderWithProviders(<SettingsBillingDetails />)

      expect(screen.getByText('Choose your plan to activate your account')).toBeInTheDocument()
      expect(screen.getByText(/Your subscription starts when your trial ends in 6 days\./)).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: /^Scale/ })).toBeChecked()
      expect(await screen.findByTestId('chargebee-card-component')).toBeInTheDocument()
      expect(loadChargebeeSpy).toHaveBeenCalled()
    })

    it('should display the monthly price of each plan', () => {
      renderWithProviders(<SettingsBillingDetails />)

      expect(screen.getByRole('radio', { name: /^Starter.*\$374 \/ month/ })).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: /^Growth.*\$1,124 \/ month/ })).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: /^Scale.*\$3,749 \/ month/ })).toBeInTheDocument()
    })

    it('should not change the plan when activating the current trial plan', async () => {
      const { userEvent } = renderWithProviders(<SettingsBillingDetails />)

      await waitFor(() => expect(screen.getByRole('button', { name: 'Activate Scale plan' })).toBeEnabled())
      await userEvent.click(screen.getByRole('button', { name: 'Activate Scale plan' }))

      await waitFor(() => expect(mockAddCreditCard).toHaveBeenCalledTimes(1))
      expect(mockChangePlan).not.toHaveBeenCalled()
    })

    it('should change the plan after adding the credit card when another plan is selected', async () => {
      const { userEvent } = renderWithProviders(<SettingsBillingDetails />)

      await userEvent.click(screen.getByRole('radio', { name: /^Growth/ }))

      await waitFor(() => expect(screen.getByRole('button', { name: 'Activate Growth plan' })).toBeEnabled())
      await userEvent.click(screen.getByRole('button', { name: 'Activate Growth plan' }))

      await waitFor(() => expect(mockChangePlan).toHaveBeenCalledWith({ organizationId: 'org-1', plan: 'GROWTH_2026' }))
      expect(mockAddCreditCard.mock.invocationCallOrder[0]).toBeLessThan(mockChangePlan.mock.invocationCallOrder[0])
    })

    it('should not change the plan when the credit card cannot be added', async () => {
      mockAddCreditCard.mockRejectedValueOnce(new Error('Card declined'))
      const { userEvent } = renderWithProviders(<SettingsBillingDetails />)

      await userEvent.click(screen.getByRole('radio', { name: /^Starter/ }))
      await waitFor(() => expect(screen.getByRole('button', { name: 'Activate Starter plan' })).toBeEnabled())
      await userEvent.click(screen.getByRole('button', { name: 'Activate Starter plan' }))

      await waitFor(() => expect(mockToastError).toHaveBeenCalled())
      expect(mockChangePlan).not.toHaveBeenCalled()
    })

    it('should let the user contact the team for an Enterprise plan', async () => {
      const { userEvent } = renderWithProviders(<SettingsBillingDetails />)

      await userEvent.click(screen.getByRole('button', { name: 'Contact our team' }))
      expect(mockShowPylonForm).toHaveBeenCalledWith('ask-for-activation')
    })
  })
})
