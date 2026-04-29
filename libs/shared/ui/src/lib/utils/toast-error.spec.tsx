import toast from './toast'
import { toastError } from './toast-error'

jest.mock('./toast', () => {
  const actual = jest.requireActual('./toast')
  return {
    __esModule: true,
    ...actual,
    default: jest.fn(),
  }
})

describe('error toaster', () => {
  toast.mockImplementation(jest.fn())

  it('should called error toaster with defined title and message', () => {
    const message = 'error message'
    const title = 'error title'

    toastError(null, title, message)
    expect(toast).toHaveBeenCalledWith('error', title, message, undefined, undefined)
  })

  it('should call error toaster with error name and error message', () => {
    const error = {
      name: 'error',
      message: 'error message',
    }

    toastError(error)
    expect(toast).toHaveBeenCalledWith('error', 'error', 'error message', undefined, undefined)
  })

  it('should call error toaster with default error name', () => {
    const error = {}
    toastError(error)
    expect(toast).toHaveBeenCalledWith('error', 'Error', 'No message found', undefined, undefined)
  })

  it('should call error toaster with label action', () => {
    const error = {}
    toastError(error, undefined, undefined, undefined, 'label')
    expect(toast).toHaveBeenCalledWith('error', 'Error', 'No message found', undefined, 'label')
  })
})
