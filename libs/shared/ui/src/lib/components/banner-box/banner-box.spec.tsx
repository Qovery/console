import { getByRole, render } from '__tests__/utils/setup-jest'
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
    const { getByTestId, queryByRole } = render(<BannerBox {...props} type={BannerBoxEnum.WARNING} />)

    const box = getByTestId('banner-box')
    const icon = queryByRole('img')

    expect(box.classList.contains('border-yellow-500')).toBe(true)
    expect(box.classList.contains('bg-yellow-50')).toBe(true)
    expect(icon?.classList.contains('text-yellow-600')).toBe(true)
  })

  it('should render with error colors', () => {
    props.type = BannerBoxEnum.ERROR
    const { getByTestId, queryByRole } = render(<BannerBox {...props} />)

    const box = getByTestId('banner-box')
    const icon = queryByRole('img')

    expect(box.classList.contains('border-red-500')).toBe(true)
    expect(box.classList.contains('bg-red-50')).toBe(true)
    expect(icon?.classList.contains('text-red-600')).toBe(true)
  })

  it('should render with default theme', () => {
    props.type = BannerBoxEnum.DEFAULT
    const { getByTestId, queryByRole } = render(<BannerBox {...props} />)

    const box = getByTestId('banner-box')
    const icon = queryByRole('img')

    expect(box.classList.contains('border-sky-500')).toBe(true)
    expect(box.classList.contains('bg-sky-50')).toBe(true)
    expect(icon?.classList.contains('text-sky-600')).toBe(true)
  })

  it('should render with info theme', () => {
    props.type = BannerBoxEnum.INFO
    const { getByTestId, queryByRole } = render(<BannerBox {...props} />)

    const box = getByTestId('banner-box')
    const icon = queryByRole('img')

    expect(box.classList.contains('border-neutral-300')).toBe(true)
    expect(box.classList.contains('bg-neutral-100')).toBe(true)
    expect(icon?.classList.contains('text-neutral-350')).toBe(true)
  })

  it('should display the icon inside a white circle', () => {
    props.type = BannerBoxEnum.DEFAULT
    const { baseElement } = render(<BannerBox {...props} iconInCircle />)

    const icon = getByRole(baseElement, 'img')

    expect(icon.parentElement?.classList).toContain('bg-white')
    expect(icon.parentElement?.classList).toContain('rounded-full')
  })

  it('should display the icon without color override', () => {
    props.type = BannerBoxEnum.DEFAULT
    const { baseElement } = render(<BannerBox {...props} iconRealColors />)

    const icon = getByRole(baseElement, 'img')

    expect(icon.classList).not.toContain('text-sky-600')
  })
})
