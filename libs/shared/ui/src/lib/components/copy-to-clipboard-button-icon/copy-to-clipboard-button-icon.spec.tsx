import { render, screen } from '__tests__/utils/setup-jest'
import CopyToClipboardButtonIcon, { type CopyToClipboardButtonIconProps } from './copy-to-clipboard-button-icon'

let props: CopyToClipboardButtonIconProps
beforeEach(() => {
  props = {
    content: 'text to copy',
  }
})

describe('CopyToClipboardButtonIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CopyToClipboardButtonIcon {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have the right className for container', () => {
    props.className = 'class-name'
    render(<CopyToClipboardButtonIcon {...props} />)
    const icon = screen.getByTestId('copy-container')
    expect(icon.classList.contains('class-name')).toBeTruthy()
  })

  it('should have the right className for icon', () => {
    props.iconClassName = 'class-name'
    render(<CopyToClipboardButtonIcon {...props} />)
    const icon = screen.getByRole('img')
    expect(icon.classList.contains('class-name')).toBeTruthy()
  })
})
