import { act } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import StickyActionFormToaster, { StickyActionFormToasterProps } from './sticky-action-form-toaster'

const props: StickyActionFormToasterProps = {
  onReset: jest.fn(),
  onSubmit: jest.fn(),
  resetLabel: 'Reset',
  submitLabel: 'Save modifications',
  description: 'Warning, there are still unsaved changes!',
}

describe('StickyActionFormToaster', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StickyActionFormToaster {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should handle reset on click', async () => {
    const spy = jest.fn()
    props.onReset = spy
    const { getByText } = render(<StickyActionFormToaster {...props} />)

    await act(() => {
      getByText('Reset').click()
    })

    expect(spy).toHaveBeenCalled()
  })

  it('should handle submit on click', async () => {
    const spy = jest.fn()
    props.onSubmit = spy
    const { getByText } = render(<StickyActionFormToaster {...props} />)

    await act(() => {
      getByText('Save modifications').click()
    })

    expect(spy).toHaveBeenCalled()
  })

  it('should disabled button', async () => {
    const spy = jest.fn()
    props.onSubmit = spy
    props.disabledValidation = true
    const { getByTestId } = render(<StickyActionFormToaster {...props} />)

    expect(getByTestId('submit-button')).toBeDisabled()
  })
})
