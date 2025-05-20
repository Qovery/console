import toast, { ToastEnum } from './toast'
import { toastError } from './toast-error'

jest.mock('./toast')

describe('error toaster', () => {
  toast.mockImplementation(jest.fn())

  it('should called error toaster with defined title and message', () => {
    const message = 'error message'
    const title = 'error title'

    toastError(null, title, message)
    expect(toast).toHaveBeenCalledWith(ToastEnum.ERROR, title, message, undefined, undefined, undefined, undefined)
  })

  it('should call error toaster with error name and error message', () => {
    const error = {
      name: 'error',
      message: 'error message',
    }

    toastError(error)
    expect(toast).toHaveBeenCalledWith(
      ToastEnum.ERROR,
      'error',
      'error message',
      undefined,
      undefined,
      undefined,
      undefined
    )
  })

  it('should call error toaster with default error name', () => {
    const error = {}
    toastError(error)
    expect(toast).toHaveBeenCalledWith(
      ToastEnum.ERROR,
      'Error',
      'No message found',
      undefined,
      undefined,
      undefined,
      undefined
    )
  })

  it('should call error toaster with label and external link', () => {
    const error = {}
    toastError(error, undefined, undefined, undefined, undefined, 'label', 'https://www.google.com')
    expect(toast).toHaveBeenCalledWith(
      ToastEnum.ERROR,
      'Error',
      'No message found',
      undefined,
      undefined,
      'label',
      'https://www.google.com'
    )
  })
})
