import { useState } from 'react'
import { renderWithProviders, screen, waitFor, waitForElementToBeRemoved } from '@qovery/shared/util-tests'
import StickyActionFormToaster, { type StickyActionFormToasterProps } from './sticky-action-form-toaster'

const props: StickyActionFormToasterProps = {
  onReset: jest.fn(),
  onSubmit: jest.fn(),
  resetLabel: 'Reset',
  submitLabel: 'Save modifications',
  description: 'Warning, there are still unsaved changes!',
  visible: true,
}

function StickyActionFormToasterHarness({ onReset = props.onReset }: Pick<StickyActionFormToasterProps, 'onReset'>) {
  const [visible, setVisible] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setVisible(true)}>
        Show toaster
      </button>
      <button type="button" onClick={() => setVisible(false)}>
        Hide toaster
      </button>
      <StickyActionFormToaster {...props} visible={visible} onReset={onReset} />
    </>
  )
}

describe('StickyActionFormToaster', () => {
  it('should render successfully', () => {
    renderWithProviders(<StickyActionFormToaster {...props} />)

    expect(screen.getByTestId('sticky-action-form-toaster')).toBeVisible()
  })

  it.each([
    { fixed: false, positionClass: 'sticky', bottomClass: 'bottom-4' },
    { fixed: true, positionClass: 'fixed', bottomClass: 'bottom-14' },
  ])(
    'should render above other floating elements with $positionClass positioning',
    ({ fixed, positionClass, bottomClass }) => {
      renderWithProviders(<StickyActionFormToaster {...props} fixed={fixed} />)

      expect(screen.getByTestId('sticky-action-form-toaster').parentElement).toHaveClass(
        'z-toast',
        positionClass,
        bottomClass
      )
    }
  )

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

  it('should animate in and out before unmounting', async () => {
    const { userEvent } = renderWithProviders(<StickyActionFormToasterHarness />)

    expect(screen.queryByTestId('sticky-action-form-toaster')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Show toaster' }))

    const toaster = screen.getByTestId('sticky-action-form-toaster')
    expect(toaster).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Hide toaster' }))

    expect(screen.getByTestId('sticky-action-form-toaster')).toBeInTheDocument()
    await waitForElementToBeRemoved(() => screen.queryByTestId('sticky-action-form-toaster'))
  })

  it('should remain interactive when shown again during the exit animation', async () => {
    const onReset = jest.fn()
    const { userEvent } = renderWithProviders(<StickyActionFormToasterHarness onReset={onReset} />)

    await userEvent.click(screen.getByRole('button', { name: 'Show toaster' }))
    await userEvent.click(screen.getByRole('button', { name: 'Hide toaster' }))

    expect(screen.getByTestId('sticky-action-form-toaster')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Show toaster' }))

    await waitFor(() => expect(screen.getByTestId('sticky-action-form-toaster')).toHaveStyle('pointer-events: auto'))
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }))

    expect(onReset).toHaveBeenCalledTimes(1)
  })
})
