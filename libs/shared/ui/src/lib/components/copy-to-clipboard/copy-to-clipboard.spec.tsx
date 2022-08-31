import { act } from '@testing-library/react'
import { render, screen } from '__tests__/utils/setup-jest'
import CopyToClipboard, { CopyToClipboardProps } from './copy-to-clipboard'

let props: CopyToClipboardProps
beforeEach(() => {
  props = {
    content: 'text to copy',
  }
})

describe('CopyToClipboard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CopyToClipboard {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have the right className for container', () => {
    props.className = 'class-name'
    render(<CopyToClipboard {...props} />)
    const icon = screen.getByTestId('copy-container')
    expect(icon.classList.contains('class-name')).toBeTruthy()
  })

  it('should have the right className for icon', () => {
    props.iconClassName = 'class-name'
    render(<CopyToClipboard {...props} />)
    const icon = screen.getByRole('img')
    expect(icon.classList.contains('class-name')).toBeTruthy()
  })

  it('should call the copy function on click', () => {
    props.content = 'copy'
    render(<CopyToClipboard {...props} />)

    Object.assign(window.navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    })

    act(() => {
      screen.getByTestId('copy-container').click()
    })

    expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith('copy')
  })
})
