import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import StickyActionFormToaster, { type StickyActionFormToasterProps } from './sticky-action-form-toaster'

const props: StickyActionFormToasterProps = {
  onReset: jest.fn(),
  onSubmit: jest.fn(),
  resetLabel: 'Reset',
  submitLabel: 'Save modifications',
  description: 'Warning, there are still unsaved changes!',
}

describe('StickyActionFormToaster', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<StickyActionFormToaster {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should handle reset on click', async () => {
    const spy = jest.fn()
    props.onReset = spy
    const { userEvent } = renderWithProviders(<StickyActionFormToaster {...props} />)

    await userEvent.click(screen.getByText('Reset'))

    expect(spy).toHaveBeenCalled()
  })

  it('should handle submit on click', async () => {
    const spy = jest.fn()
    props.onSubmit = spy
    const { userEvent } = renderWithProviders(<StickyActionFormToaster {...props} />)

    await userEvent.click(screen.getByText('Save modifications'))

    expect(spy).toHaveBeenCalled()
  })

  it('should disabled button', async () => {
    const spy = jest.fn()
    props.onSubmit = spy
    props.disabledValidation = true
    renderWithProviders(<StickyActionFormToaster {...props} />)

    expect(screen.getByTestId('submit-button')).toBeDisabled()
  })
})
