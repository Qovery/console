import { getAllByTestId, getByTestId, render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { type BillingInfoRequest } from 'qovery-typescript-axios'
import { creditCardsFactoryMock } from '@qovery/shared/factories'
import PageOrganizationBilling, { type PageOrganizationBillingProps } from './page-organization-billing'

const mockOnAddCard = jest.fn()
const mockDeleteCard = jest.fn()
const mockOnCancelAddCard = jest.fn()
const mockOnSubmit = jest.fn()

const defaultBillingValues: BillingInfoRequest = {
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

const props: PageOrganizationBillingProps = {
  creditCards: creditCardsFactoryMock(3),
  onAddCard: mockOnAddCard,
  onDeleteCard: mockDeleteCard,
  creditCardLoading: false,
  showAddCard: false,
  onCancelAddCard: mockOnCancelAddCard,
  cbInstance: null,
  countryValues: [
    { label: 'France', value: 'FR' },
    { label: 'United States', value: 'US' },
  ],
  loadingBillingInfos: false,
  editInProcess: false,
  onSubmit: mockOnSubmit,
}

describe('PageOrganizationBilling', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<BillingInfoRequest>(<PageOrganizationBilling {...props} />, {
        defaultValues: defaultBillingValues,
      })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should have 3 credit card rows', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<BillingInfoRequest>(<PageOrganizationBilling {...props} />, {
        defaultValues: defaultBillingValues,
      })
    )
    expect(getAllByTestId(baseElement, 'credit-card-row')).toHaveLength(3)
  })

  it('should display 1 spinner if loading and no card in the store', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<BillingInfoRequest>(
        <PageOrganizationBilling {...props} creditCardLoading={true} creditCards={[]} />,
        {
          defaultValues: defaultBillingValues,
        }
      )
    )
    // 1 for the credit card section
    expect(getAllByTestId(baseElement, 'spinner')).toHaveLength(1)
  })

  it('should call deleteCard method', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<BillingInfoRequest>(<PageOrganizationBilling {...props} />, {
        defaultValues: defaultBillingValues,
      })
    )
    const deleteButton = getAllByTestId(baseElement, 'delete-credit-card')[0]

    deleteButton.click()

    expect(mockDeleteCard).toHaveBeenCalledWith(props.creditCards[0])
  })

  it('should call onAddCard when clicking add new card button', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<BillingInfoRequest>(<PageOrganizationBilling {...props} creditCards={[]} />, {
        defaultValues: defaultBillingValues,
      })
    )
    const addButton = getByTestId(baseElement, 'add-new-card-button')

    addButton.click()

    expect(mockOnAddCard).toHaveBeenCalledWith()
  })

  it('should call onAddCard with card id when clicking edit button', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<BillingInfoRequest>(<PageOrganizationBilling {...props} />, {
        defaultValues: defaultBillingValues,
      })
    )
    const editButton = getAllByTestId(baseElement, 'edit-credit-card')[0]

    editButton.click()

    expect(mockOnAddCard).toHaveBeenCalledWith(props.creditCards[0].id)
  })

  it('should not display add new card button when cards exist', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<BillingInfoRequest>(<PageOrganizationBilling {...props} />, {
        defaultValues: defaultBillingValues,
      })
    )
    const addButton = baseElement.querySelector('[data-testid="add-new-card-button"]')

    expect(addButton).not.toBeInTheDocument()
  })

  it('should display empty state when no cards and not showing add card form', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<BillingInfoRequest>(<PageOrganizationBilling {...props} creditCards={[]} />, {
        defaultValues: defaultBillingValues,
      })
    )
    const emptyState = getByTestId(baseElement, 'placeholder-credit-card')

    expect(emptyState).toBeInTheDocument()
  })
})
