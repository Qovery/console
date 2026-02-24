import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as addCreditCodeHooks from '../../hooks/use-add-credit-code/use-add-credit-code'
import PromoCodeModalFeature, {
  PromoCodeModal,
  type PromoCodeModalProps,
  type PromocodeModalFeatureProps,
} from './promo-code-modal-feature'

const useAddCreditCodeSpy = jest.spyOn(addCreditCodeHooks, 'useAddCreditCode')

const featureProps: PromocodeModalFeatureProps = {
  closeModal: jest.fn(),
  organizationId: '1',
}

const modalProps: PromoCodeModalProps = {
  isSubmitting: false,
  onClose: jest.fn(),
  onSubmit: jest.fn((event) => event.preventDefault()),
}

describe('PromoCodeModal', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<PromoCodeModal {...modalProps} />))
    expect(baseElement).toBeTruthy()
  })

  it('should show spinner when submitting', () => {
    renderWithProviders(wrapWithReactHookForm(<PromoCodeModal {...modalProps} isSubmitting={true} />))
    screen.getByTestId('spinner')
  })

  it('should call onSubmit when clicking submit', async () => {
    const onSubmit = jest.fn((event) => event.preventDefault())

    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<PromoCodeModal {...modalProps} onSubmit={onSubmit} />, {
        defaultValues: { code: 'test' },
      })
    )

    await userEvent.click(screen.getByTestId('submit-button'))

    expect(onSubmit).toHaveBeenCalled()
  })
})

describe('PromoCodeModalFeature', () => {
  const mutateAsyncMock = jest.fn()

  beforeEach(() => {
    mutateAsyncMock.mockReset()
    useAddCreditCodeSpy.mockReturnValue({
      mutateAsync: mutateAsyncMock,
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PromoCodeModalFeature {...featureProps} />)
    expect(baseElement).toBeTruthy()
  })

  it('should useAddCreditCode with good params', async () => {
    const { userEvent } = renderWithProviders(<PromoCodeModalFeature {...featureProps} />)

    const input = screen.getByLabelText('Promo code')
    await userEvent.type(input, 'test')

    const button = screen.getByTestId('submit-button')
    await userEvent.click(button)

    expect(mutateAsyncMock).toHaveBeenCalledWith({ organizationId: '1', code: 'test' })
  })
})
