import * as organizationsDomain from '@qovery/domains/organizations/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PromoCodeModalFeature, { type PromocodeModalFeatureProps } from './promo-code-modal-feature'

const useAddCreditCodeSpy = jest.spyOn(organizationsDomain, 'useAddCreditCode') as jest.Mock

const props: PromocodeModalFeatureProps = {
  closeModal: jest.fn(),
  organizationId: '1',
}

describe('PromoCodeModalFeature', () => {
  beforeEach(() => {
    useAddCreditCodeSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PromoCodeModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should useAddCreditCode with good params', async () => {
    const { userEvent } = renderWithProviders(<PromoCodeModalFeature {...props} />)

    const input = screen.getByLabelText('Promo code')
    await userEvent.type(input, 'test')

    const button = screen.getByTestId('submit-button')
    await userEvent.click(button)

    expect(useAddCreditCodeSpy().mutateAsync).toHaveBeenCalledWith({ organizationId: '1', code: 'test' })
  })
})
