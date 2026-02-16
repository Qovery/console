import { act, render, screen } from '__tests__/utils/setup-jest'
import PasswordShowHide, { type PasswordShowHideProps } from './password-show-hide'

const defaultProps: PasswordShowHideProps = {
  value: 'test value',
}

describe('PasswordShowHide', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PasswordShowHide {...defaultProps} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render the visible value by default', () => {
    const { baseElement } = render(<PasswordShowHide {...defaultProps} />)

    screen.getByTestId('visible_value')
    expect(baseElement).toBeTruthy()
  })

  it('should render a copy button when copy is enabled', () => {
    const { baseElement } = render(<PasswordShowHide {...defaultProps} />)

    screen.getByTestId('copy-container')

    expect(baseElement).toBeTruthy()
  })

  it('should render secret mode when isSecret is true', () => {
    const props: PasswordShowHideProps = {
      ...defaultProps,
      isSecret: true,
    }
    const { baseElement } = render(<PasswordShowHide {...props} />)

    screen.getByTestId('hide_value_secret')

    expect(baseElement).toBeTruthy()
  })

  it('click on copy keeps visible value rendered', () => {
    const props = {
      ...defaultProps,
      canCopy: true,
    }
    const { baseElement } = render(<PasswordShowHide {...props} />)

    const copyButton = screen.getByTestId('copy-container')

    act(() => {
      copyButton.click()
    })

    const value = screen.getByTestId('visible_value')
    expect(value).toBeVisible()

    expect(baseElement).toBeTruthy()
  })
})
