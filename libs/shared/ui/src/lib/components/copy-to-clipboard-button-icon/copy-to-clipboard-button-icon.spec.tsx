import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import CopyToClipboardButtonIcon, { type CopyToClipboardButtonIconProps } from './copy-to-clipboard-button-icon'

let props: CopyToClipboardButtonIconProps
beforeEach(() => {
  props = {
    content: 'text to copy',
  }
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
    const icon = screen.getByRole('img')
    expect(icon).toHaveClass('class-name')
  })
})
