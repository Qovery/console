import { act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import CopyToClipboardButtonIcon, { type CopyToClipboardButtonIconProps } from './copy-to-clipboard-button-icon'

const mockCopyToClipboard = jest.fn()
jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useCopyToClipboard: () => [jest.fn(), mockCopyToClipboard],
}))

let props: CopyToClipboardButtonIconProps
beforeEach(() => {
  props = {
    content: 'text to copy',
  }

  mockCopyToClipboard.mockClear()
})

describe('CopyToClipboardButtonIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<CopyToClipboardButtonIcon {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have the right className for container', () => {
    props.className = 'class-name'
    renderWithProviders(<CopyToClipboardButtonIcon {...props} />)
    const icon = screen.getByTestId('copy-container')
    expect(icon).toHaveClass('class-name')
  })

  it('should have the right className for icon', () => {
    props.iconClassName = 'class-name'
    renderWithProviders(<CopyToClipboardButtonIcon {...props} />)
    const icon = screen.getByTestId('copy-container').querySelector('i')
    expect(icon).toBeTruthy()
    expect(icon).toHaveClass('class-name')
  })

  it('should copy content and toggle the icon', async () => {
    jest.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

    renderWithProviders(<CopyToClipboardButtonIcon {...props} />)
    const container = screen.getByTestId('copy-container')
    const icon = container.querySelector('i') as HTMLElement

    expect(icon).toHaveClass('fa-copy')

    await user.click(container)
    expect(mockCopyToClipboard).toHaveBeenCalledWith(props.content)
    expect(icon).toHaveClass('fa-check')

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(icon).toHaveClass('fa-copy')
    jest.useRealTimers()
  })
})
