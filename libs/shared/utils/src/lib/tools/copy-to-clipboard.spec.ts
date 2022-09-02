import { copyToClipboard } from './copy-to-clipboard'

const originalClipboard = { ...global.navigator.clipboard }

describe('test copy to clipboard', () => {
  beforeEach(() => {
    let clipboardData = ''
    const mockClipboard = {
      writeText: jest.fn((data) => {
        clipboardData = data
      }),
      readText: jest.fn(() => {
        return clipboardData
      }),
    }
    global.navigator.clipboard = mockClipboard
  })

  afterEach(() => {
    jest.resetAllMocks()
    global.navigator.clipboard = originalClipboard
  })

  it('copies a string to the clipboard', async () => {
    const string = 'hello'
    copyToClipboard(string)

    expect(navigator.clipboard.readText()).toBe('hello')
    expect(navigator.clipboard.writeText).toBeCalledTimes(1)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello')
  })
})
