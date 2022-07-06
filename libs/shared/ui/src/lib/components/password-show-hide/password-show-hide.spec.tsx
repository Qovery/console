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

    const input = screen.getByTestId('input')
    expect(input.getAttribute('type')).toBe('text')

    expect(baseElement).toBeTruthy()
  })
})
