import { render } from '@testing-library/react'
import BannerBox, { BannerBoxEnum, BannerBoxProps } from './banner-box'

describe('BannerBox', () => {
  const props: BannerBoxProps = {
    title: 'hello',
    message: 'Lorem ipsum',
  }

  it('should render successfully', () => {
    const { baseElement } = render(<BannerBox {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render with warning colors', () => {
    const { getByTestId, queryByRole } = render(<BannerBox {...props} />)

    const box = getByTestId('warning-box')
    const icon = queryByRole('img')

    expect(box.classList.contains('border-warning-500')).toBe(true)
    expect(box.classList.contains('bg-warning-50')).toBe(true)
    expect(icon?.classList.contains('text-warning-600')).toBe(true)
  })

  it('should render with error colors', () => {
    props.type = BannerBoxEnum.ERROR
    const { getByTestId, queryByRole } = render(<BannerBox {...props} />)

    const box = getByTestId('warning-box')
    const icon = queryByRole('img')

    expect(box.classList.contains('border-error-500')).toBe(true)
    expect(box.classList.contains('bg-error-50')).toBe(true)
    expect(icon?.classList.contains('text-error-600')).toBe(true)
  })
})
