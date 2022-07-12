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

  it('should called error toaster with response data error messages', () => {
    const message = 'error message'
    const title = 'error title'

    const error = {
      response: {
        data: {
          error: 'error',
          message: 'error message',
        },
      },
    }

    errorToaster(error)
    expect(toast).toHaveBeenCalledWith(ToastEnum.ERROR, 'error', 'error message')
  })

  it('should called error toaster with response error code and message', () => {
    const error = {
      code: 'error',
      message: 'error message',
    }

    errorToaster(error)
    expect(toast).toHaveBeenCalledWith(ToastEnum.ERROR, 'error', 'error message')
  })
})
