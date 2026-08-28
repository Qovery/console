import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import StickyActionFormToaster, { type StickyActionFormToasterProps } from './sticky-action-form-toaster'

const props: StickyActionFormToasterProps = {
  onReset: jest.fn(),
  onSubmit: jest.fn(),
  resetLabel: 'Reset',
  submitLabel: 'Save modifications',
  description: 'Warning, there are still unsaved changes!',
  visible: true,
}

describe('StickyActionFormToaster', () => {
  it('should render successfully', () => {
    renderWithProviders(<StickyActionFormToaster {...props} />)

    expect(screen.getByTestId('sticky-action-form-toaster')).toBeVisible()
  })

  it.each([false, true])('should render above other floating elements when fixed is %s', (fixed) => {
    renderWithProviders(<StickyActionFormToaster {...props} fixed={fixed} />)

    expect(screen.getByTestId('sticky-action-form-toaster').parentElement).toHaveClass('z-toast')
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

  it('should allow customizing submit button color', () => {
    props.disabledValidation = false
    renderWithProviders(<StickyActionFormToaster {...props} submitButtonColor="red" />)

    expect(screen.getByTestId('submit-button')).toHaveClass('bg-surface-negative-solid')
  })

  it('should immediately follow the visible prop without animation classes', () => {
    const { rerender } = renderWithProviders(<StickyActionFormToaster {...props} visible={false} />)

    expect(screen.queryByTestId('sticky-action-form-toaster')).not.toBeInTheDocument()

    rerender(<StickyActionFormToaster {...props} visible />)

    const toaster = screen.getByTestId('sticky-action-form-toaster')
    expect(toaster).toBeVisible()
    expect(toaster).not.toHaveClass('animate-action-bar-fade-in')
    expect(toaster).not.toHaveClass('animate-action-bar-fade-out')
  })
})
