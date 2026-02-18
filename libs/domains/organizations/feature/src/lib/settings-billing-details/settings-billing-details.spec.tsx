import type CbInstance from '@chargebee/chargebee-js-types/cb-types/models/cb-instance'
import { type BillingInfoRequest } from 'qovery-typescript-axios'
import type { ReactNode } from 'react'
import { creditCardsFactoryMock } from '@qovery/shared/factories'
import * as chargebeeUtils from '@qovery/shared/util-payment'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import * as useAddCreditCardHook from '../hooks/use-add-credit-card/use-add-credit-card'
import * as useBillingInfoHook from '../hooks/use-billing-info/use-billing-info'
import * as useCreditCardsHook from '../hooks/use-credit-cards/use-credit-cards'
import * as useDeleteCreditCardHook from '../hooks/use-delete-credit-card/use-delete-credit-card'
import * as useEditBillingInfoHook from '../hooks/use-edit-billing-info/use-edit-billing-info'
import { SettingsBillingDetails } from './settings-billing-details'

const mockOpenModalConfirmation = jest.fn()
const mockDeleteCreditCard = jest.fn().mockResolvedValue(undefined)
const mockEditBillingInfo = jest.fn().mockResolvedValue(undefined)
const mockAddCreditCard = jest.fn().mockResolvedValue(undefined)

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
const useCreditCardsMock = jest.spyOn(useCreditCardsHook, 'useCreditCards') as jest.Mock
const useDeleteCreditCardMock = jest.spyOn(useDeleteCreditCardHook, 'useDeleteCreditCard') as jest.Mock
const useEditBillingInfoMock = jest.spyOn(useEditBillingInfoHook, 'useEditBillingInfo') as jest.Mock
const fieldCardStylesSpy = jest.spyOn(chargebeeUtils, 'fieldCardStyles')
const loadChargebeeSpy = jest.spyOn(chargebeeUtils, 'loadChargebee')

jest.mock('@tanstack/react-router', () => ({
  useParams: () => ({ organizationId: 'org-1' }),
}))

jest.mock('@qovery/shared/util-hooks', () => ({
  useDocumentTitle: jest.fn(),
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModalConfirmation: () => ({
    openModalConfirmation: mockOpenModalConfirmation,
  }),
}))

jest.mock('@chargebee/chargebee-js-react-wrapper', () => {
  const React = jest.requireActual('react') as typeof import('react')

  return {
    Provider: ({ children }: { children: ReactNode }) => children,
    CardComponent: React.forwardRef<HTMLDivElement, { onReady?: () => void; children: ReactNode }>(
      ({ onReady, children }, ref) => {
        setTimeout(() => onReady?.(), 0)
        return (
          <div ref={ref} data-testid="chargebee-card-component">
            {children}
          </div>
        )
      }
    ),
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
    useDeleteCreditCardMock.mockReturnValue({ mutateAsync: mockDeleteCreditCard })
    useEditBillingInfoMock.mockReturnValue({ mutateAsync: mockEditBillingInfo })
    useAddCreditCardMock.mockReturnValue({ mutateAsync: mockAddCreditCard })
    fieldCardStylesSpy.mockReturnValue({})
    loadChargebeeSpy.mockResolvedValue(mockChargebeeInstance as CbInstance)
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<SettingsBillingDetails />)
    expect(baseElement).toBeTruthy()
  })

  it('should have 3 credit card rows', () => {
    renderWithProviders(<SettingsBillingDetails />)
    expect(screen.getAllByTestId('credit-card-row')).toHaveLength(3)
  })

  it('should display skeletons while loading', () => {
    useCreditCardsMock.mockImplementationOnce(() => {
      throw new Promise(() => {})
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
})
