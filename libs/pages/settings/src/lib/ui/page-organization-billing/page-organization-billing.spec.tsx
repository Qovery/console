import { getAllByTestId, getByTestId, render } from '@testing-library/react'
import { creditCardsFactoryMock } from '@qovery/shared/factories'
import PageOrganizationBilling, { PageOrganizationBillingProps } from './page-organization-billing'

const mockOpenNewCreditCardModal = jest.fn()
const mockDeleteCard = jest.fn()
const props: PageOrganizationBillingProps = {
  creditCards: creditCardsFactoryMock(3),
  openNewCreditCardModal: mockOpenNewCreditCardModal,
  onDeleteCard: mockDeleteCard,
  creditCardLoading: false,
}

describe('PageOrganizationBilling', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationBilling {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have 3 credit card rows', () => {
    const { baseElement } = render(<PageOrganizationBilling {...props} />)
    expect(getAllByTestId(baseElement, 'credit-card-row')).toHaveLength(3)
  })

  it('should display spinner if loading and no card in the store', () => {
    const { baseElement } = render(<PageOrganizationBilling {...props} creditCardLoading={true} creditCards={[]} />)
    getByTestId(baseElement, 'spinner')
  })

  it('should call deleteCard methods', () => {
    const { baseElement } = render(<PageOrganizationBilling {...props} />)
    const deleteButton = getAllByTestId(baseElement, 'delete-credit-card')[0]

    deleteButton.click()

    expect(mockDeleteCard).toHaveBeenCalledWith(props.creditCards[0])
  })

  it('should open the creation modal', () => {
    const { baseElement } = render(<PageOrganizationBilling {...props} />)
    const addButton = getByTestId(baseElement, 'add-new-card-button')

    addButton.click()

    expect(mockOpenNewCreditCardModal).toHaveBeenCalled()
  })
})
