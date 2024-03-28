import { renderWithProviders } from '@qovery/shared/util-tests'
import XTerm from './xterm'

describe('XTerm', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation((query) => {
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<XTerm />)
    expect(baseElement).toBeTruthy()
  })

  it('call onData listener', async () => {
    const onData = jest.fn()

    const { userEvent } = renderWithProviders(<XTerm listeners={{ onData }} />)
    const textArea = document.querySelector('.xterm-helper-textarea')

    if (textArea) await userEvent.type(textArea, 'ls')

    expect(onData).toHaveBeenCalled()
  })
})
