import { errorToaster } from './toasters'
import toast, { ToastEnum } from '../toast'

jest.mock('../toast')

describe('error toaster', () => {
  toast.mockImplementation(jest.fn())

  it('should called error toaster with defined title and message', () => {
    const message = 'error message'
    const title = 'error title'

    errorToaster(null, title, message)
    expect(toast).toHaveBeenCalledWith(ToastEnum.ERROR, title, message)
  })

  it('should call error toaster with error name and error message', () => {
    const error = {
      name: 'error',
      message: 'error message',
    }

    errorToaster(error)
    expect(toast).toHaveBeenCalledWith(ToastEnum.ERROR, 'error', 'error message')
  })

  it('should call error toaster with default error name', () => {
    const error = {}
    errorToaster(error)
    expect(toast).toHaveBeenCalledWith(ToastEnum.ERROR, 'Error', 'No message found')
  })
})
