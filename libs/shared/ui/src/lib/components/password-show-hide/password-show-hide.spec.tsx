import PasswordShowHide, { PasswordShowHideProps } from './password-show-hide'
import { render } from '__tests__/utils/setup-jest'
import { act, screen } from '@testing-library/react'

const defaultProps: PasswordShowHideProps = {
  value: 'test value',
  defaultVisible: false,
}

describe('PasswordShowHide', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PasswordShowHide {...defaultProps} />)
    expect(baseElement).toBeTruthy()
  })

  it('should show the value in password stars format', () => {
    const { baseElement } = render(<PasswordShowHide {...defaultProps} />)

    const input = screen.getByTestId('input')
    expect(input.getAttribute('type')).toBe('password')

    expect(baseElement).toBeTruthy()
  })

  it('should display password on click on eye', () => {
    const { baseElement } = render(<PasswordShowHide {...defaultProps} />)

    const toggleButton = screen.getByTestId('toggle-button')

    act(() => {
      toggleButton.click()
    })

    const value = screen.getByTestId('visible_value')
    expect(value).toBeVisible()

    expect(baseElement).toBeTruthy()
  })

  it('should disabled the tooltip showing the whole value if we are in password mode', () => {
    const { baseElement } = render(<PasswordShowHide {...defaultProps} />)

    const input = screen.getByTestId('input')
    expect(input).toBeDisabled()

    expect(baseElement).toBeTruthy()
  })

  it('should show the tooltip showing the whole value if visible mode', () => {
    const props: PasswordShowHideProps = {
      ...defaultProps,
      defaultVisible: true,
    }
    const { baseElement } = render(<PasswordShowHide {...props} />)

    const value = screen.getByTestId('visible_value')
    expect(value).toBeVisible()

    expect(baseElement).toBeTruthy()
  })

  it('should not be possible to edit the value', () => {
    const { baseElement } = render(<PasswordShowHide {...defaultProps} />)

    const input = screen.getByTestId('input')
    expect(input.hasAttribute('readonly')).toBeTruthy()

    expect(baseElement).toBeTruthy()
  })

  it('click on copy should not hide the password', () => {
    const props = {
      ...defaultProps,
      canCopy: true,
      visible: true,
    }
    const { baseElement } = render(<PasswordShowHide {...props} />)

    const toggleButton = screen.getByTestId('toggle-button')

    act(() => {
      toggleButton.click()
    })

    const value = screen.getByTestId('visible_value')
    expect(value).toBeVisible()

    expect(baseElement).toBeTruthy()
  })
})
