import { render } from '@testing-library/react'
import WarningBox, { WarningBoxEnum, WarningBoxProps } from './warning-box'

describe('WarningBox', () => {
  const props: WarningBoxProps = {
    title: 'hello',
    message: 'Lorem ipsum',
  }

  it('should render successfully', () => {
    const { baseElement } = render(<WarningBox {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render with warning colors', () => {
    const { getByTestId, queryByRole } = render(<WarningBox {...props} />)

    const box = getByTestId('warning-box')
    const icon = queryByRole('img')

    expect(box.classList.contains('border-warning-500')).toBe(true)
    expect(box.classList.contains('bg-warning-50')).toBe(true)
    expect(icon?.classList.contains('text-warning-600')).toBe(true)
  })

  it('should render with error colors', () => {
    props.type = WarningBoxEnum.ERROR
    const { getByTestId, queryByRole } = render(<WarningBox {...props} />)

    const box = getByTestId('warning-box')
    const icon = queryByRole('img')

    expect(box.classList.contains('border-error-500')).toBe(true)
    expect(box.classList.contains('bg-error-50')).toBe(true)
    expect(icon?.classList.contains('text-error-600')).toBe(true)
  })
})
